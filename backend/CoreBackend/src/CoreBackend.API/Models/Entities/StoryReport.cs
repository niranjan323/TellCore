namespace CoreBackend.API.Models.Entities;

public class StoryReport : BaseEntity
{
    public Guid StoryId { get; set; }
    public Guid ReporterUserId { get; set; }
    public string Reason { get; set; } = "other";
    public string? Details { get; set; }
    public string Status { get; set; } = "open";
}
