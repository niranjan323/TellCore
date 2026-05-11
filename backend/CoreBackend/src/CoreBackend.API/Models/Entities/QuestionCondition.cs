namespace CoreBackend.API.Models.Entities;

public class QuestionCondition : BaseEntity
{
    public Guid QuestionId { get; set; }
    public string DependsOnKey { get; set; } = string.Empty;
    public string Operator { get; set; } = "in";
    public string ValuesJson { get; set; } = "[]";
}
