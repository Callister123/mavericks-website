// Load an HTML partial into an element, then return a promise
async function loadPartial(id, url) {
  const res = await fetch(url);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
}

// Navbar (navbar.js must load after the navbar HTML exists)
loadPartial("navbar", "partials/navbar.html").then(() => {
  const script = document.createElement("script");
  script.src = "js/navbar.js";
  document.body.appendChild(script);
});

// Footer + automatic current year
loadPartial("footer", "partials/footer.html").then(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});