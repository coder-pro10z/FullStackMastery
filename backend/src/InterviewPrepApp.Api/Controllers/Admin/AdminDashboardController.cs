using InterviewPrepApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPrepApp.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = "Admin,Editor")]
public class AdminDashboardController : ControllerBase
{
    private readonly IAdminDashboardService _service;

    public AdminDashboardController(IAdminDashboardService service)
        => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetStats(CancellationToken ct)
        => Ok(await _service.GetStatsAsync(ct));
}

[ApiController]
[Route("api/admin/audit-logs")]
[Authorize(Roles = "Admin")]
public class AdminAuditLogsController : ControllerBase
{
    private readonly IAuditLogService _service;

    public AdminAuditLogsController(IAuditLogService service)
        => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetLogs([FromQuery] AuditLogFilter filter, CancellationToken ct)
        => Ok(await _service.GetLogsAsync(filter, ct));
}
