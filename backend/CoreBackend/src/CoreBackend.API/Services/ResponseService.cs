using System.Text.Json;
using CoreBackend.API.Models.Entities;
using CoreBackend.API.Models.Requests;
using CoreBackend.API.Models.Responses;
using CoreBackend.API.Repositories.Interfaces;
using CoreBackend.API.Services.Interfaces;

namespace CoreBackend.API.Services;

public class ResponseService : IResponseService
{
    private readonly ISessionRepository _sessions;
    private readonly IFormSetRepository _formSets;
    private readonly IProductRepository _products;
    private readonly IAnswerRepository _answers;
    private readonly ISummaryRepository _summaries;
    private readonly IAiSummaryService _ai;
    private readonly ISummaryFormatterService _ruleBased;
    private readonly ILogger<ResponseService> _logger;

    public ResponseService(
        ISessionRepository sessions,
        IFormSetRepository formSets,
        IProductRepository products,
        IAnswerRepository answers,
        ISummaryRepository summaries,
        IAiSummaryService ai,
        ISummaryFormatterService ruleBased,
        ILogger<ResponseService> logger)
    {
        _sessions = sessions;
        _formSets = formSets;
        _products = products;
        _answers = answers;
        _summaries = summaries;
        _ai = ai;
        _ruleBased = ruleBased;
        _logger = logger;
    }

    public async Task<SummaryResponse> SubmitAsync(SubmitResponseRequest request, Guid userId, CancellationToken ct = default)
    {
        var session = await _sessions.GetByIdAsync(request.SessionId, ct)
            ?? throw new InvalidOperationException("Session not found.");
        if (session.UserId != userId)
            throw new UnauthorizedAccessException("Session does not belong to this user.");

        var product = await _products.GetByIdAsync(session.ProductId, ct)
            ?? throw new InvalidOperationException("Product not found.");
        var formSet = await _formSets.GetByIdAsync(request.FormSetId, ct)
            ?? throw new InvalidOperationException("Form set not found.");

        var lang = string.IsNullOrWhiteSpace(request.LanguageCode) ? session.LanguageCode : request.LanguageCode;
        var questions = await _formSets.GetQuestionsAsync(formSet.Id, ct);
        var templates = await _formSets.GetSummaryTemplatesAsync(formSet.Id, ct);

        var loadedForm = await _formSets.LoadFullAsync(formSet.Id, lang, ct);

        // Persist answers (only ones matching real question keys)
        var answersToInsert = new List<Answer>();
        foreach (var q in questions)
        {
            if (!request.Answers.TryGetValue(q.Key, out var val)) continue;
            answersToInsert.Add(new Answer
            {
                Id = Guid.NewGuid(),
                SessionId = session.Id,
                QuestionId = q.Id,
                QuestionKey = q.Key,
                ValueJson = val.GetRawText(),
            });
        }
        if (answersToInsert.Count > 0)
            await _answers.UpsertBulkAsync(answersToInsert, ct);

        // Update voice URL on session if provided
        if (!string.IsNullOrWhiteSpace(request.VoiceNoteUrl) && session.VoiceNoteUrl != request.VoiceNoteUrl)
            await _sessions.UpdateVoiceAsync(session.Id, request.VoiceNoteUrl!, session.VoiceTranscript, ct);

        // Build AI input
        var labelMap = loadedForm?.Questions.ToDictionary(q => q.Key, q => q.Label, StringComparer.OrdinalIgnoreCase)
            ?? questions.ToDictionary(q => q.Key, q => q.Key, StringComparer.OrdinalIgnoreCase);

        var aiAnswers = answersToInsert
            .Select(a => new AiQuestionAnswer(
                a.QuestionKey,
                labelMap.TryGetValue(a.QuestionKey, out var label) ? label : a.QuestionKey,
                FlattenAnswerValue(a.ValueJson)))
            .ToList();

        var aiTemplates = templates
            .Select(t => new AiSummaryTemplateSection(
                t.SectionKey,
                t.SectionTitle,
                SafeDeserializeKeys(t.QuestionKeysJson),
                t.PromptHint))
            .ToList();

        var aiRequest = new AiSummaryRequest(
            ProductSlug: product.Slug,
            FormSetSlug: formSet.Slug,
            LanguageCode: lang,
            Answers: aiAnswers,
            VoiceTranscript: session.VoiceTranscript,
            TemplateSections: aiTemplates);

        // AI summary attempt → fallback to rule-based
        AiSummaryResult? aiResult = null;
        try
        {
            aiResult = await _ai.GenerateSummaryAsync(aiRequest, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "AI summary generation threw; falling back to rule-based.");
        }

        SummaryResponse response;
        var generatedAt = DateTime.UtcNow;

        if (aiResult is not null)
        {
            response = new SummaryResponse(
                session.Id, aiResult.Title, aiResult.Subtitle, aiResult.Disclaimer,
                aiResult.Sections, IsAiGenerated: true, GeneratedAt: generatedAt);

            await PersistSummaryAsync(session.Id, lang, response, aiResult.Provider, aiResult.Model, isAi: true, ct);
        }
        else
        {
            var rule = _ruleBased.FormatAsync(aiRequest);
            response = new SummaryResponse(
                session.Id, rule.Title, rule.Subtitle, rule.Disclaimer,
                rule.Sections, IsAiGenerated: false, GeneratedAt: generatedAt);

            await PersistSummaryAsync(session.Id, lang, response, provider: null, model: null, isAi: false, ct);
        }

        await _sessions.MarkCompletedAsync(session.Id, ct);
        return response;
    }

