using CoreBackend.API.Models.Responses;
using CoreBackend.API.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CoreBackend.API.Controllers;

[ApiController]
[Route("api/v1/products/{slug}/forms")]
public class FormsController : ControllerBase
{
    private readonly IProductRepository _products;
    private readonly IFormSetRepository _formSets;

    public FormsController(IProductRepository products, IFormSetRepository formSets)
    {
        _products = products;
        _formSets = formSets;
    }

    [HttpGet("default")]
    public async Task<ActionResult<FormSetResponse>> GetDefault(string slug, [FromQuery] string? lang, CancellationToken ct)
    {
        var product = await _products.GetBySlugAsync(slug, ct);
        if (product is null) return NotFound(new { error = "Product not found" });

        var fs = await _formSets.GetDefaultAsync(product.Id, ct);
        if (fs is null) return NotFound(new { error = "No default form set for product" });

        var language = string.IsNullOrWhiteSpace(lang) ? product.DefaultLanguage : lang!;
        var response = await _formSets.LoadFullAsync(fs.Id, language, ct);
        return response is null ? NotFound() : Ok(response);
    }

    [HttpGet("{formSlug}")]
    public async Task<ActionResult<FormSetResponse>> GetBySlug(string slug, string formSlug, [FromQuery] string? lang, CancellationToken ct)
    {
        var product = await _products.GetBySlugAsync(slug, ct);
        if (product is null) return NotFound(new { error = "Product not found" });

        var fs = await _formSets.GetBySlugAsync(product.Id, formSlug, ct);
        if (fs is null) return NotFound(new { error = "Form set not found" });

        var language = string.IsNullOrWhiteSpace(lang) ? product.DefaultLanguage : lang!;
        var response = await _formSets.LoadFullAsync(fs.Id, language, ct);
        return response is null ? NotFound() : Ok(response);
    }
}
