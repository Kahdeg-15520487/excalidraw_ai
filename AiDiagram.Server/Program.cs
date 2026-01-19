using AiDiagram.Server.Hubs;
using AiDiagram.Server.MCP;
using AiDiagram.Server.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();
builder.Services.AddSignalR();
builder.Services.AddSingleton<AgentService>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5000", "http://localhost:5173", "http://localhost:8080")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add MCP Server with HTTP transport
builder.Services.AddMcpServer()
    .WithHttpTransport()
    .WithTools<ExcalidrawTools>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();

// Only use HTTPS redirect in production with proper HTTPS setup
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Map SignalR Hub
app.MapHub<DiagramHub>("/diagramhub");

// Map MCP Server endpoint
app.MapMcp("/mcp");

// Chat endpoint
app.MapPost("/api/chat", async (ChatRequest request, AgentService agentService) =>
{
    var response = await agentService.ProcessMessageAsync(request.SessionId, request.Message);
    return Results.Ok(new { response });
});

app.Run();

public record ChatRequest(string SessionId, string Message);
