using Fin.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Fin.Api.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(
            IServiceProvider serviceProvider,
            IConfiguration configuration)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<long>>>();
            var environment = scope.ServiceProvider.GetRequiredService<IHostEnvironment>();
            var logger = scope.ServiceProvider
                .GetRequiredService<ILoggerFactory>()
                .CreateLogger("AdminProvisioning");

            // Garantir que o banco de dados está criado
            await context.Database.MigrateAsync();

            // Criar roles se não existirem
            string[] roles = { "Admin", "User" };
            foreach (var role in roles)
            {
                try
                {
                    // Verificar se a role já existe
                    var roleExists = await roleManager.RoleExistsAsync(role);
                    if (!roleExists)
                    {
                        // Criar a role
                        var result = await roleManager.CreateAsync(new IdentityRole<long>(role));
                        if (result.Succeeded)
                        {
                            Console.WriteLine($"Role '{role}' criada com sucesso.");
                        }
                        else
                        {
                            Console.WriteLine($"Erro ao criar role '{role}': {string.Join(", ", result.Errors.Select(e => e.Description))}");
                            
                            // Tentar criar a role novamente
                            result = await roleManager.CreateAsync(new IdentityRole<long>(role));
                            if (result.Succeeded)
                            {
                                Console.WriteLine($"Role '{role}' criada com sucesso na segunda tentativa.");
                            }
                            else
                            {
                                Console.WriteLine($"Erro ao criar role '{role}' na segunda tentativa: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                                
                                // Tentar criar a role diretamente no banco de dados
                                try
                                {
                                    var identityRole = new IdentityRole<long>(role);
                                    context.Roles.Add(identityRole);
                                    await context.SaveChangesAsync();
                                    Console.WriteLine($"Role '{role}' criada diretamente no banco de dados.");
                                }
                                catch (Exception dbEx)
                                {
                                    Console.WriteLine($"Erro ao criar role '{role}' diretamente no banco de dados: {dbEx.Message}");
                                }
                            }
                        }
                    }
                    else
                    {
                        Console.WriteLine($"Role '{role}' já existe.");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erro ao verificar/criar role '{role}': {ex.Message}");
                }
            }

            var seedEnabled = configuration.GetValue<bool>("SeedAdmin:Enabled");
            var initialAction = AdminSeedPolicy.Resolve(
                environment.IsDevelopment(),
                seedEnabled);

            if (initialAction == AdminSeedAction.Disabled)
            {
                if (environment.IsProduction())
                {
                    var existingAdmins = await userManager.GetUsersInRoleAsync("Admin");
                    if (existingAdmins.Count > 0)
                    {
                        logger.LogWarning(
                            "{AdminCount} conta(s) administrativa(s) existente(s) foram preservadas. " +
                            "Revise suas credenciais por um processo manual e auditável.",
                            existingAdmins.Count);
                    }
                }

                return;
            }

            var adminEmail = configuration["SeedAdmin:Email"];
            var adminPassword = configuration["SeedAdmin:Password"];
            if (string.IsNullOrWhiteSpace(adminEmail) || string.IsNullOrWhiteSpace(adminPassword))
                throw new InvalidOperationException(
                    "SeedAdmin está habilitado, mas Email ou Password não foi configurado.");

            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            var existingAccountIsAdmin = adminUser is not null &&
                                         await userManager.IsInRoleAsync(adminUser, "Admin");
            var action = AdminSeedPolicy.Resolve(
                environment.IsDevelopment(),
                seedEnabled,
                adminUser is not null,
                existingAccountIsAdmin);

            if (action == AdminSeedAction.PreserveExisting)
            {
                logger.LogInformation(
                    "A conta administrativa configurada já existe. A senha e os dados existentes foram preservados.");
                return;
            }

            if (action == AdminSeedAction.Create)
            {
                var admin = new User
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(admin, adminPassword);
                if (result.Succeeded)
                {
                    var roleResult = await userManager.AddToRoleAsync(admin, "Admin");
                    if (!roleResult.Succeeded)
                    {
                        throw new InvalidOperationException(
                            "A conta administrativa foi criada, mas não recebeu o papel Admin. " +
                            "A conta foi preservada para análise manual: " +
                            string.Join(", ", roleResult.Errors.Select(error => error.Description)));
                    }
                }
                else
                {
                    throw new InvalidOperationException(
                        $"Não foi possível criar o administrador inicial: {string.Join(", ", result.Errors.Select(error => error.Description))}");
                }
            }
        }
    }
}
