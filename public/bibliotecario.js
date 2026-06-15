const links = document.querySelectorAll(".menu-link");
const paginas = document.querySelectorAll(".page");

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

const formLivro = document.getElementById("formLivro");

formLivro.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = document.getElementById("tituloLivro").value;
  const autor = document.getElementById("autorLivro").value;
  const ano = Number(document.getElementById("anoLivro").value);
  const quantidade = Number(document.getElementById("quantidadeLivro").value);
  const id = document.getElementById("idLivro").value;

  const url = id ? `/api/livros/${id}` : "/api/livros";
  const metodo = id ? "PUT" : "POST";

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

  const livro = await resposta.json();

  alert(`Livro "${livro.titulo}" cadastrado com sucesso!`);

  formLivro.reset();
  document.getElementById("idLivro").value = "";
  carregarLivros();
});

async function carregarLivros() {
  const resposta = await fetch("/api/livros");
  const livros = await resposta.json();

  const tabela = document.getElementById("tabelaLivros");
  tabela.innerHTML = "";

  livros.forEach((livro) => {
    tabela.innerHTML += `
      <tr>
        <td>${livro.id}</td>
        <td>${livro.titulo}</td>
        <td>${livro.autor}</td>
        <td>${livro.ano}</td>
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
}

async function deletarLivro(id) {
  await fetch(`/api/livros/${id}`, {
    method: "DELETE"
  });

  carregarLivros();
}

async function editarLivro(id) {
  const resposta = await fetch("/api/livros");
  const livros = await resposta.json();

  const livro = livros.find(livro => livro.id === id);

  if (!livro) return;

  document.getElementById("idLivro").value = livro.id;
  document.getElementById("tituloLivro").value = livro.titulo;
  document.getElementById("autorLivro").value = livro.autor;
  document.getElementById("anoLivro").value = livro.ano;
  document.getElementById("quantidadeLivro").value = livro.quantidade;
}

carregarLivros();