const toggleBtn = document.querySelector(".mobile-menu-toggle");
const nav = document.querySelector(".main-nav");

toggleBtn.addEventListener("click", () => {
  nav.classList.toggle("active");
  toggleBtn.classList.toggle("active");
});

document.querySelectorAll(".dropdown").forEach(drop => {
  const btn = drop.querySelector(".dropdown-toggle");

  btn.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      drop.classList.toggle("active");
    }
  });
});

const themeBtn = document.querySelector(".theme-toggle");

themeBtn.addEventListener("click", () => {
  const goDark = !document.body.classList.contains("dark-mode");
  document.body.classList.toggle("dark-mode", goDark);
  localStorage.setItem("mavericks-theme", goDark ? "dark" : "light");
});