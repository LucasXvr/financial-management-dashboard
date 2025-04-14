namespace Fin.Core.Responses.Account
{
    public class LoginResponse
    {
        public required string UserId { get; set; }
        public required string Email { get; set; }
        public required string Token { get; set; }
        public List<string> Roles { get; set; } = new();
        public DateTime Expiration { get; set; }
    }
}