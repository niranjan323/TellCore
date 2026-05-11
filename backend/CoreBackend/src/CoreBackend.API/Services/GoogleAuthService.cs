using System.Text.Json;
using CoreBackend.API.Services.Interfaces;

namespace CoreBackend.API.Services;

public class GoogleAuthService : IGoogleAuthService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;
    private readonly ILogger<GoogleAuthService> _logger;

    public GoogleAuthService(HttpClient http, IConfiguration config, ILogger<GoogleAuthService> logger)
    {
        _http = http;
        _config = config;
        _logger = logger;
    }

    public async Task<GoogleUserPayload?> ValidateIdTokenAsync(string idToken, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(idToken)) return null;

        var url = $"https://oauth2.googleapis.com/tokeninfo?id_token={Uri.EscapeDataString(idToken)}";
        using var resp = await _http.GetAsync(url, ct);
        if (!resp.IsSuccessStatusCode)
        {
            _logger.LogWarning("Google tokeninfo returned {Status}", resp.StatusCode);
            return null;
        }

        using var stream = await resp.Content.ReadAsStreamAsync(ct);
        using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
        var root = doc.RootElement;

        var expectedAud = _config["Google:ClientId"];
        if (!string.IsNullOrEmpty(expectedAud)
            && root.TryGetProperty("aud", out var aud)
            && !string.Equals(aud.GetString(), expectedAud, StringComparison.Ordinal))
        {
            _logger.LogWarning("Google token audience mismatch");
            return null;
        }

        if (!root.TryGetProperty("sub", out var sub) || string.IsNullOrEmpty(sub.GetString()))
            return null;

        var email = root.TryGetProperty("email", out var e) ? e.GetString() : null;
        var name = root.TryGetProperty("name", out var n) ? n.GetString() : null;

        return new GoogleUserPayload(sub.GetString()!, email ?? string.Empty, name);
    }
}
