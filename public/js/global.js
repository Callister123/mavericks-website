// Load an HTML partial into an element. Resolves true on success.
async function loadPartial(id, url) {
  const target = document.getElementById(id);
  if (!target) return false;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    target.innerHTML = await res.text();
    return true;
  } catch (err) {
    console.error(`Could not load ${url}:`, err);
    return false;
  }
}

// Apply the saved theme straight away (default dark) to avoid a flash
document.body.classList.toggle(
  "dark-mode",
  (localStorage.getItem("theme") || "dark") === "dark",
);

// Mark the link for the current page as active
function markActiveLink() {
  let page = location.pathname.split("/").pop() || "index.html";
  if (!page.includes(".")) page += ".html"; // hosts that hide ".html"
  document.querySelectorAll(".main-nav a").forEach((link) => {
    if (link.getAttribute("href") === page) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
}

// Navbar (navbar.js must load after the navbar HTML exists)
loadPartial("navbar", "partials/navbar.html").then((ok) => {
  if (!ok) return;
  markActiveLink();
  const script = document.createElement("script");
  script.src = "js/navbar.js";
  document.body.appendChild(script);
});

// Footer + automatic current year
loadPartial("footer", "partials/footer.html").then((ok) => {
  if (!ok) return;
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});