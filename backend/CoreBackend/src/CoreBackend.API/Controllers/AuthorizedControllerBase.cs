using System.Security.Claims;
using CoreBackend.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace CoreBackend.API.Controllers;

/// <summary>Shared claim access + service-error mapping for authorized endpoints.</summary>
public abstract class AuthorizedControllerBase : ControllerBase
{
    protected Guid GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? throw new UnauthorizedAccessException("Missing user identity.");
        return Guid.Parse(sub);
    }

    protected string GetUserType() => User.FindFirstValue(JwtService.ClaimUserType) ?? "guest";

    /// <summary>Maps service error codes to HTTP results.</summary>
    protected ActionResult ErrorResult(string error) => error switch
    {
        "not_found" => NotFound(new { error }),
        "forbidden" => Forbid(),
        "story_limit_reached" => StatusCode(StatusCodes.Status403Forbidden, new { error, message = "Free story limit reached — upgrade to keep writing." }),
        "billing_not_configured" => StatusCode(StatusCodes.Status503ServiceUnavailable, new { error }),
        "invite_used" or "invite_expired" or "invite_own" or "already_member" => Conflict(new { error }),
        _ => BadRequest(new { error }),
    };
}
