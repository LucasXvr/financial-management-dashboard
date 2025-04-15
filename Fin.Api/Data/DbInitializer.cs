using Fin.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Fin.Api.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<long>>>();

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

            // Criar usuário admin se não existir
            var adminEmail = "admin@fin.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                var admin = new User
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(admin, "Admin@123456");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, "Admin");
                }
            }
        }
    }
} 