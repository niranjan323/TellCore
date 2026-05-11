using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using CoreBackend.API.Models.Entities;
using CoreBackend.API.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;

namespace CoreBackend.API.Services;

public class JwtService : IJwtService
{
    public const string ClaimUserType = "user_type";

    private readonly IConfiguration _configuration;
    private readonly string _key;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _defaultAccessMinutes;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
        _key = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured.");
        if (Encoding.UTF8.GetByteCount(_key) < 32)
            throw new InvalidOperationException("Jwt:Key must be at least 32 bytes long.");
        _issuer = _configuration["Jwt:Issuer"] ?? "corebackend";
        _audience = _configuration["Jwt:Audience"] ?? "tellcore-clients";
        _defaultAccessMinutes = int.TryParse(_configuration["Jwt:AccessTokenExpiryMinutes"], out var m) ? m : 60;
    }

    public string GenerateAccessToken(User user, TimeSpan? lifetime = null)
    {
        var lifeMinutes = lifetime?.TotalMinutes ?? _defaultAccessMinutes;
        var now = DateTime.UtcNow;
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimUserType, user.UserType),
            new(ClaimTypes.Role, user.UserType),
        };
        if (!string.IsNullOrEmpty(user.Email))
            claims.Add(new Claim(JwtRegisteredClaimNames.Email, user.Email));
        if (!string.IsNullOrEmpty(user.Name))
            claims.Add(new Claim(JwtRegisteredClaimNames.Name, user.Name));

        var creds = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            notBefore: now,
            expires: now.AddMinutes(lifeMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        try
        {
            var principal = handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = _issuer,
                ValidAudience = _audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key)),
                ClockSkew = TimeSpan.FromMinutes(1),
            }, out _);
            return principal;
        }
        catch
        {
            return null;
        }
    }
}
