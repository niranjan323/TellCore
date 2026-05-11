using System.Security.Claims;
using CoreBackend.API.Models.Requests;
using CoreBackend.API.Models.Responses;
using CoreBackend.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreBackend.API.Controllers;

[ApiController]
[Route("api/v1/responses")]
[Authorize]
public class ResponsesController : ControllerBase
{
    private readonly IResponseService _responses;

    public ResponsesController(IResponseService responses) => _responses = responses;

    [HttpPost]
    public async Task<ActionResult<SummaryResponse>> Submit([FromBody] SubmitResponseRequest request, CancellationToken ct)
    {
        if (request.SessionId == Guid.Empty)
            return BadRequest(new { error = "sessionId is required" });
        if (request.FormSetId == Guid.Empty)
            return BadRequest(new { error = "formSetId is required" });

        var result = await _responses.SubmitAsync(request, GetUserId(), ct);
        return Ok(result);
    }

    [HttpGet("{sessionId:guid}/summary")]
    public async Task<ActionResult<SummaryResponse>> GetSummary(Guid sessionId, CancellationToken ct)
    {
        var summary = await _responses.GetSummaryAsync(sessionId, GetUserId(), ct);
        return summary is null ? NotFound() : Ok(summary);
    }

    private Guid GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? throw new UnauthorizedAccessException("Missing user identity.");
        return Guid.Parse(sub);
    }
}
