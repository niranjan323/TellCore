namespace CoreBackend.API.Services.Interfaces;

/// <summary>
/// In-process queue feeding the story-processing background worker.
/// MVP implementation is a bounded channel; swap for a real message queue
/// (Azure Service Bus / Redis) when scaling beyond one API instance.
/// </summary>
public interface IStoryProcessingQueue
{
    void Enqueue(Guid storyId);
    IAsyncEnumerable<Guid> DequeueAllAsync(CancellationToken ct);
}

public interface IStoryProcessingService
{
    Task ProcessAsync(Guid storyId, CancellationToken ct = default);
}
