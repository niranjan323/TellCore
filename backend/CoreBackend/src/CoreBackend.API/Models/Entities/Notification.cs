namespace CoreBackend.API.Models.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public string Kind { get; set; } = string.Empty;        // daily-prompt | story-featured | story-loved | family-shared
    public string Title { get; set; } = string.Empty;
    public string? Body { get; set; }
    public string? LinkRoute { get; set; }
    public bool IsRead { get; set; }
}
