namespace CoreBackend.API.Models.Requests;

public class CreateStoryRequest
{
    public string ProductSlug { get; set; } = "theuntold";
    public string? Title { get; set; }
    public string? Text { get; set; }
    public string Kind { get; set; } = "text";              // text | voice
    public string Visibility { get; set; } = "private";     // private | family | community
    public string? PromptKey { get; set; }
    public List<string> Tags { get; set; } = new();
}

public class ReportStoryRequest
{
    public string Reason { get; set; } = "other";
    public string? Details { get; set; }
}

public class UpdateStoryRequest
{
    public string? Title { get; set; }
    public string? Text { get; set; }
    public string? Visibility { get; set; }
    public List<string>? Tags { get; set; }
}
