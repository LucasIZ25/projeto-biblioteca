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

          <button class="btn-solicitar">
            Solicitar Empréstimo
          </button>
        </div>
      </div>
    `;
  });
}

carregarUsuario();
carregarLivros();