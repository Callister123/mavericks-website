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

// Dark mode only if the visitor chose it; light is the default
document.body.classList.toggle(
  "dark-mode",
  localStorage.getItem("mavericks-theme") === "dark",
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
// Fixtures on phones: tap a row to show time, venue and score
const mobileView = window.matchMedia("(max-width: 700px)");

function toggleFixtureRow(row) {
  const open = row.classList.toggle("open");
  row.setAttribute("aria-expanded", open);
}

// Make rows keyboard/screen-reader friendly whenever the tables are (re)drawn
function enhanceFixtureRows() {
  if (!mobileView.matches) return;
  document
    .querySelectorAll(".fixture-row:not(.header):not(.empty):not([role])")
    .forEach((row) => {
      row.setAttribute("role", "button");
      row.setAttribute("tabindex", "0");
      row.setAttribute("aria-expanded", "false");
    });
}
new MutationObserver(enhanceFixtureRows).observe(document.body, {
  childList: true,
  subtree: true,
});

document.addEventListener("click", (e) => {
  const row = e.target.closest(".fixture-row:not(.header):not(.empty)");
  if (row && mobileView.matches) toggleFixtureRow(row);
});

document.addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && e.target.matches?.(".fixture-row[role='button']")) {
    e.preventDefault();
    toggleFixtureRow(e.target);
  }
});