using Fin.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fin.Api.Data.Mappings;

public class FinancialAccountMapping : IEntityTypeConfiguration<FinancialAccount>
{
    public void Configure(EntityTypeBuilder<FinancialAccount> builder)
    {
        builder.ToTable("FinancialAccount");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name)
            .HasColumnType("NVARCHAR")
            .HasMaxLength(80)
            .IsRequired();
        builder.Property(x => x.BalanceAdjustment)
            .HasPrecision(18, 2)
            .IsRequired();
        builder.Property(x => x.UserId)
            .HasColumnType("VARCHAR")
            .HasMaxLength(160)
            .IsRequired();
        builder.HasIndex(x => x.UserId).IsUnique();
    }
}