    public async Task<SummaryResponse?> GetSummaryAsync(Guid sessionId, Guid userId, CancellationToken ct = default)
    {
        var session = await _sessions.GetByIdAsync(sessionId, ct);
        if (session is null) return null;
        if (session.UserId != userId)
            throw new UnauthorizedAccessException("Session does not belong to this user.");
        return await _summaries.GetLatestForSessionAsync(sessionId, ct);
    }

    private async Task PersistSummaryAsync(
        Guid sessionId, string lang, SummaryResponse response,
        string? provider, string? model, bool isAi, CancellationToken ct)
    {
        var entity = new Summary
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            LanguageCode = lang,
            Title = response.Title,
            Subtitle = response.Subtitle,
            Disclaimer = response.Disclaimer,
            SectionsJson = JsonSerializer.Serialize(response.Sections),
            IsAiGenerated = isAi,
            AiProvider = provider,
            AiModel = model,
            GeneratedAt = response.GeneratedAt,
        };
        await _summaries.InsertAsync(entity, ct);
    }

    private static IReadOnlyList<string> SafeDeserializeKeys(string json)
    {
        if (string.IsNullOrWhiteSpace(json)) return Array.Empty<string>();
        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
        }
        catch
        {
            return Array.Empty<string>();
        }
    }

    private static string FlattenAnswerValue(string valueJson)
    {
        if (string.IsNullOrWhiteSpace(valueJson)) return string.Empty;
        try
        {
            using var doc = JsonDocument.Parse(valueJson);
            return FlattenElement(doc.RootElement);
        }
        catch
        {
            return valueJson;
        }
    }

    private static string FlattenElement(JsonElement el)
    {
        switch (el.ValueKind)
        {
            case JsonValueKind.String: return el.GetString() ?? string.Empty;
            case JsonValueKind.Number: return el.GetRawText();
            case JsonValueKind.True: return "yes";
            case JsonValueKind.False: return "no";
            case JsonValueKind.Null: return string.Empty;
            case JsonValueKind.Array:
                return string.Join(", ", el.EnumerateArray().Select(FlattenElement).Where(s => !string.IsNullOrWhiteSpace(s)));
            case JsonValueKind.Object:
                return string.Join("; ", el.EnumerateObject().Select(p => $"{p.Name}: {FlattenElement(p.Value)}"));
            default:
                return el.GetRawText();
        }
    }
}
