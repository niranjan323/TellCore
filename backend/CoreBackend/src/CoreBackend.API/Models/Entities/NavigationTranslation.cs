namespace CoreBackend.API.Models.Entities;

public class NavigationTranslation : BaseEntity
{
    public Guid NavigationItemId { get; set; }
    public string LanguageCode { get; set; } = "en";
    public string Label { get; set; } = string.Empty;
}
