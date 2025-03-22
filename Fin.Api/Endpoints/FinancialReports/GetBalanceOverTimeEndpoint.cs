using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Fin.Api.Common.Api;
using Fin.Core.Handlers;
using Fin.Core.Models;
using Fin.Core.Responses;
using Microsoft.AspNetCore.Mvc;

namespace Fin.Api.Endpoints.FinancialReports
{
    public class GetBalanceOverTimeEndpoint : IEndpoint 
    {
        public static void Map(IEndpointRouteBuilder app)
        => app.MapGet("/balance-over-time", HandleAsync)
        .WithName("FinancialReports: GetBalanceOverTime")
        .WithSummary("Obtém o saldo ao longo do tempo")
        .WithDescription("Retorna o saldo para cada mês em um período específico")
        .WithOrder(5)
        .Produces<List<BalanceOverTimeDTO>>();

        private static async Task<IResult> HandleAsync(
            ClaimsPrincipal user,
            ITransactionHandler handler,
            [FromQuery] int months = 6)
        {
            var balanceOverTime = await handler.GetBalanceOverTime(months);
            return TypedResults.Ok(balanceOverTime);
        }
    }
}