namespace CoreBackend.API.Models.Entities;

public class Session : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid ProductId { get; set; }
    public Guid FormSetId { get; set; }
    public string LanguageCode { get; set; } = "en";
    public string Status { get; set; } = "in_progress";
    public string? VoiceNoteUrl { get; set; }
    public string? VoiceTranscript { get; set; }
    public DateTime? CompletedAt { get; set; }
}
