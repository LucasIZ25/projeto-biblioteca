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