# AI-Powered Excalidraw Diagram Authoring Tool

## Project Overview

An LLM-powered technical diagram authoring application that combines Excalidraw's diagram editor with an AI chat interface. Users can create and modify diagrams through natural language interactions with an OpenAI-compatible endpoint.

## Architecture Decision: In-App Tool Calling vs MCP

### Question: Should we use MCP (Model Context Protocol) or in-app tool calling?

**Decision: In-App Tool Calling**

### Comparison

#### MCP Server Architecture
**Pros:**
- Standardized protocol for tool exposure
- Reusable server across multiple clients (web, desktop, CLI)
- Better separation of concerns
- Server-side validation and execution
- Support for multiple transport types (stdio, HTTP, WebSocket)

**Cons:**
- Added architectural complexity
- Requires server deployment and management
- Transport overhead for each tool call
- Slower development iteration
- Need to maintain separate server codebase

#### In-App Tool Calling Architecture
**Pros:**
- Simpler architecture - all logic in browser
- Faster development and iteration
- No backend deployment required
- Direct access to Excalidraw API
- Easier debugging and testing
- Lower latency for tool execution

**Cons:**
- Tool logic coupled to frontend
- Harder to share across multiple applications
- All processing happens client-side

### Rationale for In-App Approach

1. **MVP Focus**: Faster time-to-market for single-application use case
2. **No Backend Needed**: Pure client-side application
3. **Direct Integration**: Direct access to Excalidraw's JavaScript API
4. **Simpler Deployment**: Static hosting (Vercel, Netlify, GitHub Pages)
5. **Future Migration Path**: Can abstract tool execution layer to enable MCP migration later if multi-client support is needed

## Technical Architecture

### Frontend Stack
- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **Diagram Editor**: @excalidraw/excalidraw
- **LLM Integration**: OpenAI SDK (supports custom endpoints)
- **State Management**: React hooks + context

### Layout Design
```
┌─────────────────────────────────────────────────────┐
│  Excalidraw Canvas        │    Chat Panel           │
│  (Diagram Editor)         │                         │
│                           │  ┌─────────────────┐    │
│                           │  │ Message History │    │
│                           │  │                 │    │
│                           │  │ User: ...       │    │
│                           │  │ AI: ...         │    │
│                           │  │                 │    │
│                           │  └─────────────────┘    │
│                           │  ┌─────────────────┐    │
│                           │  │ Input Field     │    │
│                           │  └─────────────────┘    │
│                           │  [Send] [Undo AI]       │
└─────────────────────────────────────────────────────┘
```

### Context Management Strategy

**Question: How to maintain diagram state context for the LLM?**

**Answer:** Serialize the entire Excalidraw scene as JSON and include it in the LLM context.

**Implementation:**
```typescript
// On each user message:
const elements = excalidrawAPI.getSceneElements();
const appState = excalidrawAPI.getAppState();
const files = excalidrawAPI.getFiles();

const diagramContext = serializeAsJSON(elements, appState, files, 'local');

// Include in system prompt or user message
const messages = [
  {
    role: 'system',
    content: `You are a diagram assistant. Current diagram state: ${diagramContext}`
  },
  // ... conversation history
];
```

**Benefits:**
- LLM has full awareness of current diagram state
- Can reference existing elements by ID
- Can make contextual suggestions
- Enables complex modifications based on current state

## Tool Execution & State Management

### Question: How are canvas updates applied?

**Answer:** Optimistic updates with rollback capability

**Implementation Strategy:**

1. **Immediate Application**: Tool calls execute immediately to update canvas
2. **State Snapshots**: Before each AI modification, capture a snapshot using `serializeAsJSON()`
3. **History Stack**: Maintain array of previous states
4. **Undo Functionality**: User can rollback AI changes with "Undo AI" button

```typescript
interface StateSnapshot {
  elements: ExcalidrawElement[];
  appState: AppState;
  files: BinaryFiles;
  timestamp: number;
  toolCallId: string;
}

class ToolExecutor {
  private stateHistory: StateSnapshot[] = [];
  
  async executeToolCall(toolCall: ToolCall) {
    // Capture current state before modification
    const snapshot = this.captureState();
    this.stateHistory.push(snapshot);
    
    // Execute tool and update canvas immediately
    await this.executeTools(toolCall);
    
    // Canvas updates happen in real-time
  }
  
  undoLastAIChange() {
    const previousState = this.stateHistory.pop();
    if (previousState) {
      // Restore previous state
      excalidrawAPI.updateScene(previousState);
    }
  }
}
```

### Question: User validation/preview - how does this work?

**Clarification:** The application doesn't implement a preview mode. Instead:
- Changes apply **immediately** to the canvas (optimistic updates)
- Users see the result in real-time
- If they don't like the changes, they use the **Undo AI** button to rollback
- This is simpler than a preview/approve workflow and provides faster feedback

## Tool Definitions

### Core Excalidraw Operations (8-12 tools)

