FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Fin.Api/Fin.Api.csproj", "Fin.Api/"]
COPY ["Fin.Core/Fin.Core.csproj", "Fin.Core/"]
RUN dotnet restore "Fin.Api/Fin.Api.csproj"
COPY . .
WORKDIR "/src/Fin.Api"
RUN dotnet build "Fin.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Fin.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "Fin.Api.dll"]
