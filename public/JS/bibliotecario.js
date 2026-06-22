const links = document.querySelectorAll(".menu-link");
const paginas = document.querySelectorAll(".page");

let livrosCarregados = [];
let emprestimosCarregados = [];

// Gerenciamento de Navegação entre as Páginas Internas
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
  links.forEach((item) => item.classList.remove("active"));
  paginas.forEach((section) => section.classList.remove("active"));

  if (linkAtivo) {
    linkAtivo.classList.add("active");
  } else {
    const linkMenu = document.querySelector(`.menu-link[data-page="${pagina}"]`);
    if (linkMenu) linkMenu.classList.add("active");
  }

  const paginaSelecionada = document.getElementById(pagina);
  if (paginaSelecionada) paginaSelecionada.classList.add("active");
}

/* ==========================================================================
   CONTROLE DE SESSÃO E SEGURANÇA
   ========================================================================== */
function carregarUsuario() {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!usuarioLogado || usuarioLogado.perfil !== "bibliotecario") {
    alert("Acesso negado. Por favor, faça login como bibliotecário.");
    localStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
    return;
  }

  // Exibe o nome do usuário nas saudações do painel
  document.getElementById("nomeUsuario").textContent = usuarioLogado.nome;
  document.getElementById("tipoUsuario").textContent = "Bibliotecário";
  
  const tagsSaudacao = ["saudacaoUsuario", "saudacaoUsuarioLivros", "saudacaoUsuarioEmprestimos"];
  tagsSaudacao.forEach(id => {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = usuarioLogado.nome;
  });
}

const btnLogout = document.querySelector(".logout");
if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
  });
}

/* ==========================================================================
   GERENCIAMENTO DE LIVROS (CRUD)
   ========================================================================== */
const formLivro = document.getElementById("formLivro");
const buscarLivro = document.getElementById("buscarLivro");

formLivro.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = document.getElementById("tituloLivro").value.trim();
  const autor = document.getElementById("autorLivro").value.trim();
  const ano = Number(document.getElementById("anoLivro").value);
  const quantidade = Number(document.getElementById("quantidadeLivro").value);
  const id = document.getElementById("idLivro").value;

  const url = id ? `/api/livros/${id}` : "/api/livros";
  const metodo = id ? "PUT" : "POST";

  try {
    const resposta = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, autor, ano, quantidade })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.mensagem || "Erro ao salvar livro.");
      return;
    }

    alert(`Livro "${dados.titulo}" ${id ? "atualizado" : "cadastrado"} com sucesso!`);
    
    formLivro.reset();
    document.getElementById("idLivro").value = "";
    document.getElementById("btnSalvarLivro").textContent = "Cadastrar";

    await carregarLivros();
    trocarPagina("dashboard"); // Retorna para a home após salvar

  } catch (error) {
    console.error(error);
    alert("Erro ao conectar com o servidor.");
  }
});

