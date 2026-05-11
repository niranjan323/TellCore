using System.Text.Json;
using CoreBackend.API.Models.Responses;
using CoreBackend.API.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CoreBackend.API.Controllers;

[ApiController]
[Route("api/v1/products/{slug}/config")]
public class ConfigController : ControllerBase
{
    private readonly IProductRepository _products;
    private readonly IFormSetRepository _formSets;
    private readonly IThemeRepository _themes;
    private readonly ISettingsRepository _settings;

    public ConfigController(
        IProductRepository products,
        IFormSetRepository formSets,
        IThemeRepository themes,
        ISettingsRepository settings)
    {
        _products = products;
        _formSets = formSets;
        _themes = themes;
        _settings = settings;
    }

    [HttpGet]
    public async Task<ActionResult<ProductConfigResponse>> Get(string slug, CancellationToken ct)
    {
        var product = await _products.GetBySlugAsync(slug, ct);
        if (product is null) return NotFound(new { error = "Product not found" });

        string? themeSlug = null;
        if (product.DefaultThemeId is { } themeId)
        {
            var theme = await _themes.GetActiveAsync(product.Id, ct);
            themeSlug = theme?.Slug;
        }

        string? formSetSlug = null;
        if (product.DefaultFormSetId is { } fsId)
        {
            var fs = await _formSets.GetByIdAsync(fsId, ct);
            formSetSlug = fs?.Slug;
        }
        formSetSlug ??= (await _formSets.GetDefaultAsync(product.Id, ct))?.Slug;

        var supported = await ReadSupportedLanguagesAsync(ct);

        return Ok(new ProductConfigResponse(
            product.Slug,
            product.Name,
            product.DefaultLanguage,
            themeSlug,
            formSetSlug,
            supported));
    }

    private async Task<IReadOnlyList<string>> ReadSupportedLanguagesAsync(CancellationToken ct)
    {
        var raw = await _settings.GetValueAsync("app.supportedlanguages", null, ct);
        if (string.IsNullOrWhiteSpace(raw)) return new[] { "en" };
        try
        {
            return JsonSerializer.Deserialize<List<string>>(raw) ?? new List<string> { "en" };
        }
        catch
        {
            return new[] { "en" };
        }
    }
}
