using Fin.Api.Data;
using Xunit;

namespace Fin.Api.Tests.Data;

public class AdminSeedPolicyTests
{
    [Fact]
    public void Development_WithSeedDisabled_DoesNothing()
    {
        var action = AdminSeedPolicy.Resolve(isDevelopment: true, isEnabled: false);

        Assert.Equal(AdminSeedAction.Disabled, action);
    }

    [Fact]
    public void Development_WithSeedEnabled_CreatesMissingAccount()
    {
        var action = AdminSeedPolicy.Resolve(isDevelopment: true, isEnabled: true);

        Assert.Equal(AdminSeedAction.Create, action);
    }

    [Fact]
    public void Development_PreservesAnExistingAdministrator()
    {
        var action = AdminSeedPolicy.Resolve(
            isDevelopment: true,
            isEnabled: true,
            accountExists: true,
            existingAccountIsAdmin: true);

        Assert.Equal(AdminSeedAction.PreserveExisting, action);
    }

    [Fact]
    public void Development_DoesNotSilentlyPromoteAnExistingRegularUser()
    {
        var error = Assert.Throws<InvalidOperationException>(() => AdminSeedPolicy.Resolve(
            isDevelopment: true,
            isEnabled: true,
            accountExists: true,
            existingAccountIsAdmin: false));

        Assert.Contains("Nenhuma senha, permissão ou informação", error.Message);
    }

    [Fact]
    public void Production_WithSeedDisabled_DoesNothing()
    {
        var action = AdminSeedPolicy.Resolve(isDevelopment: false, isEnabled: false);

        Assert.Equal(AdminSeedAction.Disabled, action);
    }

    [Fact]
    public void Production_RejectsAutomaticProvisioningEvenWhenEnabled()
    {
        var error = Assert.Throws<InvalidOperationException>(() =>
            AdminSeedPolicy.Resolve(isDevelopment: false, isEnabled: true));

        Assert.Contains("só pode ser habilitado em Development", error.Message);
    }
}
