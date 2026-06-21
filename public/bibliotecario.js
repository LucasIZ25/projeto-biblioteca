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

    const paginaSelecionada = document.getElementById(pagina);

    if (paginaSelecionada) {
      paginaSelecionada.classList.add("active");
    }
  });
});

const formLivro = document.getElementById("formLivro");
<<<<<<< HEAD

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
=======
const tabelaLivros = document.getElementById("tabelaLivros");
const contadorLivros = document.getElementById("contadorLivros");
const totalLivros = document.getElementById("totalLivros");
const livrosDisponiveis = document.getElementById("livrosDisponiveis");

async function carregarLivros() {
  try {
    const resposta = await fetch("/api/livros");
    const livros = await resposta.json();

    console.log(livros);

    tabelaLivros.innerHTML = "";

    livros.forEach((livro) => {
      tabelaLivros.innerHTML += `
        <tr>
          <td>${livro.id}</td>
          <td>${livro.titulo}</td>
          <td>${livro.autor}</td>
          <td>${livro.ano}</td>
          <td>${livro.disponivel}/${livro.quantidade}</td>
          <td>
            <button class="btn-editar" onclick="editarLivro(${livro.id})">Editar</button>
            <button class="btn-excluir" onclick="excluirLivro(${livro.id})">Excluir</button>
          </td>
        </tr>
      `;
    });

    contadorLivros.textContent = livros.length;
    totalLivros.textContent = livros.length;

    let totalDisponivel = 0;

    livros.forEach((livro) => {
      totalDisponivel += Number(livro.disponivel);
    });

    livrosDisponiveis.textContent = totalDisponivel;
  } catch (error) {
    alert("Erro ao carregar livros.");
  }
}

formLivro.addEventListener("submit", async (event) => {
  event.preventDefault();

  const idLivro = document.getElementById("idLivro").value;
  const titulo = document.getElementById("tituloLivro").value;
  const autor = document.getElementById("autorLivro").value;
  const ano = document.getElementById("anoLivro").value;
  const quantidade = document.getElementById("quantidadeLivro").value;

  const livro = {
    titulo,
    autor,
    ano,
    quantidade,
    disponivel: quantidade
  };

  try {
    if (idLivro) {
      await fetch(`/api/livros/${idLivro}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(livro)
      });

      alert("Livro atualizado com sucesso!");
    } else {
      await fetch("/api/livros", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(livro)
      });

      alert("Livro cadastrado com sucesso!");
    }

    formLivro.reset();
    document.getElementById("idLivro").value = "";
    document.getElementById("btnSalvarLivro").textContent = "Cadastrar";

    carregarLivros();
  } catch (error) {
    alert("Erro ao salvar livro.");
  }
});

async function editarLivro(id) {
  try {
    const resposta = await fetch(`/api/livros/${id}`);
    const livro = await resposta.json();

    document.getElementById("idLivro").value = livro.id;
    document.getElementById("tituloLivro").value = livro.titulo;
    document.getElementById("autorLivro").value = livro.autor;
    document.getElementById("anoLivro").value = livro.ano;
    document.getElementById("quantidadeLivro").value = livro.quantidade;

    document.getElementById("btnSalvarLivro").textContent = "Atualizar";
  } catch (error) {
    alert("Erro ao editar livro.");
  }
}

async function excluirLivro(id) {
  try {
    await fetch(`/api/livros/${id}`, {
      method: "DELETE"
    });

    alert("Livro excluído com sucesso!");
    carregarLivros();
  } catch (error) {
    alert("Erro ao excluir livro.");
  }
>>>>>>> 85369adbacd851b6397e3894ccc331e5c6dc49f0
}

carregarLivros();