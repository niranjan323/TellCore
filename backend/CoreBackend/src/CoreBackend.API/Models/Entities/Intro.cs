namespace CoreBackend.API.Models.Entities;

public class Intro : BaseEntity
{
    public Guid FormSetId { get; set; }
    public string? IconKey { get; set; }
    public string? PrimaryButtonRoute { get; set; }
    public bool VoiceNoteEnabled { get; set; }
}
