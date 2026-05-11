namespace CoreBackend.API.Models.Entities;

public class Answer : BaseEntity
{
    public Guid SessionId { get; set; }
    public Guid QuestionId { get; set; }
    public string QuestionKey { get; set; } = string.Empty;
    public string ValueJson { get; set; } = string.Empty;
}
