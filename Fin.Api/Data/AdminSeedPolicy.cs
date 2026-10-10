namespace Fin.Api.Data;

public enum AdminSeedAction
{
    Disabled,
    Create,
    PreserveExisting
}

public static class AdminSeedPolicy
{
    public static AdminSeedAction Resolve(
        bool isDevelopment,
        bool isEnabled,
        bool accountExists = false,
        bool existingAccountIsAdmin = false)
    {
        if (!isEnabled)
            return AdminSeedAction.Disabled;

        if (!isDevelopment)
            throw new InvalidOperationException(
                "O provisionamento automático de administrador só pode ser habilitado em Development.");

        if (!accountExists)
            return AdminSeedAction.Create;

        if (!existingAccountIsAdmin)
            throw new InvalidOperationException(
                "O email configurado para o administrador já pertence a uma conta sem o papel Admin. " +
                "Nenhuma senha, permissão ou informação da conta foi alterada.");

        return AdminSeedAction.PreserveExisting;
    }
}
