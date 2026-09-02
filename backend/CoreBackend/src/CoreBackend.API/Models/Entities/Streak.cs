namespace CoreBackend.API.Models.Entities;

public class Streak : BaseEntity
{
    public Guid UserId { get; set; }
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public DateTime? LastEntryDate { get; set; }
}
