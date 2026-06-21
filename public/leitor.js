const links = document.querySelectorAll(".menu-link");
const paginas = document.querySelectorAll(".page");

const listaLivros = document.getElementById("listaLivros");
const contadorLivros = document.getElementById("contadorLivros");
const buscarLivro = document.getElementById("buscarLivro");
const tabelaEmprestimos = document.getElementById("tabelaEmprestimos");

let usuarioLogado = null;
let livrosCarregados = [];
let emprestimosCarregados = [];

links.forEach((link) => {
  link.addEventListener("click", function (event) {
    event.preventDefault();

    const pagina = link.getAttribute("data-page");

    links.forEach((item) => {
      item.classList.remove("active");
    });

    paginas.forEach((section) => {
      section.classList.remove("active");
    });

    link.classList.add("active");

    document.getElementById(pagina).classList.add("active");
  });
});

function carregarUsuario() {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (usuarioLogado) {
    document.getElementById("nomeUsuario").textContent = usuarioLogado.nome;
    document.getElementById("saudacaoUsuario").textContent = usuarioLogado.nome;
    document.getElementById("saudacaoUsuario2").textContent = usuarioLogado.nome;
  }
}

async function carregarLivros() {
  try {
    const resposta = await fetch("/api/livros");
    const livros = await resposta.json();

    mostrarLivros(livros);

    buscarLivro.addEventListener("input", () => {
      const texto = buscarLivro.value.toLowerCase();

      const filtrados = livros.filter((livro) => {
        return (
          livro.titulo.toLowerCase().includes(texto) ||
          livro.autor.toLowerCase().includes(texto)
        );
      });

      mostrarLivros(filtrados);
    });
  } catch (error) {
    alert("Erro ao carregar livros.");
  }
}

function mostrarLivros(livros) {
  listaLivros.innerHTML = "";
  contadorLivros.textContent = livros.length;

  livros.forEach((livro) => {
    listaLivros.innerHTML += `
      <div class="livro-card">
        <div class="livro-capa">📖</div>

        <div class="livro-info">
          <h3>${livro.titulo}</h3>
          <p>${livro.autor}</p>
          <p>${livro.ano}</p>
          <span class="disponivel">${livro.disponivel} disponíveis</span>

          <button class="btn-solicitar" onclick="solicitarEmprestimo(${livro.id})">
            Solicitar Empréstimo
          </button>
        </div>
      </div>
    `;
  });
}

async function solicitarEmprestimo(livroId) {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!usuarioLogado) {
    alert("Você precisa fazer login.");
    window.location.href = "index.html";
    return;
  }

  try {
    const resposta = await fetch("/api/emprestimos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        livro_id: livroId,
        leitor_id: usuarioLogado.id
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.mensagem || "Erro ao solicitar empréstimo.");
      return;
    }

    alert("Empréstimo solicitado com sucesso!");

    carregarLivros();
    carregarEmprestimos();

  } catch (error) {
    console.error(error);
    alert("Erro ao solicitar empréstimo.");
  }
}

async function carregarEmprestimos() {
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!usuarioLogado) {
    return;
  }

  try {
    const resposta = await fetch(`/api/emprestimos?leitor_id=${usuarioLogado.id}`);
    const emprestimos = await resposta.json();

    tabelaEmprestimos.innerHTML = "";

    emprestimos.forEach((emprestimo) => {
      tabelaEmprestimos.innerHTML += `
        <tr>
          <td>${emprestimo.livro_titulo}</td>
          <td>${formatarData(emprestimo.data_emprestimo)}</td>
          <td>${formatarData(emprestimo.data_devolucao_prevista)}</td>
          <td>${emprestimo.status}</td>
          <td>
            ${
              emprestimo.status !== "devolvido"
                ? `<button onclick="solicitarDevolucao()">Solicitar devolução</button>`
                : "Finalizado"
            }
          </td>
        </tr>
      `;
    });

  } catch (error) {
    console.error(error);
    alert("Erro ao carregar empréstimos.");
  }
}

function solicitarDevolucao() {
  alert("Solicitação registrada. Aguarde o bibliotecário aprovar a devolução.");
}

function formatarData(data) {
  if (!data) return "-";

  return new Date(data).toLocaleDateString("pt-BR", {
    timeZone: "UTC"
  });
}

carregarUsuario();
carregarLivros();
carregarEmprestimos();