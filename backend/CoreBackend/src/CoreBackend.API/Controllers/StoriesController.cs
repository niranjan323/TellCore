using CoreBackend.API.Models.Requests;
using CoreBackend.API.Models.Responses;
using CoreBackend.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreBackend.API.Controllers;

[ApiController]
[Route("api/v1/stories")]
[Authorize]
public class StoriesController : AuthorizedControllerBase
{
    private readonly IStoryService _stories;

    public StoriesController(IStoryService stories) => _stories = stories;

    [HttpPost]
    public async Task<ActionResult<CreateStoryResponse>> Create([FromBody] CreateStoryRequest request, CancellationToken ct)
    {
        var (result, error) = await _stories.CreateAsync(GetUserId(), GetUserType(), request, ct);
        return error is null ? Ok(result) : ErrorResult(error);
    }

    [HttpPost("{id:guid}/voice")]
    [RequestSizeLimit(20_000_000)]
    public async Task<ActionResult<StoryVoiceUploadResponse>> UploadVoice(Guid id, IFormFile file, [FromForm] int? durationSeconds, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "file is required" });

        await using var stream = file.OpenReadStream();
        var (result, error) = await _stories.AttachVoiceAsync(
            GetUserId(), id, stream, file.FileName, file.ContentType ?? "application/octet-stream", durationSeconds, ct);
        return error is null ? Ok(result) : ErrorResult(error);
    }

    [HttpPost("{id:guid}/process")]
    public async Task<ActionResult> Process(Guid id, CancellationToken ct)
    {
        var error = await _stories.StartProcessingAsync(GetUserId(), id, ct);
        return error is null ? Accepted(new { storyId = id, status = "processing" }) : ErrorResult(error);
    }

    [HttpGet("{id:guid}/status")]
    public async Task<ActionResult<StoryStatusResponse>> GetStatus(Guid id, CancellationToken ct)
    {
        var status = await _stories.GetStatusAsync(GetUserId(), id, ct);
        return status is null ? NotFound(new { error = "not_found" }) : Ok(status);
    }

    [HttpGet("mine")]
    public async Task<ActionResult<IReadOnlyList<StoryResponse>>> GetMine(CancellationToken ct)
        => Ok(await _stories.GetMineAsync(GetUserId(), ct));

    [HttpGet("liked")]
    public async Task<ActionResult<IReadOnlyList<StoryResponse>>> GetLiked(CancellationToken ct)
        => Ok(await _stories.GetLikedAsync(GetUserId(), GetUserType(), ct));

    [HttpGet("favourites")]
    public async Task<ActionResult<IReadOnlyList<StoryResponse>>> GetFavourites(CancellationToken ct)
        => Ok(await _stories.GetFavouritesAsync(GetUserId(), GetUserType(), ct));

    [HttpGet("search")]
    public async Task<ActionResult<IReadOnlyList<StoryResponse>>> Search(
        [FromQuery] string q, [FromQuery] string productSlug = "theuntold", CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(q)) return Ok(Array.Empty<StoryResponse>());
        return Ok(await _stories.SearchAsync(productSlug, GetUserId(), GetUserType(), q, ct));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<StoryResponse>> GetById(Guid id, CancellationToken ct)
    {
        var (story, error) = await _stories.GetByIdAsync(GetUserId(), GetUserType(), id, ct);
        return error is null ? Ok(story) : ErrorResult(error);
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<StoryResponse>> Update(Guid id, [FromBody] UpdateStoryRequest request, CancellationToken ct)
    {
        var (story, error) = await _stories.UpdateAsync(GetUserId(), id, request, ct);
        return error is null ? Ok(story) : ErrorResult(error);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken ct)
    {
        var error = await _stories.DeleteAsync(GetUserId(), id, ct);
        return error is null ? NoContent() : ErrorResult(error);
    }

    [HttpPost("{id:guid}/view")]
    public async Task<ActionResult> RecordView(Guid id, CancellationToken ct)
    {
        await _stories.RecordViewAsync(id, GetUserId(), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/report")]
    public async Task<ActionResult> Report(Guid id, [FromBody] ReportStoryRequest request, CancellationToken ct)
    {
        var error = await _stories.ReportAsync(GetUserId(), id, request.Reason, request.Details, ct);
        return error is null ? NoContent() : ErrorResult(error);
    }

    [HttpPost("{id:guid}/heart")]
    public async Task<ActionResult<HeartResponse>> ToggleHeart(Guid id, CancellationToken ct)
    {
        var result = await _stories.ToggleHeartAsync(GetUserId(), id, ct);
        return result is null ? NotFound(new { error = "not_found" }) : Ok(result);
    }

    [HttpPost("{id:guid}/favourite")]
    public async Task<ActionResult<FavouriteResponse>> ToggleFavourite(Guid id, CancellationToken ct)
    {
        var result = await _stories.ToggleFavouriteAsync(GetUserId(), id, ct);
        return result is null ? NotFound(new { error = "not_found" }) : Ok(result);
    }

    [HttpGet("{id:guid}/translation")]
    public async Task<ActionResult<StoryTranslationResponse>> GetTranslation(
        Guid id, [FromQuery] string lang, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(lang)) return BadRequest(new { error = "invalid_language" });
        var (result, error) = await _stories.GetTranslationAsync(GetUserId(), GetUserType(), id, lang, ct);
        return error is null ? Ok(result) : error switch
        {
            "translation_unavailable" => StatusCode(StatusCodes.Status503ServiceUnavailable, new { error }),
            _ => ErrorResult(error),
        };
    }
}
