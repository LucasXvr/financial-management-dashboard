using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Fin.Api.Data;
using Fin.Core.Common.Extensions;
using Fin.Core.Enums;
using Fin.Core.Handlers;
using Fin.Core.Models;
using Fin.Core.Requests.Transactions;
using Fin.Core.Responses;
using Microsoft.EntityFrameworkCore;

namespace Fin.Api.Handlers
{
    public class TransactionHandler(AppDbContext context) : ITransactionHandler
    {
        public async Task<Response<Transaction?>> CreateAsync(CreateTransactionRequest request)
        {
            if (request.Type == ETransactionType.Withdraw)
                request.Amount = -Math.Abs(request.Amount);
            else
                request.Amount = Math.Abs(request.Amount);

            try
            {
                var transaction = new Transaction
                {
                    UserId = request.UserId,
                    CategoryId = request.CategoryId,
                    CreatedAt = DateTime.Now,
                    Amount = request.Amount,
                    PaidOrReceivedAt = request.PaidOrReceivedAt,
                    Title = request.Title,
                    Type = request.Type,
                    IsSavings = request.Type == ETransactionType.Saving
                };

                await context.Transactions.AddAsync(transaction);
                await context.SaveChangesAsync();

                return new Response<Transaction?>(transaction, 201, "Transação criada com sucesso!");
            }
            catch
            {
                return new Response<Transaction?>(null, 500, "Não foi possível criar sua transação");
            }
        }
        
        public async Task<Response<Transaction?>> DeleteAsync(DeleteTransactionRequest request)
        {
            try
            {
                var transaction = await context
                    .Transactions
                    .FirstOrDefaultAsync(x => x.Id == request.Id && x.UserId == request.UserId);

                if (transaction is null)
                    return new Response<Transaction?>(null, 404, "Transação não encontrada");

                context.Transactions.Remove(transaction);
                await context.SaveChangesAsync();

                return new Response<Transaction?>(transaction);
            }
            catch
            {
                return new Response<Transaction?>(null, 500, "Não foi possível recuperar sua transação");
            }
        }

        public async Task<Response<Transaction?>> GetByIdAsync(GetTransactionByIdRequest request)
        {
            try
            {
                var transaction = await context
                    .Transactions
                    .FirstOrDefaultAsync(x => x.Id == request.Id && x.UserId == request.UserId);

                return transaction is null
                    ? new Response<Transaction?>(null, 404, "Transação não encontrada")
                    : new Response<Transaction?>(transaction);
            }
            catch
            {
                return new Response<Transaction?>(null, 500, "Não foi possível recuperar sua transação");
            }
        }

