# Financial Management Dashboard

Aplicação de gerenciamento financeiro pessoal criada como projeto de portfólio full stack com **ASP.NET Core 8**, **Angular**, **React** e **SQL Server**.

O frontend original foi construído em React e está sendo migrado gradualmente para Angular. A aplicação Angular já oferece autenticação e gerenciamento de categorias integrados à API.

## Estado atual

### API .NET 8

- Cadastro, login com JWT e recuperação de senha por email.
- Autorização e isolamento de dados por usuário.
- CRUD de categorias e transações.
- Paginação e relatórios financeiros.
- Swagger/OpenAPI em desenvolvimento.
- Migrations com Entity Framework Core.
- Testes de integração com xUnit.

### Frontend Angular

- Página inicial, cadastro e login.
- Solicitação e redefinição de senha por link temporário.
- Persistência da sessão, guards e interceptor JWT.
- Layout autenticado e logout.
- Listagem paginada, cadastro, edição e exclusão de categorias.
- Estados de carregamento, lista vazia, validação e erro.
- Atualização da interface em modo sem Zone.js.
- Mensagem de erro ao tentar excluir uma categoria vinculada a transações.

### Migração pendente

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
- SQL Server e Mailpit em contêineres

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
EmailSettings__Host
EmailSettings__Port
EmailSettings__FromAddress
EmailSettings__FromName
EmailSettings__Username
EmailSettings__Password
EmailSettings__EnableSsl
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
- Caixa de email local (Mailpit): `http://localhost:8025`

As migrations são aplicadas durante a inicialização da API. O healthcheck impede que ela inicie antes de o SQL Server aceitar conexões. Em desenvolvimento, os emails de recuperação ficam disponíveis no Mailpit e não são enviados para endereços externos.

### Envio de email externo

O mesmo fluxo pode enviar o link para uma caixa real. Copie `.env.example` para `.env` e substitua a configuração local por dados fornecidos pelo serviço SMTP. Exemplo fictício:

```text
SMTP_HOST=smtp.example-provider.com
SMTP_PORT=587
SMTP_FROM_ADDRESS=no-reply@minhasfinancas.example
SMTP_FROM_NAME=Minhas Finanças
SMTP_USERNAME=portfolio-user@example.com
SMTP_PASSWORD=replace-with-provider-api-key-or-app-password
SMTP_ENABLE_SSL=true
```

Esses valores são apenas um modelo e não representam credenciais válidas. O arquivo `.env` está ignorado pelo Git e deve guardar os valores reais somente no ambiente local. Em produção, configure os mesmos nomes no gerenciador de segredos da hospedagem.

Quando o usuário solicita a recuperação, a API procura a conta, gera um token de uso único com validade de 30 minutos e cria um link para `FrontendUrl/reset-password`. O serviço SMTP entrega esse link. Ao definir a nova senha, o ASP.NET Identity valida o token e o invalida após o uso. A resposta da solicitação é sempre genérica para não revelar se um email está cadastrado.

Configurações comuns:

- Porta `587` com `SMTP_ENABLE_SSL=true`: conexão SMTP com STARTTLS, usada pela maioria dos provedores.
- `SMTP_USERNAME`: usuário SMTP ou identificador fornecido pelo provedor.
- `SMTP_PASSWORD`: senha de aplicativo ou chave SMTP. Nunca use uma senha pessoal nem faça commit desse valor.
- `SMTP_FROM_ADDRESS`: remetente previamente autorizado ou verificado no provedor.
- `FrontendUrl`: endereço público do Angular. O link enviado será baseado nesse valor.

Depois de alterar o `.env`, recrie a API:

```bash
docker compose up -d --build api
```

Se as variáveis `SMTP_*` permanecerem com os valores locais, a API continuará usando o Mailpit. Ele ainda pode ficar ativo no Docker quando um provedor externo estiver configurado, mas não receberá as mensagens.

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
POST /v1/identity/forgot-password
POST /v1/identity/reset-password
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
