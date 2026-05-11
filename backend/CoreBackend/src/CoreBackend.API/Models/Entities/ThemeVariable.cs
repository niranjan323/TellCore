namespace CoreBackend.API.Models.Entities;

public class ThemeVariable : BaseEntity
{
    public Guid ThemeId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
