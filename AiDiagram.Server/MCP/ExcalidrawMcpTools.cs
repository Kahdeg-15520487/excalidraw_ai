using System.ComponentModel;
using AiDiagram.Server.Hubs;
using AiDiagram.Shared;
using Microsoft.AspNetCore.SignalR;
using ModelContextProtocol.Server;

namespace AiDiagram.Server.MCP;

/// <summary>
/// MCP Server tools for Excalidraw canvas manipulation.
/// These tools are exposed to the AI Agent via MCP protocol.
/// Tool calls use SignalR InvokeAsync to BLOCK until the frontend confirms execution.
/// </summary>
internal class ExcalidrawTools
{
    private readonly IHubContext<DiagramHub> _hubContext;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private static readonly TimeSpan ToolCallTimeout = TimeSpan.FromSeconds(30);

    public ExcalidrawTools(IHubContext<DiagramHub> hubContext, IHttpContextAccessor httpContextAccessor)
    {
        _hubContext = hubContext;
        _httpContextAccessor = httpContextAccessor;
    }

    /// <summary>
    /// Send a tool call to the frontend and WAIT for acknowledgment.
    /// Uses SignalR InvokeAsync for true RPC semantics.
    /// </summary>
    private async Task<ToolCallResult> SendToClientAsync(string action, object data)
    {
        var sessionId = _httpContextAccessor.HttpContext?.Request.Headers["X-Session-ID"].ToString();
        
        if (string.IsNullOrEmpty(sessionId)) 
        {
            Console.WriteLine("[ExcalidrawTools] Warning: No X-Session-ID header found.");
            return new ToolCallResult { Success = false, Error = "No session ID provided" };
        }
        
        var connectionId = DiagramHub.GetConnectionId(sessionId);
        if (connectionId == null) 
        {
            Console.WriteLine($"[ExcalidrawTools] Warning: No connection found for session {sessionId}");
            return new ToolCallResult { Success = false, Error = "Client not connected" };
        }

        try
        {
            Console.WriteLine($"[ExcalidrawTools] Invoking {action} on client, waiting for response...");
            
            // Use InvokeAsync to wait for client response (RPC pattern)
            using var cts = new CancellationTokenSource(ToolCallTimeout);
            var result = await _hubContext.Clients.Client(connectionId)
                .InvokeAsync<ToolCallResult>("ExecuteTool", action, data, cts.Token);
            
            Console.WriteLine($"[ExcalidrawTools] Got response: Success={result.Success}, ElementId={result.ElementId}");
            return result;
        }
        catch (OperationCanceledException)
        {
            Console.WriteLine($"[ExcalidrawTools] Tool call timed out after {ToolCallTimeout.TotalSeconds}s");
            return new ToolCallResult { Success = false, Error = "Tool call timed out" };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ExcalidrawTools] Error invoking tool: {ex.Message}");
            return new ToolCallResult { Success = false, Error = ex.Message };
        }
    }

    [McpServerTool]
    [Description("Add a rectangle to the Excalidraw canvas")]
    public async Task<object> AddRectangle(
        [Description("X coordinate of the rectangle")] double x,
        [Description("Y coordinate of the rectangle")] double y,
        [Description("Width of the rectangle")] double width,
        [Description("Height of the rectangle")] double height,
        [Description("Stroke color in hex format (e.g., #000000)")] string? strokeColor = "#000000",
        [Description("Background fill color in hex format")] string? backgroundColor = "transparent")
    {
        var element = new { type = "rectangle", x, y, width, height, strokeColor = strokeColor ?? "#000000", backgroundColor = backgroundColor ?? "transparent" };
        var result = await SendToClientAsync("addElement", element);
        return new { success = result.Success, error = result.Error, elementId = result.ElementId, element };
    }

    [McpServerTool]
    [Description("Add an ellipse or circle to the Excalidraw canvas")]
    public async Task<object> AddEllipse(
        [Description("X coordinate of the ellipse")] double x,
        [Description("Y coordinate of the ellipse")] double y,
        [Description("Width of the ellipse")] double width,
        [Description("Height of the ellipse")] double height,
        [Description("Stroke color in hex format")] string? strokeColor = "#000000",
        [Description("Background fill color in hex format")] string? backgroundColor = "transparent")
    {
        var element = new { type = "ellipse", x, y, width, height, strokeColor = strokeColor ?? "#000000", backgroundColor = backgroundColor ?? "transparent" };
        var result = await SendToClientAsync("addElement", element);
        return new { success = result.Success, error = result.Error, elementId = result.ElementId, element };
    }

    [McpServerTool]
    [Description("Add text to the Excalidraw canvas")]
    public async Task<object> AddText(
        [Description("X coordinate of the text")] double x,
        [Description("Y coordinate of the text")] double y,
        [Description("The text content to display")] string text,
        [Description("Font size in pixels")] int fontSize = 20,
        [Description("Text color in hex format")] string? strokeColor = "#000000")
    {
        var element = new { type = "text", x, y, text, fontSize, strokeColor = strokeColor ?? "#000000" };
        var result = await SendToClientAsync("addElement", element);
        return new { success = result.Success, error = result.Error, elementId = result.ElementId, element };
    }

    [McpServerTool]
    [Description("Draw an arrow connecting two points on the canvas")]
    public async Task<object> AddArrow(
        [Description("Starting X coordinate")] double startX,
        [Description("Starting Y coordinate")] double startY,
        [Description("Ending X coordinate")] double endX,
        [Description("Ending Y coordinate")] double endY,
        [Description("Stroke color in hex format")] string? strokeColor = "#000000")
    {
        var element = new { type = "arrow", startX, startY, endX, endY, strokeColor = strokeColor ?? "#000000" };
        var result = await SendToClientAsync("addElement", element);
        return new { success = result.Success, error = result.Error, elementId = result.ElementId, element };
    }

    [McpServerTool]
    [Description("Add a diamond shape to the Excalidraw canvas")]
    public async Task<object> AddDiamond(
        [Description("X coordinate of the diamond")] double x,
        [Description("Y coordinate of the diamond")] double y,
        [Description("Width of the diamond")] double width,
        [Description("Height of the diamond")] double height,
        [Description("Stroke color in hex format")] string? strokeColor = "#000000",
        [Description("Background fill color in hex format")] string? backgroundColor = "transparent")
    {
        var element = new { type = "diamond", x, y, width, height, strokeColor = strokeColor ?? "#000000", backgroundColor = backgroundColor ?? "transparent" };
        var result = await SendToClientAsync("addElement", element);
        return new { success = result.Success, error = result.Error, elementId = result.ElementId, element };
    }

    [McpServerTool]
    [Description("Add a line between two points on the canvas")]
    public async Task<object> AddLine(
        [Description("Starting X coordinate")] double startX,
        [Description("Starting Y coordinate")] double startY,
        [Description("Ending X coordinate")] double endX,
        [Description("Ending Y coordinate")] double endY,
        [Description("Stroke color in hex format")] string? strokeColor = "#000000")
    {
        var element = new { type = "line", startX, startY, endX, endY, strokeColor = strokeColor ?? "#000000" };
        var result = await SendToClientAsync("addElement", element);
        return new { success = result.Success, error = result.Error, elementId = result.ElementId, element };
    }

    [McpServerTool]
    [Description("Update an existing element on the canvas")]
    public async Task<object> UpdateElement(
        [Description("ID of the element to update")] string elementId,
        [Description("New X coordinate (optional)")] double? x = null,
        [Description("New Y coordinate (optional)")] double? y = null,
        [Description("New width (optional)")] double? width = null,
        [Description("New height (optional)")] double? height = null,
        [Description("New text content for text elements (optional)")] string? text = null,
        [Description("New stroke color (optional)")] string? strokeColor = null,
        [Description("New background color (optional)")] string? backgroundColor = null)
    {
        var updates = new Dictionary<string, object?> { ["elementId"] = elementId };
        if (x.HasValue) updates["x"] = x.Value;
        if (y.HasValue) updates["y"] = y.Value;
        if (width.HasValue) updates["width"] = width.Value;
        if (height.HasValue) updates["height"] = height.Value;
        if (text != null) updates["text"] = text;
        if (strokeColor != null) updates["strokeColor"] = strokeColor;
        if (backgroundColor != null) updates["backgroundColor"] = backgroundColor;
        
        var result = await SendToClientAsync("updateElement", updates);
        return new { success = result.Success, error = result.Error, elementId };
    }

    [McpServerTool]
    [Description("Delete elements from the canvas by their IDs")]
    public async Task<object> DeleteElements(
        [Description("Array of element IDs to delete")] string[] elementIds)
    {
        var result = await SendToClientAsync("deleteElements", new { elementIds });
        return new { success = result.Success, error = result.Error, deletedCount = elementIds.Length };
    }

    [McpServerTool]
    [Description("Clear all elements from the canvas")]
    public async Task<object> ClearCanvas()
    {
        var result = await SendToClientAsync("clearCanvas", new { });
        return new { success = result.Success, error = result.Error };
    }

    [McpServerTool]
    [Description("Get the current state of the Excalidraw canvas including all elements")]
    public async Task<object> GetCanvasState()
    {
        var result = await SendToClientAsync("getCanvasState", new { });
        return new { success = result.Success, error = result.Error };
    }
}
