namespace CoreBackend.API.Models.Entities;

public class Story : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid ProductId { get; set; }
    public string? Title { get; set; }
    public string Kind { get; set; } = "text";              // text | voice
    public string? OriginalLanguage { get; set; }
    public string? RawText { get; set; }
    public string? ContentText { get; set; }
    public string? Excerpt { get; set; }
    public string? Summary { get; set; }
    public string? AudioUrl { get; set; }
    public string? AudioPath { get; set; }
    public int? DurationSeconds { get; set; }
    public int WordCount { get; set; }
    public string Visibility { get; set; } = "private";     // private | family | community
    public string Status { get; set; } = "draft";           // draft | processing | published | flagged
    public string? ModerationReason { get; set; }
    public string? PromptKey { get; set; }
    public bool IsFeatured { get; set; }
    public int HeartCount { get; set; }
    public int ViewCount { get; set; }
    public DateTime? PublishedAt { get; set; }
}
