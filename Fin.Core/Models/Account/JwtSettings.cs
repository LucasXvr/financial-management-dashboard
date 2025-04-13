namespace Fin.Core.Models.Account
{
    public class JwtSettings
    {
        public required string SecretKey {get; set;}
        public required string Issuer {get; set;}
        public required string Audience{get; set;}
        public int ExpiryInMinutes {get; set;}  
    }
}