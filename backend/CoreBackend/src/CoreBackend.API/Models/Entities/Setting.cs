namespace CoreBackend.API.Models.Entities;

public class Setting : BaseEntity
{
    public Guid? ProductId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string DataType { get; set; } = "string";
    public string? Description { get; set; }
    public bool IsSecret { get; set; }
}
