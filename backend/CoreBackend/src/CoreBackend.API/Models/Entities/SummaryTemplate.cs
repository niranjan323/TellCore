namespace CoreBackend.API.Models.Entities;

public class SummaryTemplate : BaseEntity
{
    public Guid FormSetId { get; set; }
    public string SectionKey { get; set; } = string.Empty;
    public string SectionTitle { get; set; } = string.Empty;
    public int Order { get; set; }
    public string QuestionKeysJson { get; set; } = "[]";
    public string? PromptHint { get; set; }
}
