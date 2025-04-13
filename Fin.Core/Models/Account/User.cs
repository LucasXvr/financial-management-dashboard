using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fin.Core.Models.Account
{
    public class User
    {
        public Guid Id {get; set;} = Guid.NewGuid();
        public string Email { get; set; } = string.Empty;
        public bool IsEmailConfirmed { get; set; }
        public Dictionary<string, string> Claims { get; set; } = [];
    }
}