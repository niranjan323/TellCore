using System.Security.Claims;
using CoreBackend.API.Models.Responses;
using CoreBackend.API.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreBackend.API.Controllers;

[ApiController]
[Route("api/v1/users/me")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _users;
    private readonly ISessionRepository _sessions;

    public UsersController(IUserRepository users, ISessionRepository sessions)
    {
        _users = users;
        _sessions = sessions;
    }

    [HttpGet]
    public async Task<ActionResult<UserResponse>> Me(CancellationToken ct)
    {
        var userId = GetUserId();
        var user = await _users.GetByIdAsync(userId, ct);
        if (user is null) return NotFound();
        return Ok(new UserResponse(user.Id, user.UserType, user.Email, user.Name, user.PreferredLanguage));
    }

    [HttpGet("sessions")]
    public async Task<ActionResult<SessionHistoryResponse>> Sessions(CancellationToken ct)
    {
        var userId = GetUserId();
        var user = await _users.GetByIdAsync(userId, ct);
        if (user is null) return NotFound();
        if (user.UserType == "guest")
            return Ok(new SessionHistoryResponse(Array.Empty<SessionHistoryItem>()));

        var items = await _sessions.GetHistoryForUserAsync(userId, ct);
        return Ok(new SessionHistoryResponse(items));
    }

    [HttpDelete]
    public async Task<IActionResult> Delete(CancellationToken ct)
    {
        var userId = GetUserId();
        await _users.RevokeAllRefreshTokensForUserAsync(userId, ct);
        await _sessions.SoftDeleteAllForUserAsync(userId, ct);
        await _users.SoftDeleteAsync(userId, ct);
        return NoContent();
    }

    private Guid GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? throw new UnauthorizedAccessException("Missing user identity.");
        return Guid.Parse(sub);
    }
}
