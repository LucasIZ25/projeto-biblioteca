const links = document.querySelectorAll(".menu-link");
const paginas = document.querySelectorAll(".page");

let livrosCarregados = [];
let emprestimosCarregados = [];

links.forEach((link) => {
  link.addEventListener("click", function (event) {
    event.preventDefault();

    const pagina = link.getAttribute("data-page");

    trocarPagina(pagina, link);
  });
});

const linkVerTodos = document.querySelector(".menu-link-small");

if (linkVerTodos) {
  linkVerTodos.addEventListener("click", function (event) {
    event.preventDefault();

    trocarPagina("emprestimos");
  });
}

function trocarPagina(pagina, linkAtivo = null) {
  links.forEach((item) => {
    item.classList.remove("active");
  });

  paginas.forEach((section) => {
    section.classList.remove("active");
  });

  if (linkAtivo) {
    linkAtivo.classList.add("active");
  } else {
    const linkMenu = document.querySelector(`.menu-link[data-page="${pagina}"]`);

    if (linkMenu) {
      linkMenu.classList.add("active");
    }
  }

  const paginaSelecionada = document.getElementById(pagina);

  if (paginaSelecionada) {
    paginaSelecionada.classList.add("active");
  }
}

function carregarUsuario() {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!usuarioLogado) {
    alert("Você precisa fazer login.");
    window.location.href = "index.html";
    return;
  }

  if (usuarioLogado.perfil !== "bibliotecario") {
    alert("Acesso permitido apenas para bibliotecários.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("nomeUsuario").textContent = usuarioLogado.nome;
  document.getElementById("tipoUsuario").textContent = "Bibliotecário";

  document.getElementById("saudacaoUsuario").textContent = usuarioLogado.nome;
  document.getElementById("saudacaoUsuarioLivros").textContent = usuarioLogado.nome;
  document.getElementById("saudacaoUsuarioEmprestimos").textContent = usuarioLogado.nome;
}

const btnLogout = document.querySelector(".logout");

if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
  });
}

const formLivro = document.getElementById("formLivro");
const buscarLivro = document.getElementById("buscarLivro");

formLivro.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = document.getElementById("tituloLivro").value;
  const autor = document.getElementById("autorLivro").value;
  const ano = Number(document.getElementById("anoLivro").value);
  const quantidade = Number(document.getElementById("quantidadeLivro").value);
  const id = document.getElementById("idLivro").value;

  const url = id ? `/api/livros/${id}` : "/api/livros";
  const metodo = id ? "PUT" : "POST";

  try {
    const resposta = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        titulo,
        autor,
        ano,
        quantidade
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.mensagem || "Erro ao salvar livro.");
      return;
    }

    if (id) {
      alert(`Livro "${dados.titulo}" atualizado com sucesso!`);
    } else {
      alert(`Livro "${dados.titulo}" cadastrado com sucesso!`);
    }

    formLivro.reset();
    document.getElementById("idLivro").value = "";
    document.getElementById("btnSalvarLivro").textContent = "Cadastrar";

    await carregarLivros();

  } catch (error) {
    console.error(error);
    alert("Erro ao conectar com o servidor.");
  }
});

async function carregarLivros() {
  try {
    const resposta = await fetch("/api/livros");
    const livros = await resposta.json();

    if (!resposta.ok) {
      alert(livros.mensagem || "Erro ao carregar livros.");
      return;
    }

    livrosCarregados = livros;
    mostrarLivros(livrosCarregados);
    atualizarDashboard();

  } catch (error) {
    console.error("Erro ao carregar livros:", error);
    alert("Erro ao carregar livros.");
  }
}

function mostrarLivros(livros) {
  const tabela = document.getElementById("tabelaLivros");
  tabela.innerHTML = "";

  livros.forEach((livro) => {
    tabela.innerHTML += `
      <tr>
        <td>${livro.id}</td>
        <td>${livro.titulo}</td>
        <td>${livro.autor}</td>
        <td>${livro.ano || ""}</td>
        <td>${livro.disponivel}</td>
        <td>
          <button onclick="editarLivro(${livro.id})">
            Editar
          </button>

          <button onclick="deletarLivro(${livro.id})">
            Excluir
          </button>
        </td>
      </tr>
    `;
  });

  document.getElementById("contadorLivros").textContent = livros.length;
}

async function deletarLivro(id) {
  const confirmar = confirm("Tem certeza que deseja excluir este livro?");

  if (!confirmar) {
    return;
  }

  try {
    const resposta = await fetch(`/api/livros/${id}`, {
      method: "DELETE"
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.mensagem || "Erro ao excluir livro.");
      return;
    }

    alert(dados.mensagem);
    await carregarLivros();

  } catch (error) {
    console.error(error);
    alert("Erro ao conectar com o servidor.");
  }
}

