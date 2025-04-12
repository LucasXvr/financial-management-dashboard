using Fin.Api.Models;
using Fin.Core.Responses;

namespace Fin.Api.Services
{
    public interface ITokenService
    {
        Task<AuthResponseDTO> GenerateTokenAsync(User user);
    }
}