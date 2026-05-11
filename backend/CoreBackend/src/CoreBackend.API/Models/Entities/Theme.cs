namespace CoreBackend.API.Models.Entities;

public class Theme : BaseEntity
{
    public Guid ProductId { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
}
