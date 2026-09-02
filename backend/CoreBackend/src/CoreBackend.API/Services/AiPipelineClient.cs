using System.Text.Json;
using CoreBackend.API.Models.Responses;
using CoreBackend.API.Repositories.Interfaces;
using CoreBackend.API.Services.Interfaces;

namespace CoreBackend.API.Services;

public class AiPipelineClient : IAiPipelineClient
{
    private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

    private readonly HttpClient _http;
    private readonly ISettingsRepository _settings;
    private readonly ILogger<AiPipelineClient> _logger;

    public AiPipelineClient(HttpClient http, ISettingsRepository settings, ILogger<AiPipelineClient> logger)
    {
        _http = http;
        _http.Timeout = TimeSpan.FromSeconds(120);
        _settings = settings;
        _logger = logger;
    }

    public async Task<AiPipelineResult?> ProcessStoryAsync(
        string? text, Stream? audio, string? audioFileName, string kind, string? titleHint,
        CancellationToken ct = default)
    {
        try
        {
            var (baseUrl, secret) = await GetConfigAsync(ct);
            if (baseUrl is null) return null;

            using var form = new MultipartFormDataContent();
            form.Add(new StringContent(kind), "kind");
            if (!string.IsNullOrWhiteSpace(text)) form.Add(new StringContent(text), "text");
            if (!string.IsNullOrWhiteSpace(titleHint)) form.Add(new StringContent(titleHint), "title_hint");
            if (audio is not null)
            {
                var audioContent = new StreamContent(audio);
                audioContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");
                form.Add(audioContent, "audio", audioFileName ?? "audio.webm");
            }

            using var request = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl.TrimEnd('/')}/v1/process-story") { Content = form };
            if (secret is not null) request.Headers.Add("X-Internal-Secret", secret);

            using var response = await _http.SendAsync(request, ct);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("AI pipeline process-story returned {Status}", response.StatusCode);
                return null;
            }
            await using var stream = await response.Content.ReadAsStreamAsync(ct);
            return await JsonSerializer.DeserializeAsync<AiPipelineResult>(stream, JsonOpts, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "AI pipeline unavailable for process-story");
            return null;
        }
    }

    public async Task<float[]?> EmbedQueryAsync(string query, CancellationToken ct = default)
    {
        try
        {
            var (baseUrl, secret) = await GetConfigAsync(ct);
            if (baseUrl is null) return null;

            using var request = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl.TrimEnd('/')}/v1/embed-query")
            {
                Content = new StringContent(JsonSerializer.Serialize(new { query }), System.Text.Encoding.UTF8, "application/json"),
            };
            if (secret is not null) request.Headers.Add("X-Internal-Secret", secret);

            using var response = await _http.SendAsync(request, ct);
            if (!response.IsSuccessStatusCode) return null;
            await using var stream = await response.Content.ReadAsStreamAsync(ct);
            var result = await JsonSerializer.DeserializeAsync<AiEmbedQueryResult>(stream, JsonOpts, ct);
            return result?.Embedding;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "AI pipeline unavailable for embed-query");
            return null;
        }
    }

    public async Task<AiTranslateResult?> TranslateAsync(string text, string? title, string targetLanguage, CancellationToken ct = default)
    {
        try
        {
            var (baseUrl, secret) = await GetConfigAsync(ct);
            if (baseUrl is null) return null;

            using var request = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl.TrimEnd('/')}/v1/translate")
            {
                Content = new StringContent(
                    JsonSerializer.Serialize(new { text, title, targetLanguage }),
                    System.Text.Encoding.UTF8, "application/json"),
            };
            if (secret is not null) request.Headers.Add("X-Internal-Secret", secret);

            using var response = await _http.SendAsync(request, ct);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("AI pipeline translate returned {Status}", response.StatusCode);
                return null;
            }
            await using var stream = await response.Content.ReadAsStreamAsync(ct);
            return await JsonSerializer.DeserializeAsync<AiTranslateResult>(stream, JsonOpts, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "AI pipeline unavailable for translate");
            return null;
        }
    }

    private async Task<(string? BaseUrl, string? Secret)> GetConfigAsync(CancellationToken ct)
    {
        var baseUrl = await _settings.GetValueAsync("ai.pipeline.url", ct: ct);
        if (string.IsNullOrWhiteSpace(baseUrl)) return (null, null);
        var secret = await _settings.GetValueAsync("ai.pipeline.sharedsecret", ct: ct);
        if (string.IsNullOrWhiteSpace(secret) || secret.StartsWith("YOUR_", StringComparison.Ordinal)) secret = null;
        return (baseUrl, secret);
    }
}
