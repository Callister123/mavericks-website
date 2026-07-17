document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".mobile-menu-toggle");
  const nav = document.querySelector(".main-nav");

  toggleBtn.addEventListener("click", () => {
    nav.classList.toggle("active");
    toggleBtn.classList.toggle("active");
  });

  const dropdowns = document.querySelectorAll(".dropdown");

  dropdowns.forEach(drop => {
    const toggle = drop.querySelector(".dropdown-toggle");

    toggle.addEventListener("click", (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        drop.classList.toggle("active");
      }
    });
  });
});
