using CoreBackend.API.Models.Requests;
using CoreBackend.API.Models.Responses;
using CoreBackend.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreBackend.API.Controllers;

[ApiController]
[Route("api/v1/vault")]
[Authorize]
public class VaultController : AuthorizedControllerBase
{
    private readonly IVaultService _vault;
    private readonly IStoryService _stories;

    public VaultController(IVaultService vault, IStoryService stories)
    {
        _vault = vault;
        _stories = stories;
    }

    [HttpPost("invites")]
    public async Task<ActionResult<VaultInviteResponse>> CreateInvite([FromBody] CreateVaultInviteRequest request, CancellationToken ct)
        => Ok(await _vault.CreateInviteAsync(GetUserId(), request, ct));

    [HttpPost("invites/{token}/accept")]
    public async Task<ActionResult<AcceptInviteResponse>> AcceptInvite(string token, CancellationToken ct)
    {
        var (result, error) = await _vault.AcceptInviteAsync(token, GetUserId(), ct);
        return error is null ? Ok(result) : ErrorResult(error);
    }

    [HttpGet("members")]
    public async Task<ActionResult<IReadOnlyList<FamilyMemberResponse>>> GetMembers(CancellationToken ct)
        => Ok(await _vault.GetMembersAsync(GetUserId(), ct));

    [HttpDelete("members/{id:guid}")]
    public async Task<ActionResult> RemoveMember(Guid id, CancellationToken ct)
    {
        await _vault.RemoveMemberAsync(id, GetUserId(), ct);
        return NoContent();
    }

    [HttpGet("stories")]
    public async Task<ActionResult<IReadOnlyList<StoryResponse>>> GetVaultStories(CancellationToken ct)
    {
        var viewerId = GetUserId();
        var ownerIds = await _vault.GetVaultOwnerIdsForViewerAsync(viewerId, ct);
        var stories = await _stories.GetFamilyStoriesForOwnersAsync(ownerIds, viewerId, ct);
        return Ok(stories);
    }
}
