# Build stage for JS Adapter (Excalidraw bundle) - needs to run first
FROM node:20-alpine AS js-build
WORKDIR /src
# Copy the entire source to maintain the relative path structure
COPY AiDiagram.JsAdapter/package*.json ./AiDiagram.JsAdapter/
COPY AiDiagram.JsAdapter/ ./AiDiagram.JsAdapter/
# Create the output directory structure
RUN mkdir -p /src/AiDiagram.Client/wwwroot/js
WORKDIR /src/AiDiagram.JsAdapter
RUN npm ci && npm run build

# Build stage for .NET
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY AiDiagram.sln .
COPY AiDiagram.Server/AiDiagram.Server.csproj AiDiagram.Server/
COPY AiDiagram.Client/AiDiagram.Client.csproj AiDiagram.Client/
COPY AiDiagram.Shared/AiDiagram.Shared.csproj AiDiagram.Shared/

# Restore dependencies
RUN dotnet restore

# Copy all source code
COPY . .

# Build and publish Server (Debug for faster iteration)
RUN dotnet publish AiDiagram.Server/AiDiagram.Server.csproj -c Debug -o /app/server --no-restore

# Build and publish Client (Blazor WASM) - Debug for faster iteration
RUN dotnet publish AiDiagram.Client/AiDiagram.Client.csproj -c Debug -o /app/client --no-restore

# Final runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Copy published .NET server
COPY --from=build /app/server .

# Copy Blazor WASM client wwwroot (published output)
COPY --from=build /app/client/wwwroot/ /app/wwwroot/

# Copy lib folder (Bootstrap) from source - not included in publish
COPY --from=build /src/AiDiagram.Client/wwwroot/lib/ /app/wwwroot/lib/

# Copy Excalidraw JS bundle built by node stage
COPY --from=js-build /src/AiDiagram.Client/wwwroot/js/ /app/wwwroot/js/

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "AiDiagram.Server.dll"]
