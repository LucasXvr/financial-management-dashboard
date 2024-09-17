using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Fin.Core.Handlers;
using Fin.Core.Requests.Categories;
using Microsoft.AspNetCore.Components;
using MudBlazor;

namespace Fin.Web.Pages.Categories
{
    public partial class CreateCategoryPage : ComponentBase
    {
        #region Properties

        public bool IsBusy { get; set; } = false;
        public CreateCategoryRequest InputModel { get; set; } = new();

        #endregion

        #region Services

        [Inject]
        public ICategoryHandler Handler { get; set; } = null!;

        [Inject]
        public NavigationManager NavigationManager { get; set; } = null!;

        [Inject]
        public ISnackbar Snackbar { get; set; } = null!;

        #endregion

        #region Methods

        public async Task OnValidSubmitAsync()
        {
            IsBusy = true;

            try
            {
                var result = await Handler.CreateAsync(InputModel);
                if (result.IsSuccess)
                {
                    Snackbar.Add(result.Message, Severity.Success);
                    NavigationManager.NavigateTo("/categorias");
                }
                else
                    Snackbar.Add(result.Message, Severity.Error);
            }
            catch (Exception ex)
            {
                Snackbar.Add(ex.Message, Severity.Error);
            }
            finally
            {
                IsBusy = false;
            }
        }

        #endregion

    }
}