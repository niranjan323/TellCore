using System.Security.Claims;
using CoreBackend.API.Models.Responses;
using CoreBackend.API.Repositories.Interfaces;
using CoreBackend.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreBackend.API.Controllers;

[ApiController]
[Route("api/v1/products/{slug}/navigation")]
[Authorize]
public class NavigationController : ControllerBase
{
    private readonly IProductRepository _products;
    private readonly INavigationRepository _navigation;

    public NavigationController(IProductRepository products, INavigationRepository navigation)
    {
        _products = products;
        _navigation = navigation;
    }

    [HttpGet]
    public async Task<ActionResult<NavigationResponse>> Get(string slug, [FromQuery] string? lang, CancellationToken ct)
    {
        var product = await _products.GetBySlugAsync(slug, ct);
        if (product is null) return NotFound(new { error = "Product not found" });

        var userType = User.FindFirstValue(JwtService.ClaimUserType) ?? "guest";
        var language = string.IsNullOrWhiteSpace(lang) ? product.DefaultLanguage : lang!;
        var items = await _navigation.GetForProductAndRoleAsync(product.Id, userType, language, ct);
        return Ok(new NavigationResponse(items));
    }
}
