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
            .WithName("FinancialReports: GetSavings")
            .WithSummary("Obtém o total de economia em um período")
            .WithDescription("Retorna a diferença entre receitas e despesas em um período específico")
            .WithOrder(4)
            .Produces<decimal>();

        private static async Task<IResult> HandleAsync(
            ClaimsPrincipal user,
            ITransactionHandler handler,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var savings = await handler.GetSavingsByPeriod(startDate, endDate);
            return TypedResults.Ok(savings);
        }                    
    }
}