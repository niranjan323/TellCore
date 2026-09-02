namespace CoreBackend.API.Models.Entities;

public class StoryTranslation : BaseEntity
{
    public Guid StoryId { get; set; }
    public string LanguageCode { get; set; } = "en";
    public string? Title { get; set; }
    public string ContentText { get; set; } = string.Empty;
    public string? Excerpt { get; set; }
    public bool IsAiGenerated { get; set; } = true;
}
