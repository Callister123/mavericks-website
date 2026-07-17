document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".mobile-menu-toggle");
  const nav = document.querySelector(".main-nav");

  toggleBtn.addEventListener("click", () => {
    nav.classList.toggle("open");
    toggleBtn.classList.toggle("open");
  });

  // Mobile dropdowns
  document.querySelectorAll(".dropdown").forEach(drop => {
    const btn = drop.querySelector(".dropdown-toggle");

    btn.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        drop.classList.toggle("open");
      }
    });
  });
});