function editarLivro(id) {
  const livro = livrosCarregados.find((livro) => livro.id === id);

  if (!livro) {
    alert("Livro não encontrado.");
    return;
  }

  document.getElementById("idLivro").value = livro.id;
  document.getElementById("tituloLivro").value = livro.titulo;
  document.getElementById("autorLivro").value = livro.autor;
  document.getElementById("anoLivro").value = livro.ano || "";
  document.getElementById("quantidadeLivro").value = livro.quantidade;
  document.getElementById("btnSalvarLivro").textContent = "Atualizar";

  trocarPagina("livros");
}

if (buscarLivro) {
  buscarLivro.addEventListener("input", () => {
    const texto = buscarLivro.value.toLowerCase();

    const filtrados = livrosCarregados.filter((livro) => {
      return (
        livro.titulo.toLowerCase().includes(texto) ||
        livro.autor.toLowerCase().includes(texto)
      );
    });

    mostrarLivros(filtrados);
  });
}


async function carregarEmprestimos() {
  try {
    const resposta = await fetch("/api/emprestimos");
    const emprestimos = await resposta.json();

    if (!resposta.ok) {
      alert(emprestimos.mensagem || "Erro ao carregar empréstimos.");
      return;
    }

    emprestimosCarregados = emprestimos;

    mostrarEmprestimos(emprestimosCarregados);
    mostrarEmprestimosRecentes(emprestimosCarregados);
    atualizarDashboard();

  } catch (error) {
    console.error("Erro ao carregar empréstimos:", error);
    alert("Erro ao carregar empréstimos.");
  }
}

function mostrarEmprestimos(emprestimos) {
  const tabela = document.getElementById("tabelaEmprestimos");
  tabela.innerHTML = "";

  emprestimos.forEach((emprestimo) => {
    const podeDevolver = emprestimo.status !== "devolvido";

    tabela.innerHTML += `
      <tr>
        <td>${emprestimo.leitor_nome}</td>
        <td>${emprestimo.livro_titulo}</td>
        <td>${formatarDataTela(emprestimo.data_emprestimo)}</td>
        <td>${formatarDataTela(emprestimo.data_devolucao_prevista)}</td>
        <td>${emprestimo.status}</td>
        <td>
          ${
            podeDevolver
              ? `<button onclick="aprovarDevolucao(${emprestimo.id})">Aprovar devolução</button>`
              : "Devolvido"
          }
        </td>
      </tr>
    `;
  });

  document.getElementById("contadorEmprestimos").textContent = emprestimos.length;
}

function mostrarEmprestimosRecentes(emprestimos) {
  const tabela = document.getElementById("tabelaEmprestimosRecentes");
  tabela.innerHTML = "";

  const recentes = emprestimos.slice(0, 5);

  recentes.forEach((emprestimo) => {
    tabela.innerHTML += `
      <tr>
        <td>${emprestimo.leitor_nome}</td>
        <td>${emprestimo.livro_titulo}</td>
        <td>${formatarDataTela(emprestimo.data_devolucao_prevista)}</td>
        <td>${emprestimo.status}</td>
      </tr>
    `;
  });
}

async function aprovarDevolucao(id) {
  const confirmar = confirm("Deseja aprovar a devolução deste livro?");

  if (!confirmar) {
    return;
  }

  try {
    const resposta = await fetch(`/api/emprestimos/${id}/devolver`, {
      method: "PUT"
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.mensagem || "Erro ao aprovar devolução.");
      return;
    }

    alert(dados.mensagem);

    await carregarLivros();
    await carregarEmprestimos();

  } catch (error) {
    console.error(error);
    alert("Erro ao conectar com o servidor.");
  }
}

function atualizarDashboard() {
  const totalLivros = livrosCarregados.length;

  const livrosDisponiveis = livrosCarregados.reduce((total, livro) => {
    return total + Number(livro.disponivel);
  }, 0);

  const emprestimosAtivos = emprestimosCarregados.filter((emprestimo) => {
    return emprestimo.status === "ativo";
  }).length;

  const livrosAtrasados = emprestimosCarregados.filter((emprestimo) => {
    return emprestimo.status === "atrasado";
  }).length;

  document.getElementById("totalLivros").textContent = totalLivros;
  document.getElementById("livrosDisponiveis").textContent = livrosDisponiveis;
  document.getElementById("emprestimosAtivos").textContent = emprestimosAtivos;
  document.getElementById("livrosAtrasados").textContent = livrosAtrasados;
}

function formatarDataTela(data) {
  if (!data) return "-";

  const dataFormatada = new Date(data);

  return dataFormatada.toLocaleDateString("pt-BR", {
    timeZone: "UTC"
  });
}

carregarUsuario();
carregarLivros();
carregarEmprestimos();