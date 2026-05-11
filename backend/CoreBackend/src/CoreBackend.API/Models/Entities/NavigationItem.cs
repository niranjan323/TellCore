namespace CoreBackend.API.Models.Entities;

public class NavigationItem : BaseEntity
{
    public Guid ProductId { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Route { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public int Order { get; set; }
    public string RequiredRole { get; set; } = "guest";
    public bool IsVisible { get; set; } = true;
}
