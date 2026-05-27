const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("registerForm");

registerTab.addEventListener("click", () => {
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");

  loginTab.classList.remove("active");
  registerTab.classList.add("active");
});

loginTab.addEventListener("click", () => {
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");

  loginTab.classList.add("active");
  registerTab.classList.remove("active");
});

const theme= document.getElementById("theme");
theme.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  if (document.body.classList.contains("dark")) {
    theme.textContent = "☀️";
  } else {
    theme.textContent = "🌙";
  }
});
