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
const tabelaLivros = document.getElementById("tabelaLivros");
const contadorLivros = document.getElementById("contadorLivros");
const totalLivros = document.getElementById("totalLivros");
const livrosDisponiveis = document.getElementById("livrosDisponiveis");

async function carregarLivros() {
  try {
    const resposta = await fetch("/api/livros");
    const livros = await resposta.json();

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
}

const tabelaEmprestimos = document.getElementById("tabelaEmprestimos");
const tabelaEmprestimosRecentes = document.getElementById("tabelaEmprestimosRecentes");
const contadorEmprestimos = document.getElementById("contadorEmprestimos");
const emprestimosAtivos = document.getElementById("emprestimosAtivos");
const livrosAtrasados = document.getElementById("livrosAtrasados");

async function carregarEmprestimos() {
  try {
    const resposta = await fetch("/api/emprestimos-admin");
    const emprestimos = await resposta.json();

    tabelaEmprestimos.innerHTML = "";
    tabelaEmprestimosRecentes.innerHTML = "";

    let ativos = 0;
    let atrasados = 0;

    emprestimos.forEach((item) => {
      if (item.status === "ativo") {
        ativos++;
      }

      if (item.status === "atrasado") {
        atrasados++;
      }

      tabelaEmprestimos.innerHTML += `
        <tr>
          <td>${item.leitor}</td>
          <td>${item.livro}</td>
          <td>${formatarData(item.data_emprestimo)}</td>
          <td>${formatarData(item.data_devolucao_prevista)}</td>
          <td>
            <span class="status ${item.status}">
              ${item.status}
            </span>
          </td>
          <td>
            ${
              item.status !== "devolvido"
                ? `<button class="btn-devolver" onclick="aprovarDevolucao(${item.id})">Aprovar Devolução</button>`
                : "-"
            }
          </td>
        </tr>
      `;
    });

    emprestimos.slice(0, 5).forEach((item) => {
      tabelaEmprestimosRecentes.innerHTML += `
        <tr>
          <td>${item.leitor}</td>
          <td>${item.livro}</td>
          <td>${formatarData(item.data_devolucao_prevista)}</td>
          <td>
            <span class="status ${item.status}">
              ${item.status}
            </span>
          </td>
        </tr>
      `;
    });

    contadorEmprestimos.textContent = emprestimos.length;
    emprestimosAtivos.textContent = ativos;
    livrosAtrasados.textContent = atrasados;
  } catch (error) {
    alert("Erro ao carregar empréstimos.");
  }
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

    alert(dados.mensagem);

    carregarEmprestimos();
    carregarLivros();
  } catch (error) {
    alert("Erro ao aprovar a devolução.");
  }
}

function formatarData(data) {
  if (!data) {
    return "-";
  }

  return new Date(data).toLocaleDateString("pt-BR");
}

carregarEmprestimos();
carregarLivros();