namespace CoreBackend.API.Services;

public static class TextUtils
{
    public static int CountWords(string? text) =>
        string.IsNullOrWhiteSpace(text)
            ? 0
            : text.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Length;

    /// <summary>Truncates at a word boundary and appends an ellipsis when cut.</summary>
    public static string TruncateAtWord(string text, int maxChars)
    {
        if (string.IsNullOrEmpty(text) || text.Length <= maxChars) return text;
        var cut = text[..maxChars];
        var lastSpace = cut.LastIndexOf(' ');
        if (lastSpace > maxChars / 2) cut = cut[..lastSpace];
        return cut.TrimEnd() + "…";
    }

    public static string MakeExcerpt(string? text, int maxChars = 160)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;
        var flat = text.ReplaceLineEndings(" ").Trim();
        return TruncateAtWord(flat, maxChars);
    }

    public static string Initials(string? name)
    {
        if (string.IsNullOrWhiteSpace(name)) return "St";
        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return parts.Length >= 2
            ? $"{char.ToUpperInvariant(parts[0][0])}{char.ToUpperInvariant(parts[1][0])}"
            : parts[0].Length >= 2
                ? $"{char.ToUpperInvariant(parts[0][0])}{char.ToLowerInvariant(parts[0][1])}"
                : parts[0].ToUpperInvariant();
    }
}
