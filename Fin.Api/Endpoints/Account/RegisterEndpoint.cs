using Fin.Api.Common.Api;
using Fin.Api.Data;
using Fin.Api.Models;
using Fin.Core.Requests.Account;
using Fin.Core.Responses;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fin.Api.Endpoints.Identity
{
    public class RegisterEndpoint : IEndpoint
    {
        public static void Map(IEndpointRouteBuilder app)
         => app.MapPost("/register", HandleAsync)
            .WithName("Identity: Register")
            .WithSummary("Registrar novo usuário")
            .WithDescription("Registra um novo usuário no sistema")
            .WithOrder(2)
            .AllowAnonymous()
            .Produces<Response<string>>();

        private static async Task<IResult> HandleAsync(
            [FromServices] UserManager<User> userManager,
            [FromServices] RoleManager<IdentityRole<long>> roleManager,
            [FromServices] IServiceProvider serviceProvider,
            [FromBody] RegisterRequest request)
        {
            var user = new User
            {                
                Email = request.Email,
                UserName = request.Email,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(user, request.Password);

            if (result.Succeeded)
            {
                // Tentar adicionar o usuário à role, mas não falhar se não conseguir
                try
                {
                    // Verificar se a role existe
                    var roleExists = await roleManager.RoleExistsAsync("User");
                    if (!roleExists)
                    {
                        // Criar a role se não existir
                        var roleResult = await roleManager.CreateAsync(new IdentityRole<long>("User"));
                        if (!roleResult.Succeeded)
                        {
                            Console.WriteLine($"Erro ao criar role 'User': {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
                            
                            // Tentar criar a role novamente
                            roleResult = await roleManager.CreateAsync(new IdentityRole<long>("User"));
                            if (!roleResult.Succeeded)
                            {
                                Console.WriteLine($"Erro ao criar role 'User' na segunda tentativa: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
                                
                                // Tentar criar a role diretamente no banco de dados
                                try
                                {
                                    using var scope = serviceProvider.CreateScope();
                                    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                                    var identityRole = new IdentityRole<long>("User");
                                    context.Roles.Add(identityRole);
                                    await context.SaveChangesAsync();
                                    Console.WriteLine("Role 'User' criada diretamente no banco de dados.");
                                    roleExists = true;
                                }
                                catch (Exception dbEx)
                                {
                                    Console.WriteLine($"Erro ao criar role 'User' diretamente no banco de dados: {dbEx.Message}");
                                }
                            }
                            else
                            {
                                Console.WriteLine("Role 'User' criada com sucesso na segunda tentativa.");
                                roleExists = true;
                            }
                        }
                        else
                        {
                            Console.WriteLine("Role 'User' criada com sucesso.");
                            roleExists = true;
                        }
                    }
                    else
                    {
                        Console.WriteLine("Role 'User' já existe.");
                    }

                    // Adicionar o usuário à role apenas se a role existir
                    if (roleExists)
                    {
                        var addToRoleResult = await userManager.AddToRoleAsync(user, "User");
                        if (!addToRoleResult.Succeeded)
                        {
                            Console.WriteLine($"Erro ao adicionar usuário à role 'User': {string.Join(", ", addToRoleResult.Errors.Select(e => e.Description))}");
                            
                            // Tentar adicionar o usuário à role diretamente no banco de dados
                            try
                            {
                                using var scope = serviceProvider.CreateScope();
                                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                                var role = await context.Roles.FirstOrDefaultAsync(r => r.Name == "User");
                                if (role != null)
                                {
                                    var userRole = new IdentityUserRole<long>
                                    {
                                        UserId = user.Id,
                                        RoleId = role.Id
                                    };
                                    context.UserRoles.Add(userRole);
                                    await context.SaveChangesAsync();
                                    Console.WriteLine("Usuário adicionado à role 'User' diretamente no banco de dados.");
                                }
                                else
                                {
                                    Console.WriteLine("Role 'User' não encontrada no banco de dados.");
                                }
                            }
                            catch (Exception dbEx)
                            {
                                Console.WriteLine($"Erro ao adicionar usuário à role 'User' diretamente no banco de dados: {dbEx.Message}");
                            }
                        }
                        else
                        {
                            Console.WriteLine("Usuário adicionado à role 'User' com sucesso.");
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erro ao adicionar usuário à role: {ex.Message}");
                    // Continuar mesmo se houver erro ao adicionar à role
                }

                // Verificar se o user não é nulo antes de acessar suas propriedades
                if (user == null)
                    return TypedResults.BadRequest(
                        new Response<string>("Erro ao registrar usuário: usuário não encontrado após criação", 400));

                return TypedResults.Created($"/users/{user.Id}",
                    new Response<string>("Usuário registrado com sucesso", 201));
            }

            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return TypedResults.BadRequest(
                new Response<string>($"Erro ao registrar usuário: {errors}", 400));
        }
    }
}