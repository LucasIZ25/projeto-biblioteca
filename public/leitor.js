const links = document.querySelectorAll(".menu-link");
const paginas = document.querySelectorAll(".page");

const listaLivros = document.getElementById("listaLivros");
const contadorLivros = document.getElementById("contadorLivros");
const buscarLivro = document.getElementById("buscarLivro");

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

          <button 
            class="btn-solicitar"
            onclick="solicitarEmprestimo(${livro.id})"
            ${livro.disponivel <= 0 ? "disabled" : ""}
          >
            Solicitar Empréstimo
          </button>
        </div>
      </div>
    `;
  });
}

async function solicitarEmprestimo(idLivro) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!usuario) {
    alert("Usuário não encontrado. Faça login novamente.");
    return;
  }

  try {
    const resposta = await fetch("/api/emprestimos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        leitor_id: usuario.id,
        livro_id: idLivro
      })
    });

    const dados = await resposta.json();

    alert(dados.mensagem);

    carregarLivros();
    carregarEmprestimos();
  } catch (error) {
    alert("Erro ao solicitar empréstimo.");
  }
}

async function carregarEmprestimos() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!usuario) {
    return;
  }

  try {
    const resposta = await fetch(`/api/emprestimos/${usuario.id}`);
    const emprestimos = await resposta.json();

    const tabela = document.getElementById("tabelaEmprestimos");

    tabela.innerHTML = "";

    emprestimos.forEach((item) => {
      tabela.innerHTML += `
        <tr>
          <td>${item.livro}</td>
          <td>${formatarData(item.data_emprestimo)}</td>
          <td>${formatarData(item.data_devolucao_prevista)}</td>
          <td>${item.status}</td>
          <td>
            ${
              item.status === "ativo"
                ? `<button onclick="devolverLivro(${item.id})">Devolver</button>`
                : "-"
            }
          </td>
        </tr>
      `;
    });
  } catch (error) {
    alert("Erro ao carregar empréstimos.");
  }
}

async function devolverLivro(id) {
  try {
    const resposta = await fetch(`/api/emprestimos/${id}/devolver`, {
      method: "PUT"
    });

    const dados = await resposta.json();

    alert(dados.mensagem);

    carregarEmprestimos();
    carregarLivros();
  } catch (error) {
    alert("Erro ao devolver livro.");
  }
}

function formatarData(data) {
  if (!data) {
    return "-";
  }

  return new Date(data).toLocaleDateString("pt-BR");
}

carregarUsuario();
carregarLivros();
carregarEmprestimos();