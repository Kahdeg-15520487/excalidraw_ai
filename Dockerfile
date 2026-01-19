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

# Build and publish
RUN dotnet publish AiDiagram.Server/AiDiagram.Server.csproj -c Release -o /app/publish

# Build stage for JS Adapter (Excalidraw bundle)
FROM node:20-alpine AS js-build
WORKDIR /js
COPY AiDiagram.JsAdapter/package*.json ./
RUN npm ci
COPY AiDiagram.JsAdapter/ .
RUN npm run build

# Final runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Copy published .NET app
COPY --from=build /app/publish .

# Copy JS bundle to wwwroot
COPY --from=js-build /js/../AiDiagram.Client/wwwroot/js ./wwwroot/js

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "AiDiagram.Server.dll"]
