using CoreBackend.API.Models.Responses;

namespace CoreBackend.API.Services.Interfaces;

public interface IAiSummaryService
{
    Task<AiSummaryResult?> GenerateSummaryAsync(AiSummaryRequest request, CancellationToken ct = default);
}

public interface IVoiceTranscriptionService
{
    Task<string?> TranscribeAsync(Stream audioStream, string fileName, string contentType, string languageCode, CancellationToken ct = default);
}
