# 💸 Financial Management Dashboard

Sistema de gerenciamento financeiro pessoal, focado em controle de receitas e despesas mensais, com autenticação de usuários e interface intuitiva. Este projeto foi desenvolvido como parte do meu portfólio, combinando backend em .NET com frontend moderno em React, com o objetivo de demonstrar habilidades full stack.

## 🚀 Funcionalidades Implementadas

### Autenticação e Usuários
- ✅ **Sistema de Autenticação** completo com JWT
- ✅ **Registro e Login** de usuários
- ✅ **Recuperação de senha**
- ✅ **Perfil do usuário** com informações personalizadas

### Gestão Financeira
- ✅ **Dashboard** com visão geral das finanças
- ✅ **Transações** (receitas e despesas)
  - Criação, edição e exclusão de transações
  - Categorização de transações
  - Filtros por período e categoria
- ✅ **Categorias** personalizadas
  - Gerenciamento de categorias de receitas e despesas
  - Cores personalizadas para melhor visualização

### Relatórios e Análises
- ✅ **Relatórios financeiros** mensais
- ✅ **Gráficos** interativos
  - Distribuição de gastos por categoria
  - Evolução de receitas e despesas
- ✅ **Exportação** de relatórios

## 📌 Tecnologias Utilizadas

### Backend (.NET Core)
- **ASP.NET Core Web API** 8.0
- **Entity Framework Core** para ORM
- **SQL Server** como banco de dados
- **JWT** para autenticação
- **Swagger/OpenAPI** para documentação
- **Docker** para containerização

### Frontend (React)
- **React** 18+ com Vite
- **TypeScript** para tipagem estática
- **TailwindCSS** para estilização
- **React Router** para navegação
- **Axios** para requisições HTTP
- **React Query** para gerenciamento de estado e cache
- **Chart.js** para gráficos
- **React Hook Form** para formulários
- **Zod** para validação

### Ferramentas de Desenvolvimento
- **Git** para controle de versão
- **Docker** para containerização
- **Postman** para testes de API
- **ESLint** e **Prettier** para padronização de código

## 🎯 Próximos Passos

- [ ] Implementar testes automatizados (unitários e integração)
- [ ] Adicionar CI/CD com GitHub Actions
- [ ] Implementar sistema de notificações
- [ ] Adicionar suporte a múltiplas moedas
- [ ] Implementar backup automático dos dados
- [ ] Adicionar modo offline com PWA
- [ ] Melhorar acessibilidade (WCAG)

## 🧠 Aprendizados

Durante o desenvolvimento deste projeto, aprofundei meus conhecimentos em:
- Arquitetura de software moderna com separação clara de responsabilidades
- Desenvolvimento de APIs RESTful com .NET Core
- Autenticação e autorização com JWT
- Desenvolvimento frontend moderno com React e TypeScript
- Gerenciamento de estado e cache no frontend
- Containerização com Docker
- Boas práticas de segurança em aplicações web
- Desenvolvimento de interfaces responsivas e acessíveis

## 📂 Como rodar o projeto

### Pré-requisitos
- .NET 8.0 SDK
- Node.js 18+
- Docker e Docker Compose
- SQL Server (ou usar o container Docker)

### Backend
```bash
cd Fin.Api
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend
```bash
cd Fin.Web.React
npm install
npm run dev
```

### Usando Docker
```bash
docker-compose up -d
```

## 📝 Documentação da API

A documentação completa da API está disponível através do Swagger quando o backend estiver rodando:
```
http://localhost:5000/swagger
```

## 👤 Autor

Desenvolvido por **Lucas Xavier**
[LinkedIn](https://www.linkedin.com/in/lucas-xavier-89a44120b/) | [GitHub](https://github.com/LucasXvr)