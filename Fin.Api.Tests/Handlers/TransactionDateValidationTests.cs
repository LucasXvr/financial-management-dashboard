using Fin.Api.Data;
using Fin.Api.Handlers;
using Fin.Core.Enums;
using Fin.Core.Models;
using Fin.Core.Requests.Transactions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Fin.Api.Tests.Handlers;

public class TransactionDateValidationTests
{
    private const string UserId = "date-test-user";
    private static readonly DateTime SaoPauloToday = new(2026, 9, 29);
    private static readonly TimeProvider Clock = new FixedTimeProvider(
        new DateTimeOffset(2026, 9, 29, 15, 0, 0, TimeSpan.Zero));

    [Fact]
    public async Task CreateTransaction_RejectsFutureDate()
    {
        await using var context = CreateContext();
        var category = await AddCategoryAsync(context);
        var handler = new TransactionHandler(context, Clock);

        var response = await handler.CreateAsync(CreateRequest(
            category.Id,
            SaoPauloToday.AddDays(1)));

        Assert.False(response.IsSuccess);
        Assert.Equal("A data da transação não pode ser futura", response.Message);
        Assert.Empty(await context.Transactions.ToListAsync());
    }

    [Fact]
    public async Task CreateTransaction_AcceptsCurrentDate()
    {
        await using var context = CreateContext();
        var category = await AddCategoryAsync(context);
        var handler = new TransactionHandler(context, Clock);

        var response = await handler.CreateAsync(CreateRequest(category.Id, SaoPauloToday));

        Assert.True(response.IsSuccess);
        Assert.Single(await context.Transactions.ToListAsync());
    }

    [Fact]
    public async Task UpdateTransaction_RejectsFutureDateAndPreservesExistingDate()
    {
        await using var context = CreateContext();
        var category = await AddCategoryAsync(context);
        var transaction = await AddTransactionAsync(context, category.Id, SaoPauloToday);
        var handler = new TransactionHandler(context, Clock);

        var response = await handler.UpdateAsync(UpdateRequest(
            transaction.Id,
            category.Id,
            SaoPauloToday.AddDays(1)));

        Assert.False(response.IsSuccess);
        Assert.Equal("A data da transação não pode ser futura", response.Message);

        await context.Entry(transaction).ReloadAsync();
        Assert.Equal(SaoPauloToday, transaction.PaidOrReceivedAt);
    }

    [Fact]
    public async Task UpdateTransaction_AcceptsPastDate()
    {
        await using var context = CreateContext();
        var category = await AddCategoryAsync(context);
        var transaction = await AddTransactionAsync(context, category.Id, SaoPauloToday);
        var handler = new TransactionHandler(context, Clock);
        var yesterday = SaoPauloToday.AddDays(-1);

        var response = await handler.UpdateAsync(UpdateRequest(
            transaction.Id,
            category.Id,
            yesterday));

        Assert.True(response.IsSuccess);
        await context.Entry(transaction).ReloadAsync();
        Assert.Equal(yesterday, transaction.PaidOrReceivedAt);
    }

    [Fact]
    public async Task CreateTransaction_UsesSaoPauloDateWhenUtcIsAlreadyNextDay()
    {
        await using var context = CreateContext();
        var category = await AddCategoryAsync(context);
        var utcNextDayClock = new FixedTimeProvider(
            new DateTimeOffset(2026, 9, 30, 0, 30, 0, TimeSpan.Zero));
        var handler = new TransactionHandler(context, utcNextDayClock);

        var futureResponse = await handler.CreateAsync(CreateRequest(
            category.Id,
            new DateTime(2026, 9, 30)));
        var currentResponse = await handler.CreateAsync(CreateRequest(
            category.Id,
            new DateTime(2026, 9, 29)));

        Assert.False(futureResponse.IsSuccess);
        Assert.Equal("A data da transação não pode ser futura", futureResponse.Message);
        Assert.True(currentResponse.IsSuccess);
        Assert.Single(await context.Transactions.ToListAsync());
    }

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        var context = new AppDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    private static async Task<Category> AddCategoryAsync(AppDbContext context)
    {
        var category = new Category
        {
            UserId = UserId,
            Title = "Categoria de datas",
            Description = "Categoria de teste"
        };

        context.Categories.Add(category);
        await context.SaveChangesAsync();
        return category;
    }

    private static async Task<Transaction> AddTransactionAsync(
        AppDbContext context,
        long categoryId,
        DateTime paidOrReceivedAt)
    {
        var transaction = new Transaction
        {
            UserId = UserId,
            CategoryId = categoryId,
            Title = "Transação existente",
            Amount = 50,
            Type = ETransactionType.Deposit,
            PaidOrReceivedAt = paidOrReceivedAt
        };

        context.Transactions.Add(transaction);
        await context.SaveChangesAsync();
        return transaction;
    }

    private static CreateTransactionRequest CreateRequest(long categoryId, DateTime date)
        => new()
        {
            UserId = UserId,
            CategoryId = categoryId,
            Title = "Nova transação",
            Amount = 100,
            Type = ETransactionType.Deposit,
            PaidOrReceivedAt = date
        };

    private static UpdateTransactionRequest UpdateRequest(
        long transactionId,
        long categoryId,
        DateTime date)
        => new()
        {
            Id = transactionId,
            UserId = UserId,
            CategoryId = categoryId,
            Title = "Transação atualizada",
            Amount = 100,
            Type = ETransactionType.Deposit,
            PaidOrReceivedAt = date
        };

    private sealed class FixedTimeProvider(DateTimeOffset utcNow) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => utcNow;
    }
}
