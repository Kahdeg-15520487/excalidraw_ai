using System.ComponentModel;
using ModelContextProtocol.Server;

namespace AiDiagram.Server.MCP;

/// <summary>
/// MCP Server tools for Excalidraw canvas manipulation.
/// These tools are exposed to the AI Agent via MCP protocol.
/// </summary>
internal class ExcalidrawTools
{
    [McpServerTool]
    [Description("Add a rectangle to the Excalidraw canvas")]
    public object AddRectangle(
        [Description("X coordinate of the rectangle")] double x,
        [Description("Y coordinate of the rectangle")] double y,
        [Description("Width of the rectangle")] double width,
        [Description("Height of the rectangle")] double height,
        [Description("Stroke color in hex format (e.g., #000000)")] string? color = "#000000")
    {
        return new
        {
            success = true,
            element = new
            {
                type = "rectangle",
                x, y, width, height,
                strokeColor = color ?? "#000000",
                backgroundColor = "transparent"
            }
        };
    }

    [McpServerTool]
    [Description("Add an ellipse or circle to the Excalidraw canvas")]
    public object AddEllipse(
        [Description("X coordinate of the ellipse")] double x,
        [Description("Y coordinate of the ellipse")] double y,
        [Description("Width of the ellipse")] double width,
        [Description("Height of the ellipse")] double height,
        [Description("Stroke color in hex format")] string? color = "#000000")
    {
        return new
        {
            success = true,
            element = new
            {
                type = "ellipse",
                x, y, width, height,
                strokeColor = color ?? "#000000",
                backgroundColor = "transparent"
            }
        };
    }

    [McpServerTool]
    [Description("Add text to the Excalidraw canvas")]
    public object AddText(
        [Description("X coordinate of the text")] double x,
        [Description("Y coordinate of the text")] double y,
        [Description("The text content to display")] string text,
        [Description("Font size in pixels")] int fontSize = 20)
    {
        return new
        {
            success = true,
            element = new
            {
                type = "text",
                x, y, text, fontSize
            }
        };
    }

    [McpServerTool]
    [Description("Draw an arrow connecting two points on the canvas")]
    public object AddArrow(
        [Description("Starting X coordinate")] double startX,
        [Description("Starting Y coordinate")] double startY,
        [Description("Ending X coordinate")] double endX,
        [Description("Ending Y coordinate")] double endY,
        [Description("Stroke color in hex format")] string? color = "#000000")
    {
        return new
        {
            success = true,
            element = new
            {
                type = "arrow",
                x = startX,
                y = startY,
                width = endX - startX,
                height = endY - startY,
                strokeColor = color ?? "#000000"
            }
        };
    }

    [McpServerTool]
    [Description("Add a diamond shape to the Excalidraw canvas")]
    public object AddDiamond(
        [Description("X coordinate of the diamond")] double x,
        [Description("Y coordinate of the diamond")] double y,
        [Description("Width of the diamond")] double width,
        [Description("Height of the diamond")] double height,
        [Description("Stroke color in hex format")] string? color = "#000000")
    {
        return new
        {
            success = true,
            element = new
            {
                type = "diamond",
                x, y, width, height,
                strokeColor = color ?? "#000000",
                backgroundColor = "transparent"
            }
        };
    }

    [McpServerTool]
    [Description("Add a line between two points on the canvas")]
    public object AddLine(
        [Description("Starting X coordinate")] double startX,
        [Description("Starting Y coordinate")] double startY,
        [Description("Ending X coordinate")] double endX,
        [Description("Ending Y coordinate")] double endY,
        [Description("Stroke color in hex format")] string? color = "#000000")
    {
        return new
        {
            success = true,
            element = new
            {
                type = "line",
                x = startX,
                y = startY,
                width = endX - startX,
                height = endY - startY,
                strokeColor = color ?? "#000000"
            }
        };
    }

    [McpServerTool]
    [Description("Get the current state of the Excalidraw canvas")]
    public object GetCanvasState()
    {
        return new
        {
            success = true,
            message = "Canvas state retrieval requires SignalR connection to be implemented"
        };
    }
}
