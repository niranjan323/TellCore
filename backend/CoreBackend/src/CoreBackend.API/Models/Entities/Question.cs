namespace CoreBackend.API.Models.Entities;

public class Question : BaseEntity
{
    public Guid FormSetId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Type { get; set; } = "textinput";
    public int Order { get; set; }
    public bool IsRequired { get; set; }
    public string? Group { get; set; }
    public string? ConfigJson { get; set; }
}
