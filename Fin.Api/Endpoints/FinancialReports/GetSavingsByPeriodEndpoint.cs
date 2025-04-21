using System.Security.Claims;
using Fin.Api.Common.Api;
using Fin.Core.Handlers;
using Microsoft.AspNetCore.Mvc;

namespace Fin.Api.Endpoints.FinancialReports
{
    public class GetSavingsByPeriodEndpoint : IEndpoint
    {
        public static void Map(IEndpointRouteBuilder app)
        => app.MapGet("/savings", HandleAsync)
            .WithName("FinancialReports: GetSavingsByPeriod")
            .WithSummary("Obtém a economia em um período")
            .WithDescription("Retorna a economia do usuário (receitas - despesas) em um período específico")
            .WithOrder(4)
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

            var savings = await handler.GetSavingsByPeriod(userId, startDate, endDate);
            return TypedResults.Ok(savings);
        }                    
    }
}