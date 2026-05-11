namespace CoreBackend.API.Models.Entities;

public class IntroTranslation : BaseEntity
{
    public Guid IntroId { get; set; }
    public string LanguageCode { get; set; } = "en";
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string? Body { get; set; }
    public string? AudioUrl { get; set; }
    public string? PrimaryButtonLabel { get; set; }
}
