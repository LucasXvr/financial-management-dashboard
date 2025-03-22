using System.Security.Claims;
using Fin.Api.Common.Api;
using Fin.Core.Handlers;
using Microsoft.AspNetCore.Mvc;

namespace Fin.Api.Endpoints.FinancialReportsName
{
    public class GetTotalIncomeByPeriodEndpoint : IEndpoint
    {
        public static void Map(IEndpointRouteBuilder app)
        => app.MapGet("/income", HandleAsync)
            .WithName("FinancialReports: GetTotalIncome")
            .WithSummary("Obtém o total de receitas em um período")
            .WithDescription("Retorna a soma de todas as receitas em um período específico")
            .WithOrder(2)
            .Produces<decimal>();

        private static async Task<IResult> HandleAsync(
            ClaimsPrincipal user,
            ITransactionHandler handler,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var income = await handler.GetTotalIncomeByPeriod(startDate, endDate);
            return TypedResults.Ok(income);
        }
    }
}