// Your backend URL
const BASE_URL = "https://mkmavs-backend-production.up.railway.app"; // replace this

async function loadFixtures(team) {
  const res = await fetch(`${BASE_URL}/fixtures/${team}`);
  return await res.json();
}

function renderFixtures(fixtures, title) {
  const list = document.getElementById("fixtures-list");

  // Add a heading for each team
  const heading = document.createElement("h3");
  heading.textContent = title;
  list.appendChild(heading);

  fixtures.forEach(f => {
    const li = document.createElement("li");
    li.className = "fixture-item";

    li.innerHTML = `
      <strong>${f.Date}</strong><br>
      ${f.Home} vs ${f.Away}<br>
      Score: ${f.Score || "TBD"}<br>
      Venue: ${f.Venue}
    `;

    list.appendChild(li);
  });
}

async function init() {
  const first = await loadFixtures("first");
  const second = await loadFixtures("second");
  const womens = await loadFixtures("womens");

  renderFixtures(first, "First Team");
  renderFixtures(second, "Second Team");
  renderFixtures(womens, "Women's Team");
}

init();
