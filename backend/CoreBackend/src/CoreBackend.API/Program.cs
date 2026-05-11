using System.Text;
using CoreBackend.API.Middleware;
using CoreBackend.API.Repositories;
using CoreBackend.API.Repositories.Interfaces;
using CoreBackend.API.Services;
using CoreBackend.API.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// ── Logging (Serilog) ────────────────────────────────────────────────────────
builder.Host.UseSerilog((ctx, _, cfg) => cfg
    .ReadFrom.Configuration(ctx.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console());

// ── Controllers / OpenAPI / Scalar ──────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHttpContextAccessor();

// ── CORS ─────────────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173", "http://localhost:5174" };
builder.Services.AddCors(opts =>
{
    opts.AddPolicy("default", p => p
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// ── Uploads size limit (multipart) ───────────────────────────────────────────
builder.Services.Configure<FormOptions>(o =>
{
    o.MultipartBodyLengthLimit = 20_000_000;
});

// ── JWT Authentication ───────────────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Jwt:Key is not configured.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "corebackend";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "tellcore-clients";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts =>
    {
        opts.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.FromMinutes(1),
        };
    });
builder.Services.AddAuthorization();

// ── Repositories ─────────────────────────────────────────────────────────────
builder.Services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();
builder.Services.AddScoped<ISettingsRepository, SettingsRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<INavigationRepository, NavigationRepository>();
builder.Services.AddScoped<IThemeRepository, ThemeRepository>();
builder.Services.AddScoped<IFormSetRepository, FormSetRepository>();
builder.Services.AddScoped<ISessionRepository, SessionRepository>();
builder.Services.AddScoped<IAnswerRepository, AnswerRepository>();
builder.Services.AddScoped<ISummaryRepository, SummaryRepository>();

// ── Services ────────────────────────────────────────────────────────────────
builder.Services.AddSingleton<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IResponseService, ResponseService>();
builder.Services.AddSingleton<ISummaryFormatterService, SummaryFormatterService>();
builder.Services.AddSingleton<IFileStorageService, LocalFileStorageService>();

builder.Services.AddHttpClient<IGoogleAuthService, GoogleAuthService>();

// ── AI provider selection via Settings.ai.provider (resolved at request time)
builder.Services.AddHttpClient<GroqAiSummaryService>();
builder.Services.AddHttpClient<GroqVoiceTranscriptionService>();
builder.Services.AddScoped<IAiSummaryService>(sp =>
{
    var settings = sp.GetRequiredService<ISettingsRepository>();
    var provider = settings.GetValueAsync("ai.provider").GetAwaiter().GetResult();
    return string.Equals(provider, "groq", StringComparison.OrdinalIgnoreCase)
        ? sp.GetRequiredService<GroqAiSummaryService>()
        : new NullAiSummaryService();
});
builder.Services.AddScoped<IVoiceTranscriptionService>(sp =>
{
    var settings = sp.GetRequiredService<ISettingsRepository>();
    var provider = settings.GetValueAsync("ai.provider").GetAwaiter().GetResult();
    return string.Equals(provider, "groq", StringComparison.OrdinalIgnoreCase)
        ? sp.GetRequiredService<GroqVoiceTranscriptionService>()
        : new NullVoiceTranscriptionService();
});

var app = builder.Build();

// ── Pipeline ─────────────────────────────────────────────────────────────────
app.UseSerilogRequestLogging();
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(opts =>
    {
        opts.WithTitle("TellCore CoreBackend API");
    });
}

app.UseHttpsRedirection();

// Serve uploads
var uploadsRoot = builder.Configuration["Storage:LocalPath"] ?? "uploads";
var uploadsAbsolute = Path.IsPathRooted(uploadsRoot)
    ? uploadsRoot
    : Path.Combine(app.Environment.ContentRootPath, uploadsRoot);
Directory.CreateDirectory(uploadsAbsolute);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsAbsolute),
    RequestPath = "/uploads",
});

app.UseCors("default");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
