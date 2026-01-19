namespace AiDiagram.Shared;

using System.Text.Json.Serialization;

public class ToolCallRequest
{
    public string ToolName { get; set; }
    public Dictionary<string, object> Parameters { get; set; }
}

public class ExcalidrawElement
{
    public string Id { get; set; }
    public string Type { get; set; }
    public double X { get; set; }
    public double Y { get; set; }
    public double Width { get; set; }
    public double Height { get; set; }
    public string StrokeColor { get; set; }
    public string BackgroundColor { get; set; }
    public string Text { get; set; }
    // Add other properties as needed
}

public class SceneData
{
    public List<ExcalidrawElement> Elements { get; set; }
    public object AppState { get; set; }
}
