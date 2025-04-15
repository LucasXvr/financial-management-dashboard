using Fin.Api;
using Fin.Api.Common.Api;
using Fin.Api.Data;
using Fin.Api.Endpoints;
using Fin.Core;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.AddConfiguration();
builder.AddSecurity();
builder.AddDataContexts();
builder.AddCrossOrigin();
builder.AddDocumentation();
builder.AddServices();

var app = builder.Build();

// Inicializar o banco de dados
bool dbInitialized = false;
try
{
    // Garantir que o banco de dados está criado
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await context.Database.MigrateAsync();
    Console.WriteLine("Migração do banco de dados concluída com sucesso.");
    
    // Inicializar roles e usuário admin
    await DbInitializer.InitializeAsync(app.Services);
    Console.WriteLine("Banco de dados inicializado com sucesso.");
    dbInitialized = true;
}
catch (Exception ex)
{
    Console.WriteLine($"Erro ao inicializar o banco de dados: {ex.Message}");
    Console.WriteLine(ex.StackTrace);
    
    // Tentar inicializar o banco de dados novamente
    try
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await context.Database.MigrateAsync();
        Console.WriteLine("Segunda tentativa de migração do banco de dados concluída com sucesso.");
        
        // Inicializar roles e usuário admin
        await DbInitializer.InitializeAsync(app.Services);
        Console.WriteLine("Banco de dados inicializado com sucesso na segunda tentativa.");
        dbInitialized = true;
    }
    catch (Exception innerEx)
    {
        Console.WriteLine($"Erro na segunda tentativa de inicializar o banco de dados: {innerEx.Message}");
        Console.WriteLine(innerEx.StackTrace);
    }
}

if (!dbInitialized)
{
    Console.WriteLine("AVISO: O banco de dados não foi inicializado corretamente. O aplicativo pode não funcionar como esperado.");
}

if (app.Environment.IsDevelopment())
    app.ConfigureDevEnvironment();

app.UseCors(ApiConfiguration.CorsPolicyName);
app.UseSecurity();
app.MapEndpoints();

app.Run();