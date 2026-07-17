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

function applyTheme(mode) {
  document.body.classList.toggle("light-mode", mode === "light");
  localStorage.setItem("theme", mode);
}

themeBtn.addEventListener("click", () => {
  const current = localStorage.getItem("theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
});

// Load saved theme
applyTheme(localStorage.getItem("theme") || "dark");
