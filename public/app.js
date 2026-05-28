const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const loginArea = document.getElementById("login-form");
const registerArea = document.getElementById("registerForm");

const theme = document.getElementById("theme");

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

theme.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  theme.textContent = document.body.classList.contains("dark")
    ? "☀️"
    : "🌙";
});


const registerFormElement = document.querySelector("#registerForm form");

registerFormElement.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  if (!name || !email || !password || !role) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const userExists = users.some((user) => user.email === email);

  if (userExists) {
    alert("Este email já está registrado.");
    return;
  }

  users.push({ name, email, password, role });
  localStorage.setItem("users", JSON.stringify(users));

  alert("Conta criada com sucesso! Agora você pode fazer login.");

  loginTab.click();
});

const loginFormElement = document.querySelector("#formLogin");

loginFormElement.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("loginemail").value;
  const password = document.getElementById("loginpassword").value;

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const user = users.find((user) => {
    return user.email === email && user.password === password;
  });

  if (!user) {
    alert("Email ou senha incorretos.");
    return;
  }

  localStorage.setItem("loggedInUser", JSON.stringify(user));

  if (user.role === "bibliotecario") {
    window.location.href = "bibliotecario.html";
  } else if (user.role === "leitor") {
    window.location.href = "leitor.html";
  }else {
    alert("Tipo de conta desconhecido.");
  }
});