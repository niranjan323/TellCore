namespace CoreBackend.API.Models.Entities;

public class QuestionOption : BaseEntity
{
    public Guid QuestionId { get; set; }
    public string Value { get; set; } = string.Empty;
    public int Order { get; set; }
}
