using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace Fin.Api.Models
{
    public class User : IdentityUser<long>
    {
        public List<IdentityRole<long>>? Roles { get; set; }
    }
}