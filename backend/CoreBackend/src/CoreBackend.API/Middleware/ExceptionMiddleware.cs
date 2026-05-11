using System.Text.Json;

namespace CoreBackend.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (UnauthorizedAccessException ex)
        {
            await WriteProblemAsync(context, StatusCodes.Status401Unauthorized, "Unauthorized", ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            await WriteProblemAsync(context, StatusCodes.Status400BadRequest, "Bad request", ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception on {Method} {Path}", context.Request.Method, context.Request.Path);
            await WriteProblemAsync(context, StatusCodes.Status500InternalServerError, "Internal Server Error", "An unexpected error occurred.");
        }
    }

    private static async Task WriteProblemAsync(HttpContext context, int status, string title, string detail)
    {
        if (context.Response.HasStarted) return;
        context.Response.StatusCode = status;
        context.Response.ContentType = "application/problem+json";
        var payload = new
        {
            type = $"https://httpstatuses.io/{status}",
            title,
            status,
            detail,
            traceId = context.TraceIdentifier,
        };
        await context.Response.WriteAsync(JsonSerializer.Serialize(payload));
    }
}