        public async Task<PagedResponse<List<Transaction>?>> GetByPeriodAsync(GetTransactionsByPeriodRequest request)
        {
            try
            {
                request.StartDate ??= DateTime.Now.GetFirstDay();
                request.EndDate ??= DateTime.Now.GetLastDay();
            }
            catch
            {
                return new PagedResponse<List<Transaction>?>(null, 500,
                    "Não foi possível determinar a data de início ou término");
            }

            try
            {
                var query = context
                    .Transactions
                    .AsNoTracking()
                    .Where(x =>
                        x.PaidOrReceivedAt >= request.StartDate &&
                        x.PaidOrReceivedAt <= request.EndDate &&
                        x.UserId == request.UserId)
                    .OrderBy(x => x.PaidOrReceivedAt);

                var transactions = await query
                    .Skip((request.PageNumber - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToListAsync();

                var count = await query.CountAsync();

                return new PagedResponse<List<Transaction>?>(
                    transactions,
                    count,
                    request.PageNumber,
                    request.PageSize);
            }
            catch
            {
                return new PagedResponse<List<Transaction>?>(null, 500, "Não foi possível obter as transações");
            }
        }

        public async Task<Response<Transaction?>> UpdateAsync(UpdateTransactionRequest request)
        {
            if (request.Type == ETransactionType.Withdraw)
                request.Amount = -Math.Abs(request.Amount);
            else
                request.Amount = Math.Abs(request.Amount);

            try
            {
                var transaction = await context
                    .Transactions
                    .FirstOrDefaultAsync(x => x.Id == request.Id && x.UserId == request.UserId);

                if (transaction is null)
                    return new Response<Transaction?>(null, 404, "Transação não encontrada");

                transaction.CategoryId = request.CategoryId;
                transaction.Amount = request.Amount;
                transaction.Title = request.Title;
                transaction.Type = request.Type;
                transaction.PaidOrReceivedAt = request.PaidOrReceivedAt;

                context.Transactions.Update(transaction);
                await context.SaveChangesAsync();

                return new Response<Transaction?>(transaction);
            }
            catch
            {
                return new Response<Transaction?>(null, 500, "Não foi possível recuperar sua transação");
            }
        }
    
        public async Task<decimal> GetCurrentBalance(string userId)
        {
            var transactions = await context.Transactions
                .Where(t => t.UserId == userId)
                .ToListAsync();
            
            var deposits = transactions
                .Where(t => t.Type == ETransactionType.Deposit)
                .ToList();

            var withdraws = transactions
                .Where(t => t.Type == ETransactionType.Withdraw)
                .ToList();

            var depositsSum = deposits.Sum(t => t.Amount);
            var withdrawsSum = withdraws.Sum(t => t.Amount);

            return depositsSum - Math.Abs(withdrawsSum);         
        }

        public async Task<decimal> GetTotalIncomeByPeriod(string userId, DateTime start, DateTime end)
        {
            return await context.Transactions
                .Where(t => t.UserId == userId &&
                           t.Type == ETransactionType.Deposit && 
                           t.PaidOrReceivedAt >= start && 
                           t.PaidOrReceivedAt <= end)
                .SumAsync(t => t.Amount);
        }

        public async Task<decimal> GetTotalExpensesByPeriod(string userId, DateTime start, DateTime end)
        {
            return await context.Transactions
                .Where(t => t.UserId == userId &&
                           t.Type == ETransactionType.Withdraw && 
                           t.PaidOrReceivedAt >= start && 
                           t.PaidOrReceivedAt <= end)
                .SumAsync(t => t.Amount);
        }

        public async Task<decimal> GetSavingsByPeriod(string userId, DateTime start, DateTime end)
        {
            return await context.Transactions
                .Where(t => t.UserId == userId &&
                           t.Type == ETransactionType.Saving &&
                           t.PaidOrReceivedAt >= start && 
                           t.PaidOrReceivedAt <= end)
                .SumAsync(t => t.Amount);
        }

        public async Task<List<BalanceOverTimeDTO>> GetBalanceOverTime(string userId, int months)
        {
            var result = new List<BalanceOverTimeDTO>();
            var currentDate = DateTime.Now;

            for (int i = months - 1; i >= 0; i--)
            {
                var date = currentDate.AddMonths(-i);
                var startOfMonth = new DateTime(date.Year, date.Month, 1);
                var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);

                // Calculamos o saldo acumulado até o final deste mês
                var totalIncome = await context.Transactions
                    .Where(t => t.UserId == userId &&
                               t.Type == ETransactionType.Deposit && 
                               t.PaidOrReceivedAt <= endOfMonth)
                    .SumAsync(t => t.Amount);

                var totalExpenses = await context.Transactions
                    .Where(t => t.UserId == userId &&
                               t.Type == ETransactionType.Withdraw && 
                               t.PaidOrReceivedAt <= endOfMonth)
                    .SumAsync(t => t.Amount);

                var balance = totalIncome - totalExpenses;

                result.Add(new BalanceOverTimeDTO
                {
                    Month = date.ToString("MMM", new System.Globalization.CultureInfo("pt-BR")),
                    Balance = balance
                });
            }

            return result;
        }

        public async Task<List<ExpensesByCategoryDTO>> GetExpensesByCategory(string userId, DateTime start, DateTime end)
        {
            return await context.Transactions
                .Where(t => t.UserId == userId && 
                           t.Type == ETransactionType.Withdraw && 
                           t.PaidOrReceivedAt >= start && 
                           t.PaidOrReceivedAt <= end)
                .GroupBy(t => t.Category.Title)
                .Select(g => new ExpensesByCategoryDTO
                {
                    Category = g.Key,
                    Amount = g.Sum(t => t.Amount)
                })
                .OrderByDescending(x => x.Amount)
                .Take(5) // Pegar as 5 maiores categorias
                .ToListAsync();
        }

        public async Task<List<TransactionsByMonthDTO>> GetTransactionsByMonth(string userId, int months)
        {
            var result = new List<TransactionsByMonthDTO>();
            var currentDate = DateTime.Now;

            for (int i = months - 1; i >= 0; i--)
            {
                var date = currentDate.AddMonths(-i);
                var startOfMonth = new DateTime(date.Year, date.Month, 1);
                var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);

                var income = await context.Transactions
                    .Where(t => t.UserId == userId &&
                               t.Type == ETransactionType.Deposit && 
                               t.PaidOrReceivedAt >= startOfMonth && 
                               t.PaidOrReceivedAt <= endOfMonth)
                    .SumAsync(t => t.Amount);

                var expenses = await context.Transactions
                    .Where(t => t.UserId == userId &&
                               t.Type == ETransactionType.Withdraw && 
                               t.PaidOrReceivedAt >= startOfMonth && 
                               t.PaidOrReceivedAt <= endOfMonth)
                    .SumAsync(t => t.Amount);

                result.Add(new TransactionsByMonthDTO
                {
                    Month = date.ToString("MMM", new System.Globalization.CultureInfo("pt-BR")),
                    Income = income,
                    Expenses = expenses
                });
            }

            return result;
        }

        public async Task<IEnumerable<Transaction>> GetSavingsByPeriod(DateTime startDate, DateTime endDate, string userId)
        {
            return await context.Transactions
                .Where(t => t.UserId == userId && 
                           t.Type == ETransactionType.Saving &&
                           t.CreatedAt >= startDate && 
                           t.CreatedAt <= endDate)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }
    }
}