using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fin.Api.Data.Identity
{
    public class IdentityRoleClaimMapping : IEntityTypeConfiguration<IdentityRoleClaim<long>>
    {
        public void Configure(EntityTypeBuilder<IdentityRoleClaim<long>> builder)
        {
            builder.ToTable("IdentityRoleClaim");
            builder.HasKey(rc => rc.Id);
            builder.Property(u => u.ClaimType).HasMaxLength(255);
            builder.Property(u => u.ClaimValue).HasMaxLength(255);
        }
    }
}