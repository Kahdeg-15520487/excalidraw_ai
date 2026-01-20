using AiDiagram.Server.Services;
using Microsoft.AspNetCore.SignalR;

namespace AiDiagram.Server.Hubs;

public class DiagramHub : Hub
{
    private static readonly Dictionary<string, string> _sessionMap = new();
    private readonly AgentService _agentService;

    public DiagramHub(AgentService agentService)
    {
        _agentService = agentService;
    }

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

    public async Task SendMessage(string user, string message)
    {
        // Legacy method - redirect to SendMessageWithHistory with empty history
        await SendMessageWithHistory(user, message, Array.Empty<object>());
    }

    public async Task SendMessageWithHistory(string user, string message, object[] history)
    {
        // Get session ID from connection
        var sessionId = _sessionMap.FirstOrDefault(x => x.Value == Context.ConnectionId).Key;
        
        if (string.IsNullOrEmpty(sessionId))
        {
            await Clients.Caller.SendAsync("ReceiveMessage", "System", "Error: Session not found. Please refresh the page.");
            return;
        }

        try
        {
            // Process message through AI agent with history
            var response = await _agentService.ProcessMessageWithHistoryAsync(sessionId, message, history);
            await Clients.Caller.SendAsync("ReceiveMessage", "Assistant", response);
        }
        catch (Exception ex)
        {
            await Clients.Caller.SendAsync("ReceiveMessage", "System", $"Error processing message: {ex.Message}");
        }
    }
}
