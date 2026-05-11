using System.Text.Json;

namespace CoreBackend.API.Models.Requests;

public record SubmitResponseRequest(
    Guid SessionId,
    Guid FormSetId,
    string LanguageCode,
    Dictionary<string, JsonElement> Answers,
    string? VoiceNoteUrl);
