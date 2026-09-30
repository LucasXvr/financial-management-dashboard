using Fin.Api.Data;
using Fin.Api.Handlers;
using Fin.Core.Enums;
using Fin.Core.Models;
using Fin.Core.Requests.Categories;
using Fin.Core.Requests.Transactions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Fin.Api.Tests.Handlers;

public class CategoryTransactionIsolationTests
{
    private const string FirstUser = "user-a";
    private const string SecondUser = "user-b";
    private static readonly DateTime TestDate = new(2026, 9, 29);
    private static readonly TimeProvider Clock = new FixedTimeProvider(
        new DateTimeOffset(2026, 9, 29, 15, 0, 0, TimeSpan.Zero));

    [Fact]
    public async Task CreateTransaction_RejectsCategoryOwnedByAnotherUser()
    {
        await using var context = CreateContext();
        var firstUserCategory = await AddCategoryAsync(context, FirstUser);
        var handler = new TransactionHandler(context, Clock);

        var response = await handler.CreateAsync(new CreateTransactionRequest
        {
            UserId = SecondUser,
            CategoryId = firstUserCategory.Id,
            Title = "Tentativa cruzada",
            Amount = 100,
            Type = ETransactionType.Deposit,
            PaidOrReceivedAt = TestDate
        });

        Assert.False(response.IsSuccess);
        Assert.Equal("Categoria não encontrada para o usuário autenticado", response.Message);
        Assert.Empty(await context.Transactions.ToListAsync());
    }

    [Fact]
    public async Task UpdateTransaction_RejectsCategoryOwnedByAnotherUser()
    {
        await using var context = CreateContext();
        var firstUserCategory = await AddCategoryAsync(context, FirstUser);
        var secondUserCategory = await AddCategoryAsync(context, SecondUser);
        var transaction = await AddTransactionAsync(context, SecondUser, secondUserCategory.Id);
        var handler = new TransactionHandler(context, Clock);

        var response = await handler.UpdateAsync(new UpdateTransactionRequest
        {
            Id = transaction.Id,
            UserId = SecondUser,
            CategoryId = firstUserCategory.Id,
            Title = "Tentativa cruzada",
            Amount = 200,
            Type = ETransactionType.Deposit,
            PaidOrReceivedAt = TestDate
        });

        Assert.False(response.IsSuccess);
        Assert.Equal("Categoria não encontrada para o usuário autenticado", response.Message);

        await context.Entry(transaction).ReloadAsync();
        Assert.Equal(secondUserCategory.Id, transaction.CategoryId);
    }

    [Fact]
    public async Task DeleteCategory_WithTransactions_IsRejectedAndPreservesBothRecords()
    {
        await using var context = CreateContext();
        var category = await AddCategoryAsync(context, FirstUser);
        var transaction = await AddTransactionAsync(context, FirstUser, category.Id);
        var handler = new CategoryHandler(context);

        var response = await handler.DeleteAsync(new DeleteCategoryRequest
        {
            Id = category.Id,
            UserId = FirstUser
        });

        Assert.False(response.IsSuccess);
        Assert.Equal("Não é possível excluir uma categoria com transações vinculadas", response.Message);
        Assert.True(await context.Categories.AnyAsync(x => x.Id == category.Id));
        Assert.True(await context.Transactions.AnyAsync(x => x.Id == transaction.Id));
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

    private static async Task<Category> AddCategoryAsync(AppDbContext context, string userId)
    {
        var category = new Category
        {
            UserId = userId,
            Title = $"Categoria {userId}",
            Description = "Categoria de teste"
        };

        context.Categories.Add(category);
        await context.SaveChangesAsync();
        return category;
    }

    private static async Task<Transaction> AddTransactionAsync(
        AppDbContext context,
        string userId,
        long categoryId)
    {
        var transaction = new Transaction
        {
            UserId = userId,
            CategoryId = categoryId,
            Title = "Transação de teste",
            Amount = 50,
            Type = ETransactionType.Deposit,
            PaidOrReceivedAt = TestDate
        };

        context.Transactions.Add(transaction);
        await context.SaveChangesAsync();
        return transaction;
    }

    private sealed class FixedTimeProvider(DateTimeOffset utcNow) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => utcNow;
    }
}
