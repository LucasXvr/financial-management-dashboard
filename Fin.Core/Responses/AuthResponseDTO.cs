namespace Fin.Core.Responses
{
    public class AuthResponseDTO
    {
        public string Token {get; set;} = string.Empty;
        public DateTime Expiration {get; set;}
        public string Email { get; set; } = string.Empty;
        public IEnumerable<string>? Roles { get; set; }
        public Dictionary<string, string>? Claims { get; set; }        
    }
}