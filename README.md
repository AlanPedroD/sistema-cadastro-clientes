# Sistema de Cadastro de Clientes

Projeto desenvolvido para praticar o desenvolvimento de uma aplicação web com operações de cadastro de clientes e armazenamento de dados em um banco PostgreSQL.

## Tecnologias utilizadas

- **HTML** — estrutura da página.
- **CSS** — estilização da interface.
- **JavaScript** — funcionalidades do front-end.
- **Node.js** — execução do JavaScript no back-end.
- **Express** — criação do servidor e das rotas.
- **PostgreSQL** — armazenamento dos dados.
- **pg** — conexão entre Node.js e PostgreSQL.
- **dotenv** — gerenciamento das variáveis de ambiente.

## Funcionalidades

- Cadastrar clientes.
- Listar clientes.
- Editar dados dos clientes.
- Excluir clientes.
- Validar informações antes de salvar.
- Armazenar os dados no PostgreSQL.

## Como executar o projeto

**1. Clone o repositório**

```bash
git clone URL_DO_REPOSITORIO
```

**2. Entre na pasta do projeto**

```bash
cd sistema-cadastro-clientes
```

**3. Instale as dependências**

```bash
npm install
```

**4. Configure o banco de dados**

Crie um banco PostgreSQL e configure as variáveis de ambiente em um arquivo `.env` na raiz do projeto:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gerenciamento_clientes
DB_USER=postgres
DB_PASSWORD=sua_senha
```

Substitua os valores pelos dados da sua instalação do PostgreSQL.

**5. Inicie o servidor**

```bash
node server.js
```

Depois, acesse no navegador:

http://localhost:3000

## Objetivo

Projeto pessoal desenvolvido para praticar conceitos de desenvolvimento web, operações CRUD, integração com banco de dados e criação de rotas com Express.