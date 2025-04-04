using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Fin.Api.Common.Api;
using Fin.Api.Endpoints.Categories;
using Fin.Api.Endpoints.FinancialReports;
using Fin.Api.Endpoints.FinancialReportsName;
using Fin.Api.Endpoints.Identity;
using Fin.Api.Endpoints.Transactions;
using Fin.Api.Models;

namespace Fin.Api.Endpoints
{
    public static class Endpoint
    {
        public static void MapEndpoints(this WebApplication app)
        {
            var endpoints = app
            .MapGroup("");

            endpoints.MapGroup("/")
                .WithTags("Health Check")
                .MapGet("/", () => new { message = "OK" });

            endpoints.MapGroup("v1/categories")
                .WithTags("Categories")
                // .RequireAuthorization()
                .MapEndpoint<CreateCategoryEndpoint>()
                .MapEndpoint<UpdateCategoryEndpoint>()
                .MapEndpoint<DeleteCategoryEndpoint>()
                .MapEndpoint<GetCategoryByIdEndpoint>()
                .MapEndpoint<GetAllCategoriesEndpoint>();

            endpoints.MapGroup("v1/transactions")
                .WithTags("Transactions")
                // .RequireAuthorization()
                .MapEndpoint<CreateTransactionEndpoint>()
                .MapEndpoint<UpdateTransactionEndpoint>()
                .MapEndpoint<DeleteTransactionEndpoint>()
                .MapEndpoint<GetTransactionByIdEndpoint>()
                .MapEndpoint<GetTransactionsByPeriodEndpoint>();

            endpoints.MapGroup("v1/identity")
                .WithTags("Identity")
                .MapIdentityApi<User>();

            endpoints.MapGroup("v1/identity")
                .WithTags("Identity")
                .MapEndpoint<LogoutEndpoint>()
                .MapEndpoint<GetRolesEndpoint>();

            endpoints.MapGroup("v1/financial-reports")
                .WithTags("Financial Reports")
                // .RequireAuthorization()
                .MapEndpoint<GetCurrentBalanceEndpoint>()
                .MapEndpoint<GetTotalIncomeByPeriodEndpoint>()
                .MapEndpoint<GetTotalExpensesByPeriodEndpoint>()
                .MapEndpoint<GetSavingsByPeriodEndpoint>()
                .MapEndpoint<GetBalanceOverTimeEndpoint>()
                .MapEndpoint<GetExpensesByCategoryEndpoint>()
                .MapEndpoint<GetTransactionsByMonthEndpoint>();
        }

        private static IEndpointRouteBuilder MapEndpoint<TEndpoint>(this IEndpointRouteBuilder app)
            where TEndpoint : IEndpoint
        {
            TEndpoint.Map(app);
            return app;
        }
    }
}