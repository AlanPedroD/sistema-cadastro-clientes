const formulario = document.getElementById("form-cliente");
const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const campoIdade = document.getElementById("idade");
const listaClientes = document.getElementById("lista-clientes");
const tituloFormulario = document.getElementById("titulo-formulario");
const botaoSalvar = document.getElementById("botao-salvar");
const botaoCancelar = document.getElementById("botao-cancelar");
const mensagem = document.getElementById("mensagem");
const botaoToggleClientes = document.getElementById("botao-toggle-clientes");
let dadosOriginais = null;

let idEmEdicao = null;

// Consultar e exibir os usuários
async function carregarClientes() {
  try {
    const resposta = await fetch("/clientes");
    const clientes = await resposta.json();

    if (!resposta.ok) {
      throw new Error(clientes.erro || "Erro ao consultar clientes.");
    }

    listaClientes.innerHTML = "";

    if (clientes.length === 0) {
      listaClientes.textContent = "Nenhum cliente cadastrado.";
      return;
    }

    clientes.forEach(cliente => {
      const item = document.createElement("li");
      item.classList.add("cliente");

      const nome = document.createElement("p");
      nome.textContent = `Nome: ${cliente.nome}`;

      const email = document.createElement("p");
      email.textContent = `E-mail: ${cliente.email}`;

      const idade = document.createElement("p");
      idade.textContent = `Idade: ${cliente.idade}`;

      const acoes = document.createElement("div");
      acoes.classList.add("acoes");

      const botaoEditar = document.createElement("button");
      botaoEditar.textContent = "Editar";
      botaoEditar.classList.add("botao-editar");
      botaoEditar.addEventListener("click", () => {
        prepararEdicao(cliente);
      });

      const botaoExcluir = document.createElement("button");
      botaoExcluir.textContent = "Excluir";
      botaoExcluir.classList.add("botao-excluir");
      botaoExcluir.addEventListener("click", () => {
        excluirCliente(cliente.id);
      });

      acoes.append(botaoEditar, botaoExcluir);
      item.append(nome, email, idade, acoes);
      listaClientes.appendChild(item);
    });
  } catch (erro) {
    mostrarMensagem(erro.message);
  }
}

// Cadastrar ou atualizar um usuário
formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const dadosCliente = {
    nome: campoNome.value.trim(),
    email: campoEmail.value.trim(),
    idade: Number(campoIdade.value)
  };

  let metodo;
  let dadosEnviar = dadosCliente;

  if (idEmEdicao === null) {
    metodo = "POST";
  } else {
    const camposAlterados = {};

    for (const campo in dadosCliente) {
      if (dadosCliente[campo] !== dadosOriginais[campo]) {
        camposAlterados[campo] = dadosCliente[campo];
      }
    }

    metodo = "PATCH";
    dadosEnviar = camposAlterados;
  }

  let endereco;

  if (idEmEdicao === null) {
    endereco = "/clientes";
  } else {
    endereco = `/clientes/${idEmEdicao}`;
  }

  try {
    const resposta = await fetch(endereco, {
      method: metodo,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dadosEnviar)
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(resultado.erro || "Não foi possível salvar o cliente.");
    }

    mostrarMensagem(
      idEmEdicao === null
        ? "Cliente cadastrado com sucesso!"
        : "Cliente atualizado com sucesso!"
    );

    limparFormulario();
    await carregarClientes();
  } catch (erro) {
    mostrarMensagem(erro.message);
  }
});

// Preencher o formulário para editar um cliente
function prepararEdicao(cliente) {
  idEmEdicao = cliente.id;

  dadosOriginais = {
    nome: cliente.nome,
    email: cliente.email,
    idade: cliente.idade
  };

  campoNome.value = cliente.nome;
  campoEmail.value = cliente.email;
  campoIdade.value = cliente.idade;

  tituloFormulario.textContent = "Editar cliente";
  botaoSalvar.textContent = "Salvar alterações";
  botaoCancelar.hidden = false;

  campoNome.focus();
}

// Excluir um cliente
async function excluirCliente(id) {
  const confirmar = confirm("Deseja realmente excluir este cliente?");

  if (!confirmar) {
    return;
  }

  try {
    const resposta = await fetch(`/clientes/${id}`, {
      method: "DELETE"
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(resultado.erro || "Não foi possível excluir o cliente.");
    }

    mostrarMensagem("Cliente excluído com sucesso!");

    await carregarClientes();
  } catch (erro) {
    mostrarMensagem(erro.message);
  }
}

// Restaurar o formulário para o cadastro
function limparFormulario() {
  formulario.reset();

  idEmEdicao = null;
  dadosOriginais = null;

  tituloFormulario.textContent = "Cadastrar usuário";
  botaoSalvar.textContent = "Cadastrar usuário";
  botaoCancelar.hidden = true;
}

botaoCancelar.addEventListener("click", () => {
  limparFormulario();
  mostrarMensagem("");
});

// Exibir mensagens na página
function mostrarMensagem(texto) {
  mensagem.textContent = texto;
}

botaoToggleClientes.addEventListener("click", async () => {
  const mostrar = listaClientes.hidden;

  listaClientes.hidden = !mostrar;

  if (mostrar) {
    botaoToggleClientes.textContent = "Ocultar clientes";
    await carregarClientes();
  } else {
    botaoToggleClientes.textContent = "Mostrar clientes";
  }
});

