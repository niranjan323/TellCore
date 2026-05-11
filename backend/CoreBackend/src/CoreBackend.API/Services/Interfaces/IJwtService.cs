using System.Security.Claims;
using CoreBackend.API.Models.Entities;

namespace CoreBackend.API.Services.Interfaces;

public interface IJwtService
{
    string GenerateAccessToken(User user, TimeSpan? lifetime = null);
    string GenerateRefreshToken();
    ClaimsPrincipal? ValidateToken(string token);
}
