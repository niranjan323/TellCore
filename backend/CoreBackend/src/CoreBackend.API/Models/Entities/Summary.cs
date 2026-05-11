namespace CoreBackend.API.Models.Entities;

public class Summary : BaseEntity
{
    public Guid SessionId { get; set; }
    public string LanguageCode { get; set; } = "en";
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string? Disclaimer { get; set; }
    public string SectionsJson { get; set; } = "[]";
    public bool IsAiGenerated { get; set; }
    public string? AiProvider { get; set; }
    public string? AiModel { get; set; }
    public DateTime GeneratedAt { get; set; }
}
