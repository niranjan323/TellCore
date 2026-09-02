namespace CoreBackend.API.Models.Responses;

public record NotificationResponse(Guid Id, string Kind, string Title, string Body, DateTime CreatedAt, bool Read, string? LinkRoute);
