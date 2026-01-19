using Microsoft.AspNetCore.SignalR;

namespace AiDiagram.Server.Hubs;

public class DiagramHub : Hub
{
    private static readonly Dictionary<string, string> _sessionMap = new();

    public override async Task OnConnectedAsync()
    {
        var sessionId = Context.GetHttpContext()?.Request.Query["sessionId"].ToString();
        if (!string.IsNullOrEmpty(sessionId))
        {
            _sessionMap[sessionId] = Context.ConnectionId;
        }
        await base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        var sessionId = _sessionMap.FirstOrDefault(x => x.Value == Context.ConnectionId).Key;
        if (sessionId != null)
        {
            _sessionMap.Remove(sessionId);
        }
        return base.OnDisconnectedAsync(exception);
    }

    public static string? GetConnectionId(string sessionId)
    {
        return _sessionMap.TryGetValue(sessionId, out var connectionId) ? connectionId : null;
    }
}
