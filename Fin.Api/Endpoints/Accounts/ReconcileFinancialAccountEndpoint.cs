using System.Security.Claims;
using Fin.Api.Common.Api;
using Fin.Core.Handlers;
using Fin.Core.Requests.Accounts;
using Fin.Core.Responses.Accounts;

namespace Fin.Api.Endpoints.Accounts;

public class ReconcileFinancialAccountEndpoint : IEndpoint
{
    public static void Map(IEndpointRouteBuilder app)
        => app.MapPut("/default/balance", HandleAsync)
            .WithName("Accounts: Reconcile default account")
            .WithSummary("Ajusta a conta principal para o saldo bancário informado")
            .Produces<FinancialAccountSummary>();

    private static async Task<IResult> HandleAsync(
        ClaimsPrincipal user,
        IFinancialAccountHandler handler,
        UpdateCurrentBalanceRequest request)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return TypedResults.Unauthorized();

        request.UserId = userId;
        return TypedResults.Ok(await handler.ReconcileAsync(userId, request.CurrentBalance));
    }
}
