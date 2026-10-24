const express = require("express");

require("dotenv").config();

const { Pool } = require("pg");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// Teste
pool.query("SELECT NOW()")
  .then(() => {
    console.log("Conexão com o PostgreSQL estabelecida!");
  })
  .catch((erro) => {
    console.error("Erro ao conectar ao PostgreSQL:", erro.message);
  });


// Consultar clientes
app.get("/clientes", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT id, nome, email, idade FROM clientes ORDER BY id"
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error("Erro ao consultar clientes:", erro.message);

    res.status(500).json({
      erro: "Erro ao consultar clientes."
    });
  }
});


// Adicionar cliente
app.post("/clientes", async (req, res) => {
  const { nome, email, idade } = req.body;

  // Validar o nome
  if (typeof nome !== "string" || nome.trim() === "") {
    return res.status(400).json({
      erro: "O nome é obrigatório."
    });
  }

  // Validar o email
  if (typeof email !== "string" || email.trim() === "") {
    return res.status(400).json({
      erro: "O email é obrigatório."
    });
  }
  // Verificar o formato do email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({
      erro: "Informe um email válido."
    });
  }

  // Validar a idade
  if (
    typeof idade !== "number" ||
    idade <= 0 ||
    !Number.isInteger(idade)
  ) {
    return res.status(400).json({
      erro: "A idade deve ser um número inteiro positivo."
    });
  }

  // Verificar se o nome já está cadastrado
  try {
    const clienteExistente = await pool.query(
      "SELECT id FROM clientes WHERE LOWER(nome) = LOWER($1)",
      [nome.trim()]
    );

    if (clienteExistente.rows.length > 0) {
      return res.status(409).json({
        erro: "Já existe um cliente com esse nome."
      });
    }

    // Cadastrar cliente no PostgreSQL
    const resultado = await pool.query(
      "INSERT INTO clientes (nome, email, idade) VALUES ($1, $2, $3) RETURNING id, nome, email, idade",
      [nome.trim(), email.trim(), idade]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    console.error("Erro ao cadastrar cliente:", erro.message);

    res.status(500).json({
      erro: "Erro ao cadastrar cliente."
    });
  }
});



// Deletar cliente
app.delete("/clientes/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "O ID deve ser um número inteiro positivo."
    });
  }

  try {
    // Excluir cliente do PostgreSQL
    const resultado = await pool.query(
      "DELETE FROM clientes WHERE id = $1 RETURNING id",
      [id]
    );

    // Verificar se o cliente foi encontrado
    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Cliente não encontrado."
      });
    }

    res.status(200).json({
      mensagem: "Cliente deletado com sucesso."
    });
  } catch (erro) {
    console.error("Erro ao deletar cliente:", erro.message);

    res.status(500).json({
      erro: "Erro ao deletar cliente."
    });
  }
});



// Atualizar cliente
app.put("/clientes/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "O ID deve ser um número inteiro positivo."
    });
  }

  const { nome, email, idade } = req.body;

  // Validar os dados
  if (
    typeof nome !== "string" || nome.trim() === "" ||
    typeof email !== "string" || email.trim() === "" ||
    typeof idade !== "number" || idade <= 0 ||
    !Number.isInteger(idade)
  ) {
    return res.status(400).json({
      erro: "Informe nome, email e idade válidos."
    });
  }

  // Verificar o formato do email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({
      erro: "Informe um email válido."
    });
  }

  try {
    // Verificar se o cliente existe
    const clienteAtual = await pool.query(
      "SELECT id FROM clientes WHERE id = $1",
      [id]
    );

    if (clienteAtual.rows.length === 0) {
      return res.status(404).json({
        erro: "Cliente não encontrado."
      });
    }

    // Verificar se outro cliente já possui esse nome
    const clienteExistente = await pool.query(
      `SELECT id FROM clientes
       WHERE LOWER(nome) = LOWER($1)
       AND id != $2`,
      [nome.trim(), id]
    );

    if (clienteExistente.rows.length > 0) {
      return res.status(409).json({
        erro: "Já existe outro cliente com esse nome."
      });
    }

    // Atualizar os dados no PostgreSQL
    const resultado = await pool.query(
      `UPDATE clientes
       SET nome = $1, email = $2, idade = $3
       WHERE id = $4
       RETURNING id, nome, email, idade`,
      [nome.trim(), email.trim(), idade, id]
    );

    res.json(resultado.rows[0]);

  } catch (erro) {
    console.error("Erro ao atualizar cliente:", erro.message);

    res.status(500).json({
      erro: "Erro ao atualizar cliente."
    });
  }
});


