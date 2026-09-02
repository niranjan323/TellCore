using CoreBackend.API.Models.Requests;
using CoreBackend.API.Models.Responses;
using CoreBackend.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace CoreBackend.API.Controllers;

[ApiController]
[Route("api/v1/auth")]
[EnableRateLimiting("auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    [HttpPost("guest")]
    public async Task<ActionResult<AuthResponse>> Guest([FromBody] GuestAuthRequest request, CancellationToken ct)
        => Ok(await _auth.CreateGuestAsync(request.DeviceToken, ct));

    [HttpPost("google")]
    public async Task<ActionResult<AuthResponse>> Google([FromBody] GoogleAuthRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.IdToken))
            return BadRequest(new { error = "idToken is required" });
        return Ok(await _auth.SignInWithGoogleAsync(request.IdToken, ct));
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrEmpty(request.Password))
            return BadRequest(new { error = "email and password are required" });
        var (result, error) = await _auth.RegisterAsync(request.Email, request.Password, request.Name, ct);
        return error is null ? Ok(result) : error switch
        {
            "email_in_use" or "email_uses_google" => Conflict(new { error }),
            _ => BadRequest(new { error }),
        };
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] PasswordLoginRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrEmpty(request.Password))
            return BadRequest(new { error = "email and password are required" });
        var (result, error) = await _auth.LoginWithPasswordAsync(request.Email, request.Password, ct);
        return error is null ? Ok(result) : Unauthorized(new { error });
    }

    [HttpGet("methods")]
    public async Task<ActionResult> Methods(CancellationToken ct)
        => Ok(new { methods = await _auth.GetEnabledMethodsAsync(ct) });

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh([FromBody] RefreshTokenRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
            return BadRequest(new { error = "refreshToken is required" });
        return Ok(await _auth.RefreshAsync(request.RefreshToken, ct));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest request, CancellationToken ct)
    {
        if (!string.IsNullOrWhiteSpace(request.RefreshToken))
            await _auth.LogoutAsync(request.RefreshToken, ct);
        return NoContent();
    }
}
