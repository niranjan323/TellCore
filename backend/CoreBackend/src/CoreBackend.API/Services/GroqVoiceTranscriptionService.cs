using System.Net.Http.Headers;
using System.Text.Json;
using CoreBackend.API.Repositories.Interfaces;
using CoreBackend.API.Services.Interfaces;

namespace CoreBackend.API.Services;

public class GroqVoiceTranscriptionService : IVoiceTranscriptionService
{
    private const string Endpoint = "https://api.groq.com/openai/v1/audio/transcriptions";
    private const string DefaultModel = "whisper-large-v3";

    private readonly HttpClient _http;
    private readonly ISettingsRepository _settings;
    private readonly ILogger<GroqVoiceTranscriptionService> _logger;

    public GroqVoiceTranscriptionService(
        HttpClient http,
        ISettingsRepository settings,
        ILogger<GroqVoiceTranscriptionService> logger)
    {
        _http = http;
        _settings = settings;
        _logger = logger;
    }

    public async Task<string?> TranscribeAsync(Stream audioStream, string fileName, string contentType, string languageCode, CancellationToken ct = default)
    {
        var apiKey = await _settings.GetValueAsync("ai.groq.apikey", null, ct);
        if (string.IsNullOrWhiteSpace(apiKey) || apiKey.Equals("YOUR_GROQ_KEY_HERE", StringComparison.OrdinalIgnoreCase))
            return null;

        var model = await _settings.GetValueAsync("ai.groq.whispermodel", null, ct) ?? DefaultModel;

        using var form = new MultipartFormDataContent();
        var audioContent = new StreamContent(audioStream);
        audioContent.Headers.ContentType = MediaTypeHeaderValue.Parse(contentType);
        form.Add(audioContent, "file", string.IsNullOrEmpty(fileName) ? "audio.webm" : fileName);
        form.Add(new StringContent(model), "model");
        if (!string.IsNullOrWhiteSpace(languageCode))
            form.Add(new StringContent(languageCode), "language");
        form.Add(new StringContent("json"), "response_format");

        using var msg = new HttpRequestMessage(HttpMethod.Post, Endpoint) { Content = form };
        msg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        try
        {
            using var resp = await _http.SendAsync(msg, ct);
            if (!resp.IsSuccessStatusCode)
            {
                var err = await resp.Content.ReadAsStringAsync(ct);
                _logger.LogWarning("Groq Whisper returned {Status}: {Body}", resp.StatusCode, err);
                return null;
            }
            using var stream = await resp.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
            return doc.RootElement.TryGetProperty("text", out var t) ? t.GetString() : null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Groq Whisper call failed");
            return null;
        }
    }
}
