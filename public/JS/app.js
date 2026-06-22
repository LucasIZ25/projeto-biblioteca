// Elementos de alternância das abas (Tabs)
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginArea = document.getElementById("login-form");
const registerArea = document.getElementById("registerForm");
const backLogin = document.getElementById("backLogin");

// Elemento de Alerta da Tela
const alertElement = document.querySelector(".alert");

// Funções Auxiliares para Exibir Mensagens
function exibirAlerta(mensagem, tipo = "info") {
  alertElement.textContent = `ⓘ ${mensagem}`;
  alertElement.style.display = "block";
  
  if (tipo === "sucesso") {
    alertElement.style.background = "#e6f4ea";
    alertElement.style.color = "#137333";
  } else {
    alertElement.style.background = "#fce8e6";
    alertElement.style.color = "#c5221f";
  }
}

function limparAlerta() {
  alertElement.style.display = "none";
}

// Alternar para a aba de Cadastro
registerTab.addEventListener("click", () => {
  limparAlerta();
  loginArea.classList.add("hidden");
  registerArea.classList.remove("hidden");
  loginTab.classList.remove("active");
  registerTab.classList.add("active");
});

// Alternar para a aba de Login
loginTab.addEventListener("click", () => {
  limparAlerta();
  loginArea.classList.remove("hidden");
  registerArea.classList.add("hidden");
  loginTab.classList.add("active");
  registerTab.classList.remove("active");
});

// Botão Voltar para o Login
if (backLogin) {
  backLogin.addEventListener("click", () => {
    loginTab.click();
  });
}

/* ==========================================================================
   SUBMIT: CADASTRO DE USUÁRIO
   ========================================================================== */
const registerFormElement = document.querySelector("#registerForm form");

registerFormElement.addEventListener("submit", async (e) => {
  e.preventDefault();
  limparAlerta();

  const nome = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("password").value;
  const perfil = document.getElementById("role").value;

  if (!nome || !email || !senha || !perfil) {
    exibirAlerta("Por favor, preencha todos os campos do cadastro.");
    return;
  }

  try {
    const resposta = await fetch("/api/usuarios/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha, perfil })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      exibirAlerta(dados.mensagem || "Erro ao criar conta.");
      return;
    }

    // Conta criada com sucesso
    exibirAlerta("Conta criada com sucesso! Entre agora.", "sucesso");
    registerFormElement.reset();
    
    // Pequeno delay para o usuário ler o sucesso antes de mudar de aba
    setTimeout(() => {
      loginTab.click();
    }, 1500);

  } catch (error) {
    exibirAlerta("Erro ao conectar com o servidor.");
    console.error(error);
  }
});

/* ==========================================================================
   SUBMIT: LOGIN DO USUÁRIO
   ========================================================================== */
const loginFormElement = document.querySelector("#formLogin");

loginFormElement.addEventListener("submit", async (e) => {
  e.preventDefault();
  limparAlerta();

  const email = document.getElementById("loginemail").value.trim();
  const senha = document.getElementById("loginpassword").value;

  if (!email || !senha) {
    exibirAlerta("Informe o e-mail e a senha para entrar.");
    return;
  }

  try {
    const resposta = await fetch("/api/usuarios/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    const usuario = await resposta.json();

    if (!resposta.ok) {
      exibirAlerta(usuario.mensagem || "E-mail ou senha incorretos.");
      return;
    }

    // Salva o estado do usuário de forma limpa e centralizada
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

    // Redirecionamento baseado no perfil retornado pelo banco
    if (usuario.perfil === "bibliotecario") {
      window.location.href = "bibliotecario.html";
    } else if (usuario.perfil === "leitor") {
      window.location.href = "leitor.html";
    } else {
      exibirAlerta("Tipo de conta não identificado.");
    }

  } catch (error) {
    exibirAlerta("Erro ao conectar com o servidor.");
    console.error(error);
  }
});


localStorage.removeItem("usuarioLogado");