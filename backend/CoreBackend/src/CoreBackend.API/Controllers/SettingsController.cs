using CoreBackend.API.Models.Responses;
using CoreBackend.API.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CoreBackend.API.Controllers;

[ApiController]
[Route("api/v1/settings")]
public class SettingsController : ControllerBase
{
    private readonly ISettingsRepository _settings;

    public SettingsController(ISettingsRepository settings) => _settings = settings;

    [HttpGet("{key}")]
    public async Task<ActionResult<SettingResponse>> Get(string key, CancellationToken ct)
    {
        var setting = await _settings.GetByKeyAsync(key, null, ct);
        if (setting is null) return NotFound(new { error = "Setting not found" });
        if (setting.IsSecret) return NotFound(new { error = "Setting not found" });
        return Ok(new SettingResponse(setting.Key, setting.Value, setting.DataType));
    }
}
