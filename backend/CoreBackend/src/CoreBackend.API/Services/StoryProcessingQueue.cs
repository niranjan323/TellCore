using System.Threading.Channels;
using CoreBackend.API.Services.Interfaces;

namespace CoreBackend.API.Services;

public class StoryProcessingQueue : IStoryProcessingQueue
{
    private readonly Channel<Guid> _channel = Channel.CreateBounded<Guid>(
        new BoundedChannelOptions(1000) { FullMode = BoundedChannelFullMode.DropOldest });

    public void Enqueue(Guid storyId) => _channel.Writer.TryWrite(storyId);

    public IAsyncEnumerable<Guid> DequeueAllAsync(CancellationToken ct) =>
        _channel.Reader.ReadAllAsync(ct);
}

public class StoryProcessingWorker : BackgroundService
{
    private readonly IStoryProcessingQueue _queue;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<StoryProcessingWorker> _logger;

    public StoryProcessingWorker(IStoryProcessingQueue queue, IServiceScopeFactory scopeFactory, ILogger<StoryProcessingWorker> logger)
    {
        _queue = queue;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var storyId in _queue.DequeueAllAsync(stoppingToken))
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var processor = scope.ServiceProvider.GetRequiredService<IStoryProcessingService>();
                await processor.ProcessAsync(storyId, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Story processing failed for {StoryId}", storyId);
            }
        }
    }
}
