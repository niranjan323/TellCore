using CoreBackend.API.Models.Responses;
using CoreBackend.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreBackend.API.Controllers;

[ApiController]
[Route("api/v1/users/me")]
[Authorize]
public class ProfileController : AuthorizedControllerBase
{
    private readonly IProfileService _profile;

    public ProfileController(IProfileService profile) => _profile = profile;

    [HttpGet("streak")]
    public async Task<ActionResult<StreakResponse>> GetStreak(CancellationToken ct)
        => Ok(await _profile.GetStreakAsync(GetUserId(), ct));

    [HttpGet("stats")]
    public async Task<ActionResult<ProfileStatsResponse>> GetStats(CancellationToken ct)
        => Ok(await _profile.GetStatsAsync(GetUserId(), ct));

    [HttpGet("milestones")]
    public async Task<ActionResult<IReadOnlyList<MilestoneResponse>>> GetMilestones(CancellationToken ct)
        => Ok(await _profile.GetMilestonesAsync(GetUserId(), ct));

    [HttpPatch("privacy")]
    public async Task<ActionResult> UpdatePrivacy([FromBody] Models.Requests.UpdatePrivacyRequest request, CancellationToken ct)
    {
        await _profile.SetProfileVisibilityAsync(GetUserId(), request.IsProfilePublic, ct);
        return NoContent();
    }
}
