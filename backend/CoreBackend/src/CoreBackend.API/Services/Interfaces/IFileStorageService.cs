namespace CoreBackend.API.Services.Interfaces;

public interface IFileStorageService
{
    Task<StoredFile> SaveAsync(Stream content, string fileName, string contentType, string subfolder, CancellationToken ct = default);

    /// <summary>Opens a previously stored file for reading; null when it no longer exists.</summary>
    Task<Stream?> OpenReadAsync(string relativePath, CancellationToken ct = default);
}

public record StoredFile(string RelativePath, string Url);
