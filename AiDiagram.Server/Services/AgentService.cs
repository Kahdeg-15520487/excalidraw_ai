using AiDiagram.Server.MCP;
using Microsoft.Agents.AI;
using Microsoft.Extensions.AI;
using ModelContextProtocol.Client;

namespace AiDiagram.Server.Services;

public class AgentService
{
    private readonly IConfiguration _configuration;

    public AgentService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<string> ProcessMessageAsync(string sessionId, string userMessage)
    {

        // Get configuration
        var endpoint = _configuration["OpenAI:Endpoint"] ?? "http://localhost:5000/v1";
        var apiKey = _configuration["OpenAI:ApiKey"] ?? "sk-placeholder";
        var model = _configuration["OpenAI:Model"] ?? "gpt-4o-mini";

        // Setup MCP Client for Excalidraw tools
        // Note: MCP:Endpoint should include the full path (e.g., http://localhost:8080/mcp)
        var mcpEndpoint = _configuration["MCP:Endpoint"] ?? "http://localhost:8080/mcp";
        
        var transportOptions = new HttpClientTransportOptions
        {
            Endpoint = new Uri(mcpEndpoint),
            Name = "ExcalidrawMCP"
        };
        
        // Add session ID header via custom HttpClient
        var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Add("X-Session-ID", sessionId);
        
        var clientTransport = new HttpClientTransport(transportOptions, httpClient);

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
        
        // Session context is now passed via HTTP headers
        
        var result = await agent.RunAsync(messages, options: null, thread: thread);

        return result.Text ?? "I processed your request.";
    }


}
