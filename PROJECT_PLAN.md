# AI-Powered Excalidraw Diagram Authoring Tool

## Project Overview

An LLM-powered technical diagram authoring application that combines Excalidraw's diagram editor with an AI chat interface. Users can create and modify diagrams through natural language interactions with an OpenAI-compatible endpoint.

## Implementation Status

> **Last Updated:** 2026-01-20

### ✅ Completed Features

| Feature | Description |
|---------|-------------|
| **Excalidraw Integration** | Full Excalidraw canvas embedded in Blazor WASM app |
| **Chat Panel** | Real-time chat interface with SignalR |
| **MCP Tool Server** | Backend exposes tools via MCP protocol (HTTP transport) |
| **Blocking Tool Calls** | SignalR `InvokeAsync<T>` ensures agent waits for frontend acknowledgment |
| **Complete Tool Set** | `addRectangle`, `addEllipse`, `addDiamond`, `addArrow`, `addLine`, `addText`, `updateElement`, `deleteElements`, `clearCanvas`, `getCanvasState` |
| **Tool Call Display** | Tool calls visible in chat with 🔧 icon and parameter JSON |
| **Markdown Rendering** | Chat messages render markdown with code block styling (Markdig) |
| **Canvas State Retrieval** | `getCanvasState` returns actual elements and app state |
| **Docker Deployment** | Single container with both server and client |

### 🚧 In Progress / Planned

| Feature | Status |
|---------|--------|
| Canvas state in LLM context | Planned - send elements to LLM for awareness |
| Undo/Rollback | Planned - snapshot history for AI changes |
| Configuration UI | Planned - API key/endpoint settings in sidebar |
| Streaming responses | Planned - stream AI responses to chat |

---

## Architecture Decision: MCP with SignalR RPC

### Final Decision: **MCP Server + SignalR for Tool Execution**

We implemented a hybrid approach that combines the benefits of MCP with real-time SignalR communication:

1. **MCP Server** - Backend exposes Excalidraw tools via MCP protocol
2. **SignalR Hub** - Real-time bidirectional communication between server and client
3. **Blocking RPC** - `InvokeAsync<T>` ensures server waits for client confirmation

### Architecture Flow
```
User Message → SignalR Hub → AI Agent → MCP Tools → SignalR InvokeAsync → Frontend JS → Excalidraw API
                                                              ↓
                                                   ToolCallResult (ack)
```

---

## Technical Architecture

### Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Blazor WebAssembly (.NET 9) |
| **Canvas** | @excalidraw/excalidraw (React, bundled via Vite) |
| **Backend** | ASP.NET Core (.NET 9) |
| **Real-time** | SignalR |
| **AI Integration** | Microsoft.Extensions.AI + OpenAI SDK |
| **Tool Protocol** | Model Context Protocol (MCP) - HTTP transport |
| **Container** | Docker (single container) |

### Project Structure
```
AiDiagram/
├── AiDiagram.Server/           # ASP.NET Core backend
│   ├── Hubs/DiagramHub.cs      # SignalR hub
│   ├── MCP/ExcalidrawMcpTools.cs  # MCP tool definitions
│   └── Services/AgentService.cs   # AI agent orchestration
├── AiDiagram.Client/           # Blazor WASM frontend
│   ├── Components/
│   │   ├── ChatPanel.razor     # Chat UI + SignalR handler
│   │   └── ExcalidrawWrapper.razor
│   └── wwwroot/
├── AiDiagram.Shared/           # Shared DTOs
│   └── DTOs.cs                 # ToolCallResult, etc.
├── AiDiagram.JsAdapter/        # React/Excalidraw bundle
│   └── src/index.js            # ExcalidrawAPI wrapper
└── docker-compose.yml
```

### Layout Design
```
┌─────────────────────────────────────────────────────┐
│  Excalidraw Canvas          │    Chat Panel         │
│  (React via JS Interop)     │                       │
│                             │  ┌─────────────────┐  │
│                             │  │ Message History │  │
│                             │  │ (with markdown) │  │
│                             │  │ 🔧 Tool calls   │  │
│                             │  └─────────────────┘  │
│                             │  ┌─────────────────┐  │
│                             │  │ Input Field     │  │
│                             │  └─────────────────┘  │
│                             │  [Send]               │
└─────────────────────────────────────────────────────┘
```

---

## Tool Definitions (MCP Server)

All tools are defined in `ExcalidrawMcpTools.cs` and use `InvokeAsync<ToolCallResult>` for blocking RPC.

| Tool | Parameters | Description |
|------|------------|-------------|
| `AddRectangle` | x, y, width, height, strokeColor, backgroundColor | Create rectangle |
| `AddEllipse` | x, y, width, height, strokeColor, backgroundColor | Create ellipse/circle |
| `AddDiamond` | x, y, width, height, strokeColor, backgroundColor | Create diamond shape |
| `AddArrow` | startX, startY, endX, endY, strokeColor | Draw arrow between points |
| `AddLine` | startX, startY, endX, endY, strokeColor | Draw line between points |
| `AddText` | x, y, text, fontSize, strokeColor | Add text element |
| `UpdateElement` | elementId, x?, y?, width?, height?, text?, strokeColor?, backgroundColor? | Modify existing element |
| `DeleteElements` | elementIds[] | Remove elements by ID |
| `ClearCanvas` | - | Clear all elements |
| `GetCanvasState` | - | Return all elements and app state |

---

## SignalR Communication

### Hub Methods

**Client → Server:**
- `SendMessage(user, message)` - Send chat message to AI agent

**Server → Client:**
- `ReceiveMessage(user, message)` - Display AI response
- `ExecuteTool(action, data)` - Execute tool and return `ToolCallResult`

### Blocking Tool Calls

```csharp
// Server-side (ExcalidrawMcpTools.cs)
var result = await _hubContext.Clients.Client(connectionId)
    .InvokeAsync<ToolCallResult>("ExecuteTool", action, data, cancellationToken);

// Client-side (ChatPanel.razor)
hubConnection.On("ExecuteTool", async (string action, JsonElement data) =>
{
    var elementId = await JSRuntime.InvokeAsync<string>("ExcalidrawAPI.addElement", containerId, data);
    return new ToolCallResult { Success = true, ElementId = elementId };
});
```

---

## Configuration

### Environment Variables / appsettings.json

```json
{
  "OpenAI": {
    "Endpoint": "http://localhost:5000/v1",
    "ApiKey": "sk-...",
    "Model": "gpt-4o-mini"
  },
  "MCP": {
    "Endpoint": "http://localhost:8080/mcp"
  }
}
```

---

## Development

### Quick Start
```bash
docker compose up --build -d
# Access at http://localhost:8080
```

### Local Development
```bash
# Build JS adapter
cd AiDiagram.JsAdapter && npm install && npm run build

# Run .NET
dotnet run --project AiDiagram.Server
```

---

## Future Enhancements

- **Canvas context for LLM** - Include current elements in system prompt
- **Undo/Rollback** - State snapshots before AI changes
- **Configuration UI** - Settings panel in sidebar
- **Streaming responses** - Real-time token streaming
- **Multi-step operations** - Complex diagram generation sequences
- **Template library** - Pre-built diagram patterns
