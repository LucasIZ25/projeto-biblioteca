const links = document.querySelectorAll(".menu-link");
const paginas = document.querySelectorAll(".page");

const listaLivros = document.getElementById("listaLivros");
const contadorLivros = document.getElementById("contadorLivros");
const buscarLivro = document.getElementById("buscarLivro");
const tabelaEmprestimos = document.getElementById("tabelaEmprestimos");

let livrosCarregados = [];

/* ==========================================================================
   NAVEGAÇÃO INTERNA (TABS)
   ========================================================================== */
links.forEach((link) => {
  link.addEventListener("click", function (event) {
    event.preventDefault();
    const pagina = link.getAttribute("data-page");

    links.forEach((item) => item.classList.remove("active"));
    paginas.forEach((section) => section.classList.remove("active"));

    link.classList.add("active");
    const alvo = document.getElementById(pagina);
    if (alvo) alvo.classList.add("active");
  });
});

/* ==========================================================================
   CONTROLE DE SESSÃO E SEGURANÇA
   ========================================================================== */
function carregarUsuario() {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!usuarioLogado || usuarioLogado.perfil !== "leitor") {
    alert("Acesso negado. Por favor, faça login como leitor.");
    localStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
    return null;
  }

  // Preenche as saudações dinâmicas na interface
  document.getElementById("nomeUsuario").textContent = usuarioLogado.nome;
  document.getElementById("saudacaoUsuario").textContent = usuarioLogado.nome;
  document.getElementById("saudacaoUsuario2").textContent = usuarioLogado.nome;

  return usuarioLogado;
}

const btnLogout = document.querySelector(".logout");
if (btnLogout) {
  btnLogout.addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
  });
}

/* ==========================================================================
   CATÁLOGO DE LIVROS
   ========================================================================== */
async function carregarLivros() {
  try {
    const resposta = await fetch("/api/livros");
    const livros = await resposta.json();

    if (!resposta.ok) throw new Error();

    livrosCarregados = livros;
    mostrarLivros(livrosCarregados);
  } catch (error) {
    console.error("Erro ao carregar livros:", error);
  }
}

function mostrarLivros(livros) {
  if (!listaLivros) return;
  listaLivros.innerHTML = "";
  contadorLivros.textContent = livros.length;

  livros.forEach((livro) => {
    // Bloqueia visualmente o botão se o livro não estiver disponível para empréstimo
    const temEstoque = livro.disponivel > 0;
    
    listaLivros.innerHTML += `
      <div class="livro-card">
        <div class="livro-capa">📖</div>
        <div class="livro-info">
          <h3>${livro.titulo}</h3>
          <p><strong>Autor:</strong> ${livro.autor}</p>
          <p><strong>Ano:</strong> ${livro.ano || "-"}</p>
          <span class="disponivel ${temEstoque ? '' : 'esgotado'}">
            ${livro.disponivel} disponíveis
          </span>
          <button 
            class="btn-solicitar" 
            onclick="solicitarEmprestimo(${livro.id})"
            ${temEstoque ? "" : "disabled"}
          >
            ${temEstoque ? "Solicitar Empréstimo" : "Indisponível"}
          </button>
        </div>
      </div>
    `;
  });
}

// Filtro de pesquisa em tempo real
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

/* ==========================================================================
   AÇÕES DE EMPRÉSTIMO DO LEITOR
   ========================================================================== */
window.solicitarEmprestimo = async function(livroId) {
  const usuario = carregarUsuario();
  if (!usuario) return;

  try {
    const resposta = await fetch("/api/emprestimos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        livro_id: livroId,
        leitor_id: usuario.id
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.mensagem || "Erro ao solicitar empréstimo.");
      return;
    }

    alert("Empréstimo realizado com sucesso! Retire seu livro na bancada.");

    // Atualiza as listas reativamente sem recarregar a página inteira
    await carregarLivros();
    await carregarEmprestimos();

  } catch (error) {
    console.error(error);
    alert("Erro ao conectar ao servidor.");
  }
};

async function carregarEmprestimos() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario || !tabelaEmprestimos) return;

  try {
    const resposta = await fetch(`/api/emprestimos?leitor_id=${usuario.id}`);
    const emprestimos = await resposta.json();

    if (!resposta.ok) return;

    tabelaEmprestimos.innerHTML = "";

    emprestimos.forEach((emp) => {
      const naoDevolvido = emp.status !== "devolvido";
      tabelaEmprestimos.innerHTML += `
        <tr>
          <td>${emp.livro_titulo}</td>
          <td>${formatarData(emp.data_emprestimo)}</td>
          <td>${formatarData(emp.data_devolucao_prevista)}</td>
          <td><span class="status-${emp.status}">${emp.status}</span></td>
          <td>
            ${
              naoDevolvido
                ? `<button class="btn-devolver-solicitar" onclick="solicitarDevolucao()">Solicitar devolução</button>`
                : "Finalizado"
            }
          </td>
        </tr>
      `;
    });

  } catch (error) {
    console.error(error);
  }
}

window.solicitarDevolucao = function() {
  alert("Solicitação registrada. Dirija-se à biblioteca para entregar o livro físico e aguarde a aprovação do bibliotecário.");
};

function formatarData(data) {
  if (!data) return "-";
  return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

// Inicializa a interface com segurança
carregarUsuario();
carregarLivros();
carregarEmprestimos();