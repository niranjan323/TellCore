namespace CoreBackend.API.Models.Responses;

public record ProductConfigResponse(
    string Slug,
    string Name,
    string DefaultLanguage,
    string? DefaultThemeSlug,
    string? DefaultFormSetSlug,
    IReadOnlyList<string> SupportedLanguages);
