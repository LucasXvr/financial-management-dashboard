# 💸 Financial Management

Sistema de gerenciamento financeiro pessoal, focado em controle de receitas e despesas mensais, com autenticação de usuários e interface intuitiva. Este projeto foi desenvolvido como parte do meu portfólio, combinando backend em .NET com frontend moderno, com o objetivo de demonstrar habilidades full stack.

## 🚀 Funcionalidades Implementadas

- ✅ **Landing Page responsiva** com informações do sistema
- ✅ **Tela de Registro e Login** com formulários validados
- ✅ **API RESTful** com autenticação de usuários usando JWT
- ✅ **Endpoints configurados:**
  - `POST /api/auth/register` - Registro de novos usuários
  - `POST /api/auth/login` - Login com geração de token JWT

## 📌 Tecnologias Utilizadas

### Backend
- **ASP.NET Core Web API**
- **Entity Framework Core**
- **Autenticação com JWT**
- **Banco de Dados: SQL Server**

### Frontend
- **React**
- **Axios** para requisições HTTP
- **React Router Dom** para rotas (se estiver usando)
- **TailwindCSS** (caso esteja estilizando com ele)

### Outros
- **Swagger** (se configurado)
- **Postman** (para testes dos endpoints)

## 🎯 Próximos Passos

- [ ] Testar e integrar os endpoints de autenticação com o front-end
- [ ] Criar dashboard protegida por autenticação
- [ ] Implementar fluxo completo de transações:
  - Adicionar, listar, editar e excluir transações
- [ ] Criar gráficos e relatórios mensais
- [ ] Exportar relatórios para Excel
- [ ] Deploy do sistema (frontend + backend)

## 🧠 Aprendizados

Durante o desenvolvimento deste projeto, aprofundei meus conhecimentos em:
- Criação e consumo de APIs REST com .NET
- Manipulação de autenticação com JWT
- Integração entre frontend e backend com controle de sessão
- Estruturação de layouts modernos e responsivos
- Boas práticas de organização de código e estrutura de projeto

## 📷 Demonstrações

*Em breve: prints da tela inicial, login, e dashboard*

## 📂 Como rodar o projeto

### Backend
```bash
cd Fin.Api
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend
```bash
cd financial-management-frontend
npm install
npm start
```

## 👤 Autor

Desenvolvido por **Lucas Xavier**  
[LinkedIn](https://www.linkedin.com/in/seu-perfil) | [GitHub](https://github.com/seu-usuario)