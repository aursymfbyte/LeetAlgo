FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish LeetAlgo.Api/LeetAlgo.Api.csproj --configuration Release --output /publish/api
RUN dotnet publish LeetAlgo.Tools/LeetAlgo.Tools.csproj --configuration Release --output /publish/tools

FROM mcr.microsoft.com/dotnet/runtime:10.0 AS tools
WORKDIR /app
COPY --from=build /publish/tools .
COPY LeetAlgo.Tools/SourceData /data
ENTRYPOINT ["dotnet", "LeetAlgo.Tools.dll"]

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS api
WORKDIR /app
COPY --from=build /publish/api .
ENTRYPOINT ["dotnet", "LeetAlgo.Api.dll"]
