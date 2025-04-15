using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Fin.Api.Data;
using Fin.Api.Handlers;
using Fin.Api.Models;
using Fin.Api.Services;
using Fin.Core;
using Fin.Core.Common.Extensions;
using Fin.Core.Handlers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Fin.Api.Common.Api
{
    public static class BuilderExtension
    {
        public static void AddConfiguration(
            this WebApplicationBuilder builder)
        {
            Configuration.ConnectionString =
                builder
                    .Configuration
                    .GetConnectionString("DefaultConnection")
                ?? string.Empty;
            Configuration.BackendUrl = builder.Configuration.GetValue<string>("BackendUrl") ?? string.Empty;
            Configuration.FrontendUrl = builder.Configuration.GetValue<string>("FrontendUrl") ?? string.Empty;
            // ApiConfiguration.StripeApiKey = builder.Configuration.GetValue<string>("StripeApiKey") ?? string.Empty;

            // StripeConfiguration.ApiKey = ApiConfiguration.StripeApiKey;
        }

        public static void AddDocumentation(this WebApplicationBuilder builder)
        {
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(x => { x.CustomSchemaIds(n => n.FullName); });
        }

        public static void AddSecurity(this WebApplicationBuilder builder)
        {
            var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
            
            if (jwtSettings == null)
                throw new InvalidOperationException("JwtSettings não encontrado na configuração");
                
            if (string.IsNullOrEmpty(jwtSettings.SecretKey))
                throw new InvalidOperationException("JwtSettings.SecretKey não pode ser nulo ou vazio");
                
            if (string.IsNullOrEmpty(jwtSettings.Issuer))
                throw new InvalidOperationException("JwtSettings.Issuer não pode ser nulo ou vazio");
                
            if (string.IsNullOrEmpty(jwtSettings.Audience))
                throw new InvalidOperationException("JwtSettings.Audience não pode ser nulo ou vazio");

            builder.Services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = jwtSettings.Issuer,
                        ValidAudience = jwtSettings.Audience,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey))
                    };
                });

            builder.Services.AddAuthorization();
        }

        public static void AddDataContexts(this WebApplicationBuilder builder)
        {
            builder
                .Services
                .AddDbContext<AppDbContext>(
                    x => x.UseSqlServer(
                        Configuration.ConnectionString,
                        options => options.EnableRetryOnFailure(
                            maxRetryCount: 5,
                            maxRetryDelay: TimeSpan.FromSeconds(30),
                            errorNumbersToAdd: null
                        )
                    )
                );
        }

        public static void AddCrossOrigin(this WebApplicationBuilder builder)
        {
            builder.Services.AddCors(
                options => options.AddPolicy(
                    ApiConfiguration.CorsPolicyName,
                    policy => policy
                        .WithOrigins([
                            Configuration.BackendUrl,
                            Configuration.FrontendUrl
                        ])
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials()
                ));
        }

        public static void AddServices(this WebApplicationBuilder builder)
        {
            builder
                .Services
                .AddTransient<ICategoryHandler, CategoryHandler>();

            builder
                .Services
                .AddTransient<ITransactionHandler, TransactionHandler>();

            builder.Services.AddScoped(provider => 
                provider.GetRequiredService<IOptions<JwtSettings>>().Value);

            builder.Services.AddSingleton<ITokenService, TokenService>();

            builder.Services.AddIdentity<User, IdentityRole<long>>(options => 
            {
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequiredLength = 8;
                
                options.User.RequireUniqueEmail = true;
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();
        }
    }
}