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
builder.Services.AddScoped<IStoryRepository, StoryRepository>();
builder.Services.AddScoped<IProfileRepository, ProfileRepository>();
builder.Services.AddScoped<IFamilyRepository, FamilyRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IBillingRepository, BillingRepository>();

// ── Services ────────────────────────────────────────────────────────────────
builder.Services.AddSingleton<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IResponseService, ResponseService>();
builder.Services.AddSingleton<ISummaryFormatterService, SummaryFormatterService>();
builder.Services.AddSingleton<IFileStorageService, LocalFileStorageService>();

builder.Services.AddHttpClient<IGoogleAuthService, GoogleAuthService>();

// ── TheUntold: stories, profile, vault, notifications, billing ──────────────
builder.Services.AddScoped<IStoryService, StoryService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IVaultService, VaultService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IBillingService, BillingService>();
builder.Services.AddScoped<IStoryProcessingService, StoryProcessingService>();
builder.Services.AddHttpClient<IAiPipelineClient, AiPipelineClient>();
builder.Services.AddSingleton<IStoryProcessingQueue, StoryProcessingQueue>();
builder.Services.AddHostedService<StoryProcessingWorker>();

// ── Rate limiting (per client IP; global fixed window) ───────────────────────
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.GlobalLimiter = System.Threading.RateLimiting.PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
        System.Threading.RateLimiting.RateLimitPartition.GetFixedWindowLimiter(
            ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new System.Threading.RateLimiting.FixedWindowRateLimiterOptions
            {
                PermitLimit = 300,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));
    // Tighter window on credential endpoints (brute-force protection).
    options.AddPolicy("auth", ctx =>
        System.Threading.RateLimiting.RateLimitPartition.GetFixedWindowLimiter(
            ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new System.Threading.RateLimiting.FixedWindowRateLimiterOptions
            {
                PermitLimit = 20,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));
});

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

// Baseline security headers on every response.
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Referrer-Policy"] = "no-referrer";
    await next();
});

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
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
