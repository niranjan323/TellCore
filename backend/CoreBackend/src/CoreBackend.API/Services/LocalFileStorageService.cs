using CoreBackend.API.Services.Interfaces;

namespace CoreBackend.API.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _root;
    private readonly IHttpContextAccessor _http;

    public LocalFileStorageService(IConfiguration config, IHostEnvironment env, IHttpContextAccessor http)
    {
        var configured = config["Storage:LocalPath"] ?? "uploads";
        _root = Path.IsPathRooted(configured)
            ? configured
            : Path.Combine(env.ContentRootPath, configured);
        Directory.CreateDirectory(_root);
        _http = http;
    }

    public async Task<StoredFile> SaveAsync(Stream content, string fileName, string contentType, string subfolder, CancellationToken ct = default)
    {
        var safeSubfolder = string.Concat(subfolder.Where(c => char.IsLetterOrDigit(c) || c == '-' || c == '_' || c == '/'));
        var folder = Path.Combine(_root, safeSubfolder);
        Directory.CreateDirectory(folder);

        var ext = Path.GetExtension(fileName);
        if (string.IsNullOrEmpty(ext))
            ext = GuessExtension(contentType);

        var unique = $"{Guid.NewGuid():N}{ext}";
        var absolutePath = Path.Combine(folder, unique);

        await using (var fs = new FileStream(absolutePath, FileMode.CreateNew, FileAccess.Write, FileShare.None))
        {
            await content.CopyToAsync(fs, ct);
        }

        var relative = Path.Combine(safeSubfolder, unique).Replace('\\', '/');
        var url = BuildPublicUrl(relative);
        return new StoredFile(relative, url);
    }

    private string BuildPublicUrl(string relativePath)
    {
        var req = _http.HttpContext?.Request;
        var baseUrl = req is null
            ? string.Empty
            : $"{req.Scheme}://{req.Host}";
        return $"{baseUrl}/uploads/{relativePath}";
    }

    private static string GuessExtension(string contentType) => contentType switch
    {
        "audio/webm" => ".webm",
        "audio/ogg" => ".ogg",
        "audio/mp4" or "audio/aac" => ".m4a",
        "audio/mpeg" => ".mp3",
        "audio/wav" or "audio/x-wav" => ".wav",
        _ => ".bin",
    };
}