// Atualizar parcialmente um cliente
app.patch("/clientes/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "O ID deve ser um número inteiro positivo."
    });
  }

  const { nome, email, idade } = req.body;

  // Verificar se algum campo foi enviado
  if (
    nome === undefined &&
    email === undefined &&
    idade === undefined
  ) {
    return res.status(400).json({
      erro: "Informe pelo menos um campo para atualizar."
    });
  }

  // Validar o nome, se informado
  if (nome !== undefined &&
    (typeof nome !== "string" || nome.trim() === "")) {
    return res.status(400).json({
      erro: "O nome é inválido."
    });
  }

  // Validar o email, se informado
  if (email !== undefined &&
    (typeof email !== "string" || email.trim() === "")) {
    return res.status(400).json({
      erro: "O email é inválido."
    });
  }

  // Validar a idade, se informada
  if (idade !== undefined &&
    (typeof idade !== "number" || idade <= 0 || !Number.isInteger(idade))) {
    return res.status(400).json({
      erro: "A idade é inválida."
    });
  }

  // Verificar o formato do email, se informado
  if (
    email !== undefined &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return res.status(400).json({
      erro: "Informe um email válido."
    });
  }


  try {
    // Verificar se o nome enviado já pertence a outro cliente
    if (nome !== undefined) {
      const clienteExistente = await pool.query(
        `SELECT id FROM clientes
       WHERE LOWER(nome) = LOWER($1)
       AND id != $2`,
        [nome.trim(), id]
      );

      if (clienteExistente.rows.length > 0) {
        return res.status(409).json({
          erro: "Já existe outro cliente com esse nome."
        });
      }
    }

    // Atualizar somente os campos enviados
    const resultado = await pool.query(
      `UPDATE clientes
     SET
       nome = COALESCE($1, nome),
       email = COALESCE($2, email),
       idade = COALESCE($3, idade)
     WHERE id = $4
     RETURNING id, nome, email, idade`,
      [
        nome === undefined ? null : nome.trim(),
        email === undefined ? null : email.trim(),
        idade === undefined ? null : idade,
        id
      ]
    );

    // Verificar se o cliente existe
    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Cliente não encontrado."
      });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error("Erro ao atualizar cliente:", erro.message);

    res.status(500).json({
      erro: "Erro ao atualizar cliente."
    });
  }
});


app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});


// 1. const express = require("express");

// - require("express"): importa o Express, um framework que facilita a criação de servidores e o gerenciamento de rotas.

// 2. const app = express();
// - express(): cria a aplicação Express.
// - app: variável utilizada para configurar a aplicação, registrar rotas, adicionar middlewares e iniciar o servidor.
// 3. app.get("/", (req, res) => { ... });
// - app.get(): registra uma rota que atende a requisições HTTP do tipo GET.
// - "/": representa o caminho principal da aplicação, por exemplo, http://localhost:3000/.
// - (req, res) => { ... }: função executada quando uma requisição corresponde à rota.
// - req: contém informações sobre a requisição recebida.
// - res: permite enviar uma resposta ao cliente.
// 4. res.send("Minha primeira aplicação com Express!");

// - res.send(): envia uma resposta ao cliente. Nesse caso, o navegador exibirá o texto informado.

// 5. app.listen(3000, () => { ... });
// - app.listen(): inicia o servidor para receber requisições.
// - 3000: porta em que o servidor ficará escutando.
// - () => { ... }: função executada quando o servidor começa a escutar.
// - console.log(): exibe uma mensagem no terminal.


// 1. Criando uma nova rota
// Observe este exemplo:

// app.get("/tarefas", (req, res) => {
//   res.send("Lista de tarefas");
// });

//? app.get() → registra uma rota GET.
//? "/tarefas" → define o caminho da rota.
//? req → representa a requisição recebida.
//? res → permite enviar uma resposta ao cliente.
//? res.send() → envia a resposta.

//? Agora, nosso servidor pode responder a dois endereços:
//? Endereço	Resposta
//? http://localhost:3000/	Minha primeira aplicação com Express!
//? http://localhost:3000/tarefas	Lista de tarefas


// Status	Significado
// 200	  Sucesso
// 201	  Recurso criado
// 400	  Requisição inválida
// 401	  Autenticação necessária ou inválida
// 404	  Recurso não encontrado
// 500	  Erro interno do servidor