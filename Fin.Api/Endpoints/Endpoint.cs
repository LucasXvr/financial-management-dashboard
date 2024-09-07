using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Fin.Api.Common.Api;
using Fin.Api.Endpoints.Transactions;

namespace Fin.Api.Endpoints
{
    public static class Endpoint
    {
        public static void MapEndpoints(this WebApplication app)
        {
            var endpoints = app.MapGroup("");

            endpoints.MapGroup("/")
            .WithTags("Health Check")
            .MapGet("/", () => new { message = "OK" });

            endpoints.MapGroup("v1/transactions")
                .WithTags("Transactions")
                .RequireAuthorization()
                .MapEndpoint<CreateTransactionEndpoint>();
            // .MapEndpoint<UpdateTransactionEndpoint>()
            // .MapEndpoint<DeleteTransactionEndpoint>()
            // .MapEndpoint<GetTransactionByIdEndpoint>()
            // .MapEndpoint<GetTransactionsByPeriodEndpoint>();
        }

        private static IEndpointRouteBuilder MapEndpoint<TEndpoint>(this IEndpointRouteBuilder app)
        where TEndpoint : IEndpoint
        {
            TEndpoint.Map(app);
            return app;
        }
    }
}