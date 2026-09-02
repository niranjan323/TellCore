namespace CoreBackend.API.Models.Entities;

public class StoryComment : BaseEntity
{
    public Guid StoryId { get; set; }
    public Guid UserId { get; set; }
    public string Body { get; set; } = string.Empty;
}
