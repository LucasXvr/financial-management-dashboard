using System.Security.Claims;
using Fin.Api.Common.Api;
using Fin.Core.Handlers;
using Fin.Core.Responses.Accounts;

namespace Fin.Api.Endpoints.Accounts;

public class GetFinancialAccountEndpoint : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app)
        => app.MapGet("/default", HandleAsync)
            .WithName("Accounts: Get default account")
            .WithSummary("Obtém o saldo disponível da conta principal")
            .Produces<FinancialAccountSummary>();

    private static async Task<IResult> HandleAsync(
        ClaimsPrincipal user,
        IFinancialAccountHandler handler)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        return string.IsNullOrWhiteSpace(userId)
            ? TypedResults.Unauthorized()
            : TypedResults.Ok(await handler.GetSummaryAsync(userId));
    }
}
