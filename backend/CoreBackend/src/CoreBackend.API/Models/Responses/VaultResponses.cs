namespace CoreBackend.API.Models.Responses;

public record FamilyMemberResponse(Guid Id, string Name, string Email, string Status, string? AvatarUrl);

public record VaultInviteResponse(string Token, string InviteUrl, DateTime ExpiresAt);

public record AcceptInviteResponse(Guid OwnerUserId, string OwnerName);
