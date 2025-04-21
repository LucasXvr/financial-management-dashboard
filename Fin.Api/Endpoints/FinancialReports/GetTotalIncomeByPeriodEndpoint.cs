using System.Security.Claims;
using Fin.Api.Common.Api;
using Fin.Core.Handlers;
using Microsoft.AspNetCore.Mvc;

namespace Fin.Api.Endpoints.FinancialReports
{
    public class GetTotalIncomeByPeriodEndpoint : IEndpoint
    {
        public static void Map(IEndpointRouteBuilder app)
        => app.MapGet("/total-income", HandleAsync)
            .WithName("FinancialReports: GetTotalIncomeByPeriod")
            .WithSummary("Obtém o total de receitas em um período")
            .WithDescription("Retorna o total de receitas do usuário em um período específico")
            .WithOrder(2)
            .Produces<decimal>();

        private static async Task<IResult> HandleAsync(
            ClaimsPrincipal user,
            ITransactionHandler handler,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return TypedResults.BadRequest(0m);

            var totalIncome = await handler.GetTotalIncomeByPeriod(userId, startDate, endDate);
            return TypedResults.Ok(totalIncome);
        }
    }
}