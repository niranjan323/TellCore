namespace CoreBackend.API.Models.Responses;

public record SettingResponse(
    string Key,
    string Value,
    string DataType);