1. **addRectangle** - Create rectangle element
2. **addEllipse** - Create ellipse/circle element
3. **addDiamond** - Create diamond shape
4. **addArrow** - Create arrow connecting elements
5. **addText** - Add text element
6. **addLine** - Create line/polyline
7. **updateElement** - Modify existing element properties
8. **deleteElements** - Remove elements by IDs
9. **groupElements** - Group multiple elements
10. **ungroupElements** - Ungroup grouped elements
11. **moveElements** - Reposition elements
12. **getCanvasState** - Return serialized diagram state

### Tool Schema Example

```typescript
{
  name: "addRectangle",
  description: "Add a rectangle to the canvas",
  parameters: {
    type: "object",
    properties: {
      x: { type: "number", description: "X coordinate" },
      y: { type: "number", description: "Y coordinate" },
      width: { type: "number", description: "Width of rectangle" },
      height: { type: "number", description: "Height of rectangle" },
      strokeColor: { type: "string", description: "Border color (hex)" },
      backgroundColor: { type: "string", description: "Fill color (hex)" },
      label: { type: "string", description: "Optional text label" }
    },
    required: ["x", "y", "width", "height"]
  }
}
```

## OpenAI Integration

### API Configuration
- Support for **official OpenAI API** endpoint
- Support for **custom endpoints** (local models, proxies, etc.)
- API key stored in localStorage
- Configurable via settings UI

### Function Calling Flow

```
User Input
    ↓
Serialize Canvas State (serializeAsJSON)
    ↓
Build Messages Array (system + history + current state)
    ↓
Call OpenAI API with function definitions
    ↓
Parse Response (text + tool calls)
    ↓
Execute Tool Calls → Update Canvas
    ↓
Save State Snapshot for Undo
    ↓
Display Assistant Response
```

## Implementation Plan

### Phase 1: Project Setup
- Initialize Vite + React + TypeScript project
- Install dependencies: @excalidraw/excalidraw, openai
- Configure build tools and TypeScript

### Phase 2: UI Layout
- Create main App component with split layout
- Integrate Excalidraw component
- Build ChatPanel component with message history
- Implement input field and send button

### Phase 3: Tool System
- Define OpenAI function schemas for all Excalidraw operations
- Build ToolExecutor class to translate tool calls to Excalidraw API
- Implement state snapshot and history management
- Add undo/redo functionality

### Phase 4: LLM Integration
- Set up OpenAI client with configurable endpoint
- Implement context serialization using `serializeAsJSON()`
- Build conversation flow with streaming support
- Handle tool call parsing and execution

### Phase 5: Configuration & Polish
- Add settings UI for API key and endpoint
- Implement localStorage persistence
- Add error handling and loading states
- Polish UI/UX

## Key Technical Details

### Excalidraw API Usage

**Get Scene State:**
```typescript
const elements = excalidrawAPI.getSceneElements();
const appState = excalidrawAPI.getAppState();
const files = excalidrawAPI.getFiles();
```

**Update Scene:**
```typescript
excalidrawAPI.updateScene({
  elements: [...newElements],
  appState: { viewBackgroundColor: "#fff" }
});
```

**Serialize for Context:**
```typescript
import { serializeAsJSON } from "@excalidraw/excalidraw";

const jsonString = serializeAsJSON(
  elements,
  appState,
  files,
  'local' // or 'database'
);
```

### State Management

**Snapshot Structure:**
- Full elements array
- AppState (viewport, selected elements, etc.)
- Files (images/attachments)
- Timestamp for debugging
- Tool call ID for traceability

**History Limits:**
- Keep last N snapshots (e.g., 10-20)
- Prevent memory bloat
- Option to clear history

## Future Enhancements

### Potential MCP Migration Path
If multi-client support becomes needed:
1. Extract ToolExecutor into standalone service
2. Implement MCP server with TypeScript SDK
3. Expose tools via HTTP/WebSocket transport
4. Keep web client as MCP client
5. Add desktop app, CLI, or other clients

### Advanced Features
- **Multi-step operations**: Complex diagram generation in sequence
- **Template library**: Pre-built diagram patterns
- **Export integration**: Auto-export to PNG/SVG after AI generation
- **Collaboration**: Real-time multi-user editing with AI assistance
- **Voice input**: Speech-to-diagram workflows
- **Diagram analysis**: AI describes/explains existing diagrams

## Questions & Answers Summary

**Q: MCP or in-app tool calling?**
A: In-app tool calling for faster MVP development, simpler architecture, and no backend requirements.

**Q: How does context management work?**
A: Serialize entire canvas as JSON using `serializeAsJSON()` and include in LLM context on each message.

**Q: How do users validate/preview changes?**
A: No preview mode - changes apply immediately (optimistic), user can undo with rollback button.

**Q: How are updates applied?**
A: Immediately to canvas, but previous state is captured in history stack for rollback.

**Q: Why not use MCP?**
A: MCP adds complexity for single-app use case. Can migrate later if multi-client support is needed by abstracting the tool execution layer.
