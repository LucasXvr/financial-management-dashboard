using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fin.Api
{
    public static class ApiConfiguration
    {
        public const string CorsPolicyName = "wasm";
        public static string StripeApiKey { get; set; } = string.Empty;
    }
}