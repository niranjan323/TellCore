using CoreBackend.API.Models.Responses;
using CoreBackend.API.Services.Interfaces;

namespace CoreBackend.API.Services;

public class NullAiSummaryService : IAiSummaryService
{
    public Task<AiSummaryResult?> GenerateSummaryAsync(AiSummaryRequest request, CancellationToken ct = default)
        => Task.FromResult<AiSummaryResult?>(null);
}

public class NullVoiceTranscriptionService : IVoiceTranscriptionService
{
    public Task<string?> TranscribeAsync(Stream audioStream, string fileName, string contentType, string languageCode, CancellationToken ct = default)
        => Task.FromResult<string?>(null);
}
