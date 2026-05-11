namespace CoreBackend.API.Models.Responses;

public record NavigationResponse(IReadOnlyList<NavigationItemResponse> Items);

public record NavigationItemResponse(
    string Key,
    string Label,
    string Route,
    string? Icon,
    int Order);
