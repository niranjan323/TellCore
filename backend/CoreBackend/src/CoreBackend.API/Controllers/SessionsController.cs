using System.Security.Claims;
using CoreBackend.API.Models.Entities;
using CoreBackend.API.Models.Requests;
using CoreBackend.API.Models.Responses;
using CoreBackend.API.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreBackend.API.Controllers;

[ApiController]
[Route("api/v1/sessions")]
[Authorize]
public class SessionsController : ControllerBase
{
    private readonly IProductRepository _products;
    private readonly IFormSetRepository _formSets;
    private readonly ISessionRepository _sessions;

    public SessionsController(
        IProductRepository products,
        IFormSetRepository formSets,
        ISessionRepository sessions)
    {
        _products = products;
        _formSets = formSets;
        _sessions = sessions;
    }

    [HttpPost]
    public async Task<ActionResult<SessionResponse>> Create([FromBody] CreateSessionRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.ProductSlug))
            return BadRequest(new { error = "productSlug is required" });

        var product = await _products.GetBySlugAsync(request.ProductSlug, ct);
        if (product is null) return NotFound(new { error = "Product not found" });

        var fs = await _formSets.GetByIdAsync(request.FormSetId, ct);
        if (fs is null || fs.ProductId != product.Id)
            return NotFound(new { error = "Form set not found for product" });

        var userId = GetUserId();
        var session = new Session
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ProductId = product.Id,
            FormSetId = fs.Id,
            LanguageCode = string.IsNullOrWhiteSpace(request.LanguageCode) ? product.DefaultLanguage : request.LanguageCode,
            Status = "in_progress",
        };
        await _sessions.InsertAsync(session, ct);
        return Ok(new SessionResponse(session.Id));
    }

    private Guid GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? throw new UnauthorizedAccessException("Missing user identity.");
        return Guid.Parse(sub);
    }
}
