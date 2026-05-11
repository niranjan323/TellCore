namespace CoreBackend.API.Models.Requests;

public record CreateSessionRequest(
    string ProductSlug,
    Guid FormSetId,
    string LanguageCode);
