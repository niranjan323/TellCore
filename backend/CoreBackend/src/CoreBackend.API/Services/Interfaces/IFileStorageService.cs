namespace CoreBackend.API.Services.Interfaces;

public interface IFileStorageService
{
    Task<StoredFile> SaveAsync(Stream content, string fileName, string contentType, string subfolder, CancellationToken ct = default);
}

public record StoredFile(string RelativePath, string Url);
