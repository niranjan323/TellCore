namespace CoreBackend.API.Models.Entities;

public class QuestionOptionTranslation : BaseEntity
{
    public Guid QuestionOptionId { get; set; }
    public string LanguageCode { get; set; } = "en";
    public string Label { get; set; } = string.Empty;
}
