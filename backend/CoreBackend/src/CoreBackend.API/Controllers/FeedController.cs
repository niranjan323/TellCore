using CoreBackend.API.Models.Responses;
using CoreBackend.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreBackend.API.Controllers;

[ApiController]
[Route("api/v1/feed")]
[Authorize]
public class FeedController : AuthorizedControllerBase
{
    private readonly IStoryService _stories;

    public FeedController(IStoryService stories) => _stories = stories;

    [HttpGet("featured")]
    public async Task<ActionResult<StoryListResponse>> GetFeatured(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string productSlug = "theuntold", CancellationToken ct = default)
        => Ok(await _stories.GetCommunityFeedAsync(productSlug, GetUserId(), GetUserType(), page, pageSize, ct));

    [HttpGet("story-of-the-day")]
    public async Task<ActionResult<StoryResponse>> GetStoryOfTheDay(
        [FromQuery] string productSlug = "theuntold", CancellationToken ct = default)
    {
        var story = await _stories.GetStoryOfTheDayAsync(productSlug, GetUserId(), GetUserType(), ct);
        return story is null ? NotFound(new { error = "not_found" }) : Ok(story);
    }
}
