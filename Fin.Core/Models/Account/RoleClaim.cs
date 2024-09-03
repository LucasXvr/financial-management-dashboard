using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fin.Core.Models.Account
{
    public class RoleClaim
    {
        public string? Issuer { get; set; }
        public string? OriginalIssuer { get; set; }
        public string? Type { get; set; }
        public string? Value { get; set; }
        public string? ValueType { get; set; }
    }
}