async function carregarLivros() {
  try {
    const resposta = await fetch("/api/livros");
    const livros = await resposta.json();

    if (!resposta.ok) return;

    livrosCarregados = livros;
    mostrarLivros(livrosCarregados);
    atualizarDashboard();
  } catch (error) {
    console.error("Erro ao carregar livros:", error);
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
        <td>${livro.ano || "-"}</td>
        <td>${livro.disponivel}</td>
        <td>
          <button class="btn-editar" onclick="editarLivro(${livro.id})">Editar</button>
          <button class="btn-excluir" onclick="deletarLivro(${livro.id})">Excluir</button>
        </td>
      </tr>
    `;
  });

  const contador = document.getElementById("contadorLivros");
  if (contador) contador.textContent = livros.length;
}

window.editarLivro = function(id) {
  const livro = livrosCarregados.find((l) => l.id === id);
  if (!livro) return;

  document.getElementById("idLivro").value = livro.id;
  document.getElementById("tituloLivro").value = livro.titulo;
  document.getElementById("autorLivro").value = livro.autor;
  document.getElementById("anoLivro").value = livro.ano || "";
  document.getElementById("quantidadeLivro").value = livro.quantidade;
  document.getElementById("btnSalvarLivro").textContent = "Atualizar";

  trocarPagina("livros");
};

window.deletarLivro = function(id) {
  if (!confirm("Tem certeza que deseja excluir este livro?")) return;

  fetch(`/api/livros/${id}`, { method: "DELETE" })
    .then(async (res) => {
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.mensagem);
      alert(dados.mensagem);
      carregarLivros();
    })
    .catch((err) => alert(err.message || "Erro ao excluir livro."));
};

if (buscarLivro) {
  buscarLivro.addEventListener("input", () => {
    const texto = buscarLivro.value.toLowerCase();
    const filtrados = livrosCarregados.filter((l) => 
      l.titulo.toLowerCase().includes(texto) || l.autor.toLowerCase().includes(texto)
    );
    mostrarLivros(filtrados);
  });
}

/* ==========================================================================
   GERENCIAMENTO DE EMPRÉSTIMOS E DEVOLUÇÕES
   ========================================================================== */
async function carregarEmprestimos() {
  try {
    const resposta = await fetch("/api/emprestimos");
    const emprestimos = await resposta.json();

    if (!resposta.ok) return;

    emprestimosCarregados = emprestimos;
    mostrarEmprestimos(emprestimosCarregados);
    mostrarEmprestimosRecentes(emprestimosCarregados);
    atualizarDashboard();
  } catch (error) {
    console.error("Erro ao carregar empréstimos:", error);
  }
}

function mostrarEmprestimos(emprestimos) {
  const tabela = document.getElementById("tabelaEmprestimos");
  tabela.innerHTML = "";

  emprestimos.forEach((emp) => {
    const ativo = emp.status !== "devolvido";
    tabela.innerHTML += `
      <tr>
        <td>${emp.leitor_nome}</td>
        <td>${emp.livro_titulo}</td>
        <td>${formatarDataTela(emp.data_emprestimo)}</td>
        <td>${formatarDataTela(emp.data_devolucao_prevista)}</td>
        <td><span class="status-${emp.status}">${emp.status}</span></td>
        <td>
          ${ativo ? `<button class="btn-devolver" onclick="aprovarDevolucao(${emp.id})">Aprovar Devolução</button>` : "Finalizado"}
        </td>
      </tr>
    `;
  });

  const contador = document.getElementById("contadorEmprestimos");
  if (contador) contador.textContent = emprestimos.length;
}

function mostrarEmprestimosRecentes(emprestimos) {
  const tabela = document.getElementById("tabelaEmprestimosRecentes");
  if (!tabela) return;
  tabela.innerHTML = "";

  emprestimos.slice(0, 5).forEach((emp) => {
    tabela.innerHTML += `
      <tr>
        <td>${emp.leitor_nome}</td>
        <td>${emp.livro_titulo}</td>
        <td>${formatarDataTela(emp.data_devolucao_prevista)}</td>
        <td><span class="status-${emp.status}">${emp.status}</span></td>
      </tr>
    `;
  });
}

window.aprovarDevolucao = function(id) {
  if (!confirm("Deseja aprovar a devolução deste livro?")) return;

  fetch(`/api/emprestimos/${id}/devolver`, { method: "PUT" })
    .then(async (res) => {
      const dados = await res.json();
      if (!res.ok) throw new Error(dados.mensagem);
      alert(dados.mensagem);
      await carregarLivros();
      await carregarEmprestimos();
    })
    .catch((err) => alert(err.message));
};

/* ==========================================================================
   FUNÇÕES DE APOIO (MÉTRICAS E DATAS)
   ========================================================================== */
function atualizarDashboard() {
  const totalLivros = livrosCarregados.length;
  const livrosDisponiveis = livrosCarregados.reduce((acc, l) => acc + Number(l.disponivel), 0);
  const emprestimosAtivos = emprestimosCarregados.filter((e) => e.status === "ativo").length;
  const livrosAtrasados = emprestimosCarregados.filter((e) => e.status === "atrasado").length;

  document.getElementById("totalLivros").textContent = totalLivros;
  document.getElementById("livrosDisponiveis").textContent = livrosDisponiveis;
  document.getElementById("emprestimosAtivos").textContent = emprestimosAtivos;
  document.getElementById("livrosAtrasados").textContent = livrosAtrasados;
}

function formatarDataTela(data) {
  if (!data) return "-";
  return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

// Inicialização da página
carregarUsuario();
carregarLivros();
carregarEmprestimos();