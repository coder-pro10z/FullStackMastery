namespace InterviewPrepApp.Domain.Entities;

public class AuditLog
{
    public long Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;   // CREATED | EDITED | DELETED | RESTORED | IMPORTED
    public string EntityType { get; set; } = string.Empty; // Question | Category | User
    public string? EntityId { get; set; }
    public string? OldValues { get; set; }    // JSON snapshot before
    public string? NewValues { get; set; }    // JSON snapshot after
    public string? IpAddress { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
