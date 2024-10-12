using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MudBlazor;
using MudBlazor.Utilities;

namespace Fin.Web
{
    public static class Configuration
    {
        public const string HttpClientName = "Api";
        public static string BackendUrl { get; set; } = "http://localhost:5110";

        public static MudTheme Theme = new()
        {
            Typography = new Typography
            {
                Default = new Default
                {
                    FontFamily = ["Raleway", "sans-serif"]
                }
            },
            PaletteLight = new PaletteLight()
            {
                Primary = Colors.Blue.Default,
                Secondary = Colors.Red.Default,
                Background = "#f5f5f5",
                AppbarBackground = Colors.Blue.Darken3,
                DrawerBackground = "#ffffff",
                TextPrimary = "#333333",
                TextSecondary = "#666666"
            },
            PaletteDark = new PaletteDark()
            {
                Primary = Colors.LightBlue.Accent3,
                Secondary = Colors.DeepOrange.Accent2,
                Background = "#212121",
                AppbarBackground = "#424242",
                DrawerBackground = "#333333",
                TextPrimary = "#ffffff",
                TextSecondary = "#b0bec5"
            }
        };
    }
}