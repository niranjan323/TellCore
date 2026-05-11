namespace CoreBackend.API.Models.Responses;

public record SessionResponse(Guid SessionId);

public record VoiceUploadResponse(string VoiceNoteUrl);
