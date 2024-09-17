using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fin.Web
{
    public static class Configuration
    {
        public const string HttpClientName = "Api";
        public static string BackendUrl { get; set; } = "http://localhost:5110";
    }
}