using CoreBackend.API.Models.Responses;

namespace CoreBackend.API.Services.Interfaces;

public interface ISummaryFormatterService
{
    SummaryResult FormatAsync(AiSummaryRequest request);
}

public record SummaryResult(
    string Title,
    string? Subtitle,
    string? Disclaimer,
    IReadOnlyList<SummarySection> Sections);
