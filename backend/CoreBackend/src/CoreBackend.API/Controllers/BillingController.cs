using CoreBackend.API.Models.Requests;
using CoreBackend.API.Models.Responses;
using CoreBackend.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace CoreBackend.API.Controllers;

[ApiController]
[Route("api/v1/billing")]
public class BillingController : AuthorizedControllerBase
{
    private readonly IBillingService _billing;
    private readonly ILogger<BillingController> _logger;

    public BillingController(IBillingService billing, ILogger<BillingController> logger)
    {
        _billing = billing;
        _logger = logger;
    }

    [HttpGet("plans")]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<BillingPlanResponse>>> GetPlans(CancellationToken ct)
        => Ok(await _billing.GetPlansAsync(ct));

    [HttpPost("checkout-session")]
    [Authorize]
    public async Task<ActionResult<CheckoutSessionResponse>> CreateCheckoutSession(
        [FromBody] CreateCheckoutSessionRequest request, CancellationToken ct)
    {
        var (result, error) = await _billing.CreateCheckoutSessionAsync(GetUserId(), request, ct);
        return error is null ? Ok(result) : ErrorResult(error);
    }

    [HttpPost("portal-session")]
    [Authorize]
    public async Task<ActionResult<CheckoutSessionResponse>> CreatePortalSession(
        [FromBody] CreatePortalSessionRequest request, CancellationToken ct)
    {
        try
        {
            var (result, error) = await _billing.CreatePortalSessionAsync(GetUserId(), request.ReturnUrl, ct);
            return error is null ? Ok(result) : ErrorResult(error);
        }
        catch (StripeException ex)
        {
            // Test-mode portal needs a saved configuration in the Stripe dashboard.
            _logger.LogWarning(ex, "Stripe portal session failed");
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { error = "portal_unavailable" });
        }
    }

    [HttpGet("status")]
    [Authorize]
    public async Task<ActionResult<BillingStatusResponse>> GetStatus(CancellationToken ct)
    {
        var status = await _billing.GetStatusAsync(GetUserId(), ct);
        return status is null ? NotFound(new { error = "not_found" }) : Ok(status);
    }

    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<ActionResult> Webhook(CancellationToken ct)
    {
        using var reader = new StreamReader(Request.Body);
        var json = await reader.ReadToEndAsync(ct);
        var signature = Request.Headers["Stripe-Signature"].ToString();

        try
        {
            await _billing.HandleWebhookAsync(json, signature, ct);
            return Ok();
        }
        catch (StripeException ex)
        {
            _logger.LogWarning(ex, "Stripe webhook rejected (bad signature or payload)");
            return BadRequest(new { error = "invalid_webhook" });
        }
    }
}
