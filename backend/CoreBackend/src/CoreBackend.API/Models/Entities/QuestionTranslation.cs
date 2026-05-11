namespace CoreBackend.API.Models.Entities;

public class QuestionTranslation : BaseEntity
{
    public Guid QuestionId { get; set; }
    public string LanguageCode { get; set; } = "en";
    public string Label { get; set; } = string.Empty;
    public string? Placeholder { get; set; }
    public string? HelpText { get; set; }
}
