using Fin.Api;
using Fin.Api.Common.Api;
using Fin.Api.Data;
using Fin.Api.Endpoints;
using Fin.Core;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.AddConfiguration();
builder.AddServices();
builder.AddSecurity();
builder.AddDataContexts();
builder.AddCrossOrigin();
builder.AddDocumentation();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await context.Database.MigrateAsync();
}

await DbInitializer.InitializeAsync(app.Services, app.Configuration);

if (app.Environment.IsDevelopment())
    app.ConfigureDevEnvironment();
else
{
    app.UseExceptionHandler(exceptionHandler => exceptionHandler.Run(async context =>
    {
        await Results.Problem(
            statusCode: StatusCodes.Status500InternalServerError,
            title: "Não foi possível processar a solicitação.")
            .ExecuteAsync(context);
    }));
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseCors(ApiConfiguration.CorsPolicyName);
app.UseRateLimiter();
app.UseSecurity();
app.MapEndpoints();
app.MapGet("/health", async (AppDbContext context, CancellationToken cancellationToken) =>
        await context.Database.CanConnectAsync(cancellationToken)
            ? Results.Ok(new { status = "Healthy" })
            : Results.Problem(
                statusCode: StatusCodes.Status503ServiceUnavailable,
                title: "Database unavailable"))
    .AllowAnonymous()
    .ExcludeFromDescription();

app.Run();
