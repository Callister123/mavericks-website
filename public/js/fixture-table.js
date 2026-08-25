// ============================
// CONFIG
// ============================
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1th9Gu0HYfY_upaA1MMNW8VyWibYff_Oxf_vUAGzJhY8/export?format=csv";

let allFixtures = [];
let upcomingFixtures = [];
let pastFixtures = [];

// ============================
// PARSE CSV → FIXTURE OBJECTS
// ============================
function parseCSV(csv) {
  const rows = csv.trim().split(/\r?\n/);

  return rows
    .slice(1)
    .map((row) => {
      const cols = row
        .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
        .map((col) => col.replace(/^"|"$/g, "").trim());

      return {
        team: cols[0],
        date: cols[1],
        time: cols[2],
        home: cols[3],
        away: cols[4],
        score: cols[5],
        venue: cols[6],
        type: (cols[7] || "official").toLowerCase(),
      };
    })
    .filter((f) => f.date);
}

// ============================
// FORMAT DATE → "Sun 02 Aug"
// ============================
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

// ============================
// LOAD FIXTURES FROM GOOGLE SHEETS
// ============================
async function loadFixtures() {
  try {
    const res = await fetch(CSV_URL);
    const csvText = await res.text();

    allFixtures = parseCSV(csvText);

    const now = new Date();
    allFixtures.sort((a, b) => new Date(a.date) - new Date(b.date));
    upcomingFixtures = allFixtures.filter((f) => new Date(f.date) >= now);
    pastFixtures = allFixtures.filter((f) => new Date(f.date) < now);

    // Sort upcoming (soonest first)
    upcomingFixtures.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Sort past (most recent first)
    pastFixtures.sort((a, b) => new Date(b.date) - new Date(a.date));

    renderFixturesTable(allFixtures);

    document.querySelector('[data-team="all"]').classList.add("active");
    document.querySelector('[data-type="all"]').classList.add("active");
  } catch (err) {
    console.error("Error loading fixtures:", err);
  }
}

// ============================
// RENDER FIXTURES IN TABLE STYLE
// ============================
function renderFixturesTable(fixtures) {
  const container = document.querySelector(".fixtures-table");
  if (!container) return;

  // Header row
  container.innerHTML = `
    <div class="fixture-row header">
      <div>Date</div>
      <div>Opponent</div>
      <div>Score</div>
      <div>Time</div>
      <div>Venue</div>
    </div>
  `;

  fixtures.forEach((f) => {
    // Determine opponent
    const opponent = f.home.toLowerCase().includes("mavericks")
      ? f.away
      : f.home;

    // Determine type (official/friendly)
    const type = f.type === "friendly" ? "friendly" : "official";

    const row = document.createElement("div");
    row.classList.add("fixture-row", type);

    row.innerHTML = `
      <div>${formatDate(f.date)}</div>
      <div>${opponent}</div>
      <div>${f.score || "TBC"}</div>
      <div>${f.time || "TBC"}</div>
      <div>${f.venue || "TBC"}</div>
    `;

    container.appendChild(row);
  });
}

function applyFilters() {
  const teamFilter =
    document.querySelector(".fixtures-filters button.active[data-team]")
      ?.dataset.team || "all";
  const typeFilter =
    document.querySelector(".fixtures-filters button.active[data-type]")
      ?.dataset.type || "all";

  let filtered = allFixtures;

  if (teamFilter !== "all") {
    filtered = filtered.filter((f) => f.team === teamFilter);
  }

  if (typeFilter !== "all") {
    filtered = filtered.filter((f) => f.type === typeFilter);
  }

  renderFixturesTable(filtered);
}
document.addEventListener("click", (e) => {
  if (!e.target.matches(".fixtures-filters button")) return;

  const isTeamButton = e.target.dataset.team !== undefined;
  const isTypeButton = e.target.dataset.type !== undefined;

  // TEAM FILTER BUTTONS
  if (isTeamButton) {
    document
      .querySelectorAll(".fixtures-filters button[data-team]")
      .forEach((btn) => btn.classList.remove("active"));

    e.target.classList.add("active");
  }

  // TYPE FILTER BUTTONS
  if (isTypeButton) {
    document
      .querySelectorAll(".fixtures-filters button[data-type]")
      .forEach((btn) => btn.classList.remove("active"));

    e.target.classList.add("active");
  }

  applyFilters();
});
document.addEventListener("DOMContentLoaded", loadFixtures);

row.classList.add("removing");
setTimeout(() => row.remove(), 250);
