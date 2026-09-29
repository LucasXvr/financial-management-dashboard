# Financial Management Dashboard

Aplicação de gerenciamento financeiro pessoal criada como projeto de portfólio full stack com **ASP.NET Core 8**, **Angular**, **React** e **SQL Server**.

O frontend original foi construído em React e está sendo migrado gradualmente para Angular. A aplicação Angular já oferece autenticação e gerenciamento de categorias integrados à API.

## Estado atual

### API .NET 8

- Cadastro e login com JWT.
- Autorização e isolamento de dados por usuário.
- CRUD de categorias e transações.
- Paginação e relatórios financeiros.
- Swagger/OpenAPI em desenvolvimento.
- Migrations com Entity Framework Core.
- Testes de integração com xUnit.

### Frontend Angular

- Página inicial, cadastro e login.
- Persistência da sessão, guards e interceptor JWT.
- Layout autenticado e logout.
- Listagem paginada, cadastro, edição e exclusão de categorias.
- Estados de carregamento, lista vazia, validação e erro.
- Atualização da interface em modo sem Zone.js.
- Mensagem de erro ao tentar excluir uma categoria vinculada a transações.

### Migração pendente

- Gerenciamento de transações no Angular.
- Dashboard com dados reais.
- Gráficos e relatórios financeiros.
- Demais recursos ainda presentes apenas no frontend React.

## Regras de segurança e integridade

- As rotas financeiras exigem autenticação.
- Categorias e transações são filtradas pelo usuário autenticado.
- Uma transação só aceita uma categoria pertencente ao mesmo usuário.
- Categorias com transações vinculadas não podem ser excluídas.
- A chave estrangeira usa `Restrict`, preservando os lançamentos existentes.

## Tecnologias

### Backend

- .NET 8 e ASP.NET Core Minimal APIs
- Entity Framework Core 8
- ASP.NET Core Identity
- JWT Bearer Authentication
- SQL Server 2022
- Swagger/OpenAPI
- xUnit

### Frontend Angular

- Angular 21 e TypeScript
- Angular Router e Reactive Forms
- HttpClient e interceptors funcionais
- Vitest

### Frontend React

- React, TypeScript e Vite
- Tailwind CSS
- React Router, Axios e React Query
- Chart.js

### Infraestrutura

- Docker e Docker Compose
- SQL Server em contêiner

## Estrutura

```text
FinancialManagementDashboard/
├── Fin.Api/             # API, handlers, endpoints e migrations
├── Fin.Api.Tests/       # Testes de integração da API
├── Fin.Core/            # Modelos, contratos, enums e interfaces
├── Fin.Web.Angular/     # Frontend em migração ativa
├── Fin.Web.React/       # Frontend React original
├── docker-compose.yml
└── FinancialManagementDashboard.sln
```

## Pré-requisitos

- Docker Desktop com Docker Compose.
- Node.js 20.19 ou superior e npm para o Angular.
- SDK .NET 8 apenas para executar a API ou os testes fora do Docker.

## Configuração segura

Não publique senhas, connection strings ou segredos JWT reais. Use variáveis de ambiente ou arquivos locais ignorados pelo Git.

Configurações principais da API:

```text
ConnectionStrings__DefaultConnection
JwtSettings__SecretKey
FrontendUrl
BackendUrl
```

## API e banco com Docker

Na raiz do repositório:

```bash
cp .env.example .env
# Edite .env e defina senhas locais fortes antes de iniciar os contêineres.
docker compose up -d --build
docker compose ps
```

O arquivo `.env` é local e ignorado pelo Git. O Compose interrompe a inicialização
se `SQL_SERVER_PASSWORD` ou `JWT_SECRET` não estiverem definidos.

Serviços padrão:

- API: `http://localhost:5110`
- Swagger: `http://localhost:5110/swagger`
- SQL Server: `localhost:1200`

As migrations são aplicadas durante a inicialização da API. O healthcheck impede que ela inicie antes de o SQL Server aceitar conexões.

Para encerrar os serviços:

```bash
docker compose down
```

O volume do SQL Server é preservado. O comando `docker compose down -v` também remove os dados locais.

## Frontend Angular

Com a API disponível em `http://localhost:5110`:

```bash
cd Fin.Web.Angular
npm install
npm start
```

A aplicação ficará disponível em `http://localhost:4200`.

O servidor de desenvolvimento usa [proxy.conf.json](Fin.Web.Angular/proxy.conf.json) para encaminhar as chamadas da API.

## API sem Docker

Com o SDK .NET 8 e uma instância do SQL Server disponível:

```bash
dotnet restore
dotnet ef database update --project Fin.Api --startup-project Fin.Api
dotnet run --project Fin.Api
```

Configure os valores locais por variáveis de ambiente ou em `Fin.Api/appsettings.Development.json`. Esse arquivo é ignorado pelo Git.

## Testes

### API

```bash
dotnet test FinancialManagementDashboard.sln
```

Alternativa com SDK .NET 8 em Docker:

```bash
docker run --rm -v "${PWD}:/src" -w /src mcr.microsoft.com/dotnet/sdk:8.0 \
  dotnet test FinancialManagementDashboard.sln --configuration Release
```

Os testes atuais verificam o isolamento de categorias entre dois usuários e a preservação dos lançamentos quando uma exclusão inválida é solicitada.

### Angular

```bash
cd Fin.Web.Angular
npm test -- --watch=false
npm run build
```

## Endpoints principais

### Identidade

```text
POST /v1/identity/register
POST /v1/identity/login
```

### Categorias

```text
GET    /v1/categories
GET    /v1/categories/{id}
POST   /v1/categories
PUT    /v1/categories/{id}
DELETE /v1/categories/{id}
```

### Transações

```text
GET    /v1/transactions
GET    /v1/transactions/{id}
POST   /v1/transactions
PUT    /v1/transactions/{id}
DELETE /v1/transactions/{id}
```

Consulte o Swagger para os contratos completos e os endpoints de relatórios.

## Próximos passos

- Implementar o gerenciamento de transações no Angular.
- Migrar dashboard, gráficos e relatórios.
- Adicionar testes HTTP e testes de jornada do usuário.
- Criar pipeline de CI para build e testes.
- Substituir as credenciais de desenvolvimento versionadas por exemplos seguros.

## Autor

Desenvolvido por **Lucas Xavier**.

- [LinkedIn](https://www.linkedin.com/in/lucas-xavier-89a44120b/)
- [GitHub](https://github.com/LucasXvr)
