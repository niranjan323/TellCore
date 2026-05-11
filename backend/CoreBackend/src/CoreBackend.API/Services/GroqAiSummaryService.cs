using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using CoreBackend.API.Models.Responses;
using CoreBackend.API.Repositories.Interfaces;
using CoreBackend.API.Services.Interfaces;

namespace CoreBackend.API.Services;

public class GroqAiSummaryService : IAiSummaryService
{
    private const string Endpoint = "https://api.groq.com/openai/v1/chat/completions";
    private const string DefaultModel = "llama-3.3-70b-versatile";

    private readonly HttpClient _http;
    private readonly ISettingsRepository _settings;
    private readonly ILogger<GroqAiSummaryService> _logger;

    public GroqAiSummaryService(
        HttpClient http,
        ISettingsRepository settings,
        ILogger<GroqAiSummaryService> logger)
    {
        _http = http;
        _settings = settings;
        _logger = logger;
    }

    public async Task<AiSummaryResult?> GenerateSummaryAsync(AiSummaryRequest request, CancellationToken ct = default)
    {
        var apiKey = await _settings.GetValueAsync("ai.groq.apikey", null, ct);
        if (string.IsNullOrWhiteSpace(apiKey) || apiKey.Equals("YOUR_GROQ_KEY_HERE", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogInformation("Groq API key not configured; falling back to null summary.");
            return null;
        }

        var model = await _settings.GetValueAsync("ai.groq.model", null, ct) ?? DefaultModel;

        var systemPrompt = BuildSystemPrompt(request);
        var userPrompt = BuildUserPrompt(request);

        var body = new
        {
            model,
            response_format = new { type = "json_object" },
            temperature = 0.2,
            messages = new object[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userPrompt },
            },
        };

        using var msg = new HttpRequestMessage(HttpMethod.Post, Endpoint)
        {
            Content = JsonContent.Create(body),
        };
        msg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        try
        {
            using var resp = await _http.SendAsync(msg, ct);
            if (!resp.IsSuccessStatusCode)
            {
                var err = await resp.Content.ReadAsStringAsync(ct);
                _logger.LogWarning("Groq returned {Status}: {Body}", resp.StatusCode, err);
                return null;
            }

            using var stream = await resp.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
            var content = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            if (string.IsNullOrWhiteSpace(content)) return null;

            using var inner = JsonDocument.Parse(content);
            var root = inner.RootElement;
            var title = root.TryGetProperty("title", out var t) ? t.GetString() ?? "Summary" : "Summary";
            var subtitle = root.TryGetProperty("subtitle", out var st) ? st.GetString() : null;
            var disclaimer = root.TryGetProperty("disclaimer", out var d) ? d.GetString() : null;

            var sections = new List<SummarySection>();
            if (root.TryGetProperty("sections", out var arr) && arr.ValueKind == JsonValueKind.Array)
            {
                var order = 0;
                foreach (var s in arr.EnumerateArray())
                {
                    var key = s.TryGetProperty("key", out var k) ? k.GetString() ?? $"section-{order}" : $"section-{order}";
                    var stitle = s.TryGetProperty("title", out var ti) ? ti.GetString() ?? key : key;
                    var sbody = s.TryGetProperty("body", out var bo) ? bo.GetString() ?? string.Empty : string.Empty;
                    sections.Add(new SummarySection(key, stitle, sbody, ++order));
                }
            }

            if (sections.Count == 0) return null;

            return new AiSummaryResult(title, subtitle, disclaimer, sections, "groq", model);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Groq summary call failed");
            return null;
        }
    }

    private static string BuildSystemPrompt(AiSummaryRequest request)
    {
        var sb = new StringBuilder();
        sb.AppendLine("You organise a patient's notes for their doctor visit.");
        sb.AppendLine("Rules:");
        sb.AppendLine("- Never diagnose. Never recommend treatment. Only organise what the patient wrote.");
        sb.AppendLine("- Remove filler. Keep facts. Use neutral, clear language.");
        sb.AppendLine($"- Output language: {request.LanguageCode}.");
        sb.AppendLine("- Respond with a JSON object: {\"title\": string, \"subtitle\": string, \"disclaimer\": string, \"sections\": [{\"key\": string, \"title\": string, \"body\": string}]}");
        return sb.ToString();
    }

    private static string BuildUserPrompt(AiSummaryRequest request)
    {
        var payload = new
        {
            product = request.ProductSlug,
            formSet = request.FormSetSlug,
            language = request.LanguageCode,
            answers = request.Answers.Select(a => new { a.Key, a.Label, a.Value }),
            voiceTranscript = request.VoiceTranscript,
            templateSections = request.TemplateSections.Select(t => new
            {
                t.Key,
                t.Title,
                t.QuestionKeys,
                t.PromptHint,
            }),
        };
        return JsonSerializer.Serialize(payload);
    }
}
