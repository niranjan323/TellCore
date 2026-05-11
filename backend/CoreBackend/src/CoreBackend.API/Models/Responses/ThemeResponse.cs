namespace CoreBackend.API.Models.Responses;

public record ThemeResponse(
    string Slug,
    string Name,
    IReadOnlyDictionary<string, string> Variables);
