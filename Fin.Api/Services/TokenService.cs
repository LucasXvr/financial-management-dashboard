using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Fin.Api.Models;
using Fin.Core.Responses;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Fin.Api.Services
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration;

        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<AuthResponseDTO> GenerateTokenAsync(User user)
        {
            // Aqui futuramente você pode usar await com UserManager
            await Task.CompletedTask;

            var claims = new List<Claim>
            {
                new(ClaimTypes.Name, user.UserName ?? ""),
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Email, user.Email ?? "")
            };

            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new Exception("JWT Key not configured."));
            var cred = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);
            var expiration = DateTime.UtcNow.AddHours(2);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: expiration,
                signingCredentials: cred
            );

            return new AuthResponseDTO
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                Expiration = expiration,
                Email = user.Email ?? "",
                Claims = claims.ToDictionary(c => c.Type, c => c.Value)
            };
        }
    }
}