namespace CoreBackend.API.Models.Entities;

public class Product : BaseEntity
{
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public Guid? DefaultThemeId { get; set; }
    public Guid? DefaultFormSetId { get; set; }
    public string DefaultLanguage { get; set; } = "en";
}
