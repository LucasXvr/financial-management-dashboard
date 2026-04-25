FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

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

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY . /src/
RUN dotnet tool update --global dotnet-ef || dotnet tool install --global dotnet-ef
ENV PATH="${PATH}:/root/.dotnet/tools"
ENV ASPNETCORE_URLS=http://+:80

ENTRYPOINT ["dotnet", "Fin.Api.dll"]