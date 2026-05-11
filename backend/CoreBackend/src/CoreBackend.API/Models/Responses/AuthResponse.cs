namespace CoreBackend.API.Models.Responses;

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    string UserType,
    Guid UserId,
    string? Email);
