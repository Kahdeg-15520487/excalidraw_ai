using AiDiagram.Server.Hubs;
using Microsoft.Agents.AI;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.AI;
using ModelContextProtocol.Client;

namespace AiDiagram.Server.Services;

public class AgentService
{
    private readonly IHubContext<DiagramHub> _hubContext;
    private readonly IConfiguration _configuration;

    public AgentService(IHubContext<DiagramHub> hubContext, IConfiguration configuration)
    {
        _hubContext = hubContext;
        _configuration = configuration;
    }

    public async Task<string> ProcessMessageAsync(string sessionId, string userMessage)
    {
        var connectionId = DiagramHub.GetConnectionId(sessionId);
        if (connectionId == null)
        {
            return "Error: Client not connected.";
        }

        // Get configuration
        var endpoint = _configuration["OpenAI:Endpoint"] ?? "http://localhost:5000/v1";
        var apiKey = _configuration["OpenAI:ApiKey"] ?? "sk-placeholder";
        var model = _configuration["OpenAI:Model"] ?? "gpt-4o-mini";

        // Setup MCP Client for Excalidraw tools
        var mcpEndpoint = _configuration["MCP:Endpoint"] ?? "http://localhost:5500";
        
        var transportOptions = new HttpClientTransportOptions
        {
            Endpoint = new Uri(mcpEndpoint),
        };
        var clientTransport = new HttpClientTransport(transportOptions);

        await using var mcpClient = await McpClient.CreateAsync(clientTransport);
        IList<McpClientTool> tools = await mcpClient.ListToolsAsync();

        // Create agent using Microsoft Agent Framework with custom OpenAI endpoint
        var chatClient = new OpenAI.Chat.ChatClient(
            model,
            new System.ClientModel.ApiKeyCredential(apiKey),
            new OpenAI.OpenAIClientOptions { Endpoint = new Uri(endpoint) }
        ).AsIChatClient();

        AIAgent agent = new ChatClientBuilder(chatClient)
            .Build()
            .CreateAIAgent(
                instructions: @"You are a technical diagram assistant that helps users create and modify diagrams.
When the user asks you to draw something, you should:
1. Analyze their request
2. Use the available tools to draw shapes, add text, and connect elements
3. Confirm what you drew

Always respond conversationally and confirm your actions.",
                name: "DiagramBot",
                tools: [.. tools]
            );

        var thread = agent.GetNewThread();

        // Use Microsoft.Extensions.AI.ChatMessage
        List<Microsoft.Extensions.AI.ChatMessage> messages =
        [
            new Microsoft.Extensions.AI.ChatMessage(ChatRole.User, userMessage),
        ];

        var result = await agent.RunAsync(messages, options: null, thread: thread);

        return result.Text ?? "I processed your request.";
    }

    public async Task ExecuteToolOnClient(string connectionId, string toolName, object parameters)
    {
        await _hubContext.Clients.Client(connectionId).SendAsync("ExecuteTool", toolName, parameters);
    }
}
