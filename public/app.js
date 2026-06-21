const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const loginArea = document.getElementById("login-form");
const registerArea = document.getElementById("registerForm");

registerTab.addEventListener("click", () => {
  loginArea.classList.add("hidden");
  registerArea.classList.remove("hidden");

  loginTab.classList.remove("active");
  registerTab.classList.add("active");
});

loginTab.addEventListener("click", () => {
  loginArea.classList.remove("hidden");
  registerArea.classList.add("hidden");

  loginTab.classList.add("active");
  registerTab.classList.remove("active");
});

const backLogin = document.getElementById("backLogin");

backLogin.addEventListener("click", () => {
  registerArea.classList.add("hidden");
  loginArea.classList.remove("hidden");

  loginTab.classList.add("active");
  registerTab.classList.remove("active");
});

const registerFormElement = document.querySelector("#registerForm form");

registerFormElement.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("password").value;
  const perfil = document.getElementById("role").value;

  if (!nome || !email || !senha || !perfil) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  try {
    const resposta = await fetch("/api/usuarios/cadastro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome,
        email,
        senha,
        perfil
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.mensagem || "Erro ao criar conta.");
      return;
    }

    alert("Conta criada com sucesso! Agora você pode fazer login.");

    registerFormElement.reset();
    loginTab.click();

  } catch (error) {
    alert("Erro ao conectar com o servidor.");
    console.error(error);
  }
});

const loginFormElement = document.querySelector("#formLogin");

loginFormElement.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginemail").value;
  const senha = document.getElementById("loginpassword").value;

  if (!email || !senha) {
    alert("Informe e-mail e senha.");
    return;
  }

  try {
    const resposta = await fetch("/api/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        senha
      })
    });

    const usuario = await resposta.json();

    if (!resposta.ok) {
      alert(usuario.mensagem || "E-mail ou senha incorretos.");
      return;
    }

    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
    localStorage.setItem("loggedInUser", JSON.stringify(usuario));

    if (usuario.perfil === "bibliotecario") {
      window.location.href = "bibliotecario.html";
    } else if (usuario.perfil === "leitor") {
      window.location.href = "leitor.html";
    } else {
      alert("Tipo de conta desconhecido.");
    }

  } catch (error) {
    alert("Erro ao conectar com o servidor.");
    console.error(error);
  }
});