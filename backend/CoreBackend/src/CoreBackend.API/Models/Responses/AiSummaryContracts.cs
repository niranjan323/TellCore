namespace CoreBackend.API.Models.Responses;

public record AiSummaryRequest(
    string ProductSlug,
    string FormSetSlug,
    string LanguageCode,
    IReadOnlyList<AiQuestionAnswer> Answers,
    string? VoiceTranscript,
    IReadOnlyList<AiSummaryTemplateSection> TemplateSections);

public record AiQuestionAnswer(
    string Key,
    string Label,
    string Value);

public record AiSummaryTemplateSection(
    string Key,
    string Title,
    IReadOnlyList<string> QuestionKeys,
    string? PromptHint);

public record AiSummaryResult(
    string Title,
    string? Subtitle,
    string? Disclaimer,
    IReadOnlyList<SummarySection> Sections,
    string Provider,
    string Model);
