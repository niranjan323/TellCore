namespace CoreBackend.API.Models.Responses;

public record FormSetResponse(
    Guid FormSetId,
    string Slug,
    string Name,
    string LanguageCode,
    IntroResponse? Intro,
    IReadOnlyList<QuestionResponse> Questions);

public record IntroResponse(
    Guid Id,
    string Title,
    string? Subtitle,
    string? Body,
    string? AudioUrl,
    string? IconKey,
    string? PrimaryButtonLabel,
    string? PrimaryButtonRoute,
    bool VoiceNoteEnabled);

public record QuestionResponse(
    Guid Id,
    string Key,
    string Type,
    int Order,
    bool IsRequired,
    string? Group,
    string Label,
    string? Placeholder,
    string? HelpText,
    object? Config,
    IReadOnlyList<QuestionOptionResponse> Options,
    IReadOnlyList<QuestionConditionResponse> Conditions);

public record QuestionOptionResponse(
    string Value,
    string Label,
    int Order);

public record QuestionConditionResponse(
    string DependsOnKey,
    string Operator,
    string ValuesJson);
