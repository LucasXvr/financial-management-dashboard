# Ambientes e publicação

O projeto possui dois ambientes explícitos: desenvolvimento local e produção. A branch `main` deve conter somente código validado por pull request. Branches de trabalho são usadas para desenvolvimento e testes.

## Desenvolvimento local

O ambiente local usa:

- Angular com source maps e proxy para a API;
- API em `Development`, com Swagger;
- SQL Server Express em contêiner;
- Mailpit para capturar emails;
- segredos no arquivo `.env`, ignorado pelo Git.

Na raiz do projeto:

```bash
cp .env.example .env
docker compose up -d --build
```

Em outro terminal:

```bash
cd Fin.Web.Angular
npm ci
npm start
```

Endereços locais:

- Angular: `http://localhost:4200`
- API: `http://localhost:5110`
- Healthcheck: `http://localhost:5110/health`
- Swagger: `http://localhost:5110/swagger`
- Mailpit: `http://localhost:8025`

Para criar um administrador local de forma explícita, configure `SEED_ADMIN_ENABLED`, `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` no `.env`. O valor padrão é desabilitado e produção nunca deve usar credenciais fixas.

## Produção

O frontend usa `environment.production.ts`. Antes da primeira publicação, substitua `api.minhasfinancas.example` pelo domínio real da API nesse arquivo e em `public/staticwebapp.config.json`.

O build de produção é criado com:

```bash
cd Fin.Web.Angular
npm ci
npm run build:production
```

Para validar a composição da API sem expor segredos reais:

```bash
cp .env.production.example .env.production
docker compose --env-file .env.production -f docker-compose.production.yml config
```

O arquivo `.env.production` é ignorado pelo Git. Em Azure, prefira configurar esses valores como secrets do Container App ou referências ao Key Vault, em vez de enviar o arquivo ao servidor.

O compose de produção não cria SQL Server nem Mailpit. Ele espera:

- imagem da API publicada em um registry;
- Azure SQL ou outro SQL Server externo;
- provedor SMTP externo;
- URLs públicas do frontend e da API;
- chave JWT exclusiva de produção;
- host permitido explicitamente.

Execute a API de produção atrás do HTTPS fornecido pela plataforma ou por um proxy reverso. O container recebe os cabeçalhos encaminhados pelo proxy e não deve ser publicado diretamente na internet pela porta HTTP.

## Fluxo de entrega

1. Crie uma branch para o trabalho.
2. Execute testes e builds localmente.
3. Envie a branch ao GitHub.
4. Abra um pull request para `main`.
5. Aguarde o workflow **Build and test**.
6. Revise o diff e faça o merge.
7. Publique a revisão aprovada no ambiente de produção.

Não desenvolva diretamente na `main`. Se o repositório usar `master` como branch de produção, ajuste o nome no workflow e mantenha o mesmo processo.

## Segredos de produção

Nunca reutilize valores de desenvolvimento. Produção deve ter valores próprios para:

- connection string;
- chave JWT;
- usuário e chave SMTP;
- domínio e CORS;
- identidade do container e acesso ao banco.

Mantenha `SeedAdmin__Enabled=false`. Crie contas administrativas por um processo separado e auditável.

## Checklist antes do merge

- `dotnet build FinancialManagementDashboard.sln --configuration Release`
- `dotnet test FinancialManagementDashboard.sln --configuration Release`
- `npm test -- --watch=false`
- `npm run build:production`
- nenhuma credencial no diff
- URLs de produção revisadas
- migrations revisadas
- CORS limitado ao frontend publicado
- Swagger indisponível em produção
- logs sem tokens, senhas ou dados financeiros
