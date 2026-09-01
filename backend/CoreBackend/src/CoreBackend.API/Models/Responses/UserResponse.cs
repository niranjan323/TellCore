namespace CoreBackend.API.Models.Responses;

public record UserResponse(
    Guid UserId,
    string UserType,
    string? Email,
    string? Name,
    string? PreferredLanguage,
    bool IsProfilePublic);
