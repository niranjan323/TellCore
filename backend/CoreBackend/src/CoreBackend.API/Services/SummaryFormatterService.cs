using System.Text;
using CoreBackend.API.Models.Responses;
using CoreBackend.API.Services.Interfaces;

namespace CoreBackend.API.Services;

public class SummaryFormatterService : ISummaryFormatterService
{
    public SummaryResult FormatAsync(AiSummaryRequest request)
    {
        var answersByKey = request.Answers.ToDictionary(a => a.Key, a => a, StringComparer.OrdinalIgnoreCase);

        var sections = new List<SummarySection>();
        var order = 0;

        if (request.TemplateSections.Count > 0)
        {
            foreach (var template in request.TemplateSections)
            {
                var body = BuildSectionBody(template.QuestionKeys, answersByKey);
                if (string.IsNullOrWhiteSpace(body)) continue;
                sections.Add(new SummarySection(template.Key, template.Title, body, ++order));
            }
        }
        else
        {
            foreach (var a in request.Answers)
            {
                if (string.IsNullOrWhiteSpace(a.Value)) continue;
                sections.Add(new SummarySection(a.Key, a.Label, a.Value, ++order));
            }
        }

        if (!string.IsNullOrWhiteSpace(request.VoiceTranscript))
        {
            sections.Add(new SummarySection(
                "voice_note", "Voice note", request.VoiceTranscript!, ++order));
        }

        var title = request.FormSetSlug switch
        {
            "general-visit" => "Pre-visit summary",
            _ => "Summary",
        };

        return new SummaryResult(
            Title: title,
            Subtitle: $"Prepared on {DateTime.UtcNow:yyyy-MM-dd}",
            Disclaimer: "This summary is for organising what you want to share with your doctor. It is not medical advice.",
            Sections: sections);
    }

    private static string BuildSectionBody(
        IReadOnlyList<string> questionKeys,
        IReadOnlyDictionary<string, AiQuestionAnswer> answersByKey)
    {
        var sb = new StringBuilder();
        foreach (var key in questionKeys)
        {
            if (!answersByKey.TryGetValue(key, out var a)) continue;
            if (string.IsNullOrWhiteSpace(a.Value)) continue;
            sb.Append("• ").Append(a.Label).Append(": ").AppendLine(a.Value);
        }
        return sb.ToString().Trim();
    }
}
