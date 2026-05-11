using CoreBackend.API.Models.Responses;
using CoreBackend.API.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CoreBackend.API.Controllers;

[ApiController]
[Route("api/v1/products/{slug}/themes")]
public class ThemesController : ControllerBase
{
    private readonly IProductRepository _products;
    private readonly IThemeRepository _themes;

    public ThemesController(IProductRepository products, IThemeRepository themes)
    {
        _products = products;
        _themes = themes;
    }

    [HttpGet("active")]
    public async Task<ActionResult<ThemeResponse>> GetActive(string slug, CancellationToken ct)
    {
        var product = await _products.GetBySlugAsync(slug, ct);
        if (product is null) return NotFound(new { error = "Product not found" });

        var theme = await _themes.GetActiveAsync(product.Id, ct);
        if (theme is null) return NotFound(new { error = "No active theme for product" });
        return Ok(theme);
    }

    [HttpGet("{themeSlug}")]
    public async Task<ActionResult<ThemeResponse>> GetBySlug(string slug, string themeSlug, CancellationToken ct)
    {
        var product = await _products.GetBySlugAsync(slug, ct);
        if (product is null) return NotFound(new { error = "Product not found" });

        var theme = await _themes.GetBySlugAsync(product.Id, themeSlug, ct);
        if (theme is null) return NotFound(new { error = "Theme not found" });
        return Ok(theme);
    }
}
