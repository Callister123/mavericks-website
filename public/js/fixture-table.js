// ============================
// CONFIG
// ============================
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1th9Gu0HYfY_upaA1MMNW8VyWibYff_Oxf_vUAGzJhY8/export?format=csv";
let allFixtures = [];
let upcomingFixtures = [];
let pastFixtures = [];
let currentPage = 1;
const FIXTURES_PER_PAGE = 10;

// How scores are written in the Google Sheet:
//   "home-away"   -> 2-5 means home team 2, away team 5 (usual way)
//   "ours-theirs" -> 2-5 means Mavericks 2, opponent 5
const SCORE_ORDER = "home-away";

const RESULT_LABELS = { w: "Win", d: "Draw", l: "Loss" };

// Escape text from the sheet before putting it into the page
function esc(text) {
  const el = document.createElement("div");
  el.textContent = text ?? "";
  return el.innerHTML;
}

// Work out W / D / L for a fixture, or null if there is no numeric score yet
function getResult(f) {
  const m = /^(\d+)\s*[-\u2013:]\s*(\d+)$/.exec((f.score || "").trim());
  if (!m) return null;
  const first = Number(m[1]);
  const second = Number(m[2]);
  let ours = first;
  let theirs = second;
  if (SCORE_ORDER === "home-away" && !f.home.toLowerCase().includes("mavericks")) {
    ours = second;
    theirs = first;
  }
  return ours > theirs ? "w" : ours < theirs ? "l" : "d";
}

// ============================
// FORM GUIDE: last 5 official results per team
// ============================
const TEAM_LABELS = {
  first: "First Team",
  women: "Women's Team",
  development: "Development",
  "handball-mens": "Handball Men's",
  "handball-womens": "Handball Women's",
  handball: "Handball",
};
const FORM_LENGTH = 5;

function teamLabel(team) {
  return TEAM_LABELS[team] || team.charAt(0).toUpperCase() + team.slice(1);
}

function renderFormGuide(teamFilter = "all") {
  const box = document.getElementById("form-guide");
  if (!box) return;

  // Official games with a numeric score, oldest first
  const played = allFixtures.filter(
    (f) => f.type === "official" && f.team && getResult(f),
  );
  const teams = [...new Set(played.map((f) => f.team))].sort((a, b) => {
    const order = Object.keys(TEAM_LABELS);
    const ia = order.indexOf(a) === -1 ? 99 : order.indexOf(a);
    const ib = order.indexOf(b) === -1 ? 99 : order.indexOf(b);
    return ia - ib;
  });

  const visible = teams.filter((t) => matchesTeam(t, teamFilter));

  box.innerHTML = visible
    .map((team) => {
      const last = played.filter((f) => f.team === team).slice(-FORM_LENGTH);
      const dots = last.map((f) => {
        const r = getResult(f);
        const opponent = f.home.toLowerCase().includes("mavericks") ? f.away : f.home;
        const tip = `${RESULT_LABELS[r]} vs ${opponent} (${f.score})`;
        return `<span class="form-dot form-dot-${r}" title="${esc(tip)}"></span>`;
      });
      while (dots.length < FORM_LENGTH) dots.unshift('<span class="form-dot form-dot-empty"></span>');
      const summary = last.map((f) => RESULT_LABELS[getResult(f)]).join(", ");
      return `
        <div class="form-team" role="img" aria-label="${esc(teamLabel(team))} last ${last.length} official results, oldest to newest: ${esc(summary)}">
          <span class="form-name">${esc(teamLabel(team))}</span>
          <span class="form-dots">${dots.join("")}</span>
        </div>`;
    })
    .join("");
}

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
        team: (cols[0] || "").toLowerCase(),
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
    renderFormGuide();
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

  // Apply pagination
  const paginated = paginate(fixtures);

  // Header row
  container.innerHTML = `
    <div class="fixture-row header">
      <div>Date</div>
      <div>Opponent</div>
      <div>Time</div>
      <div>Venue</div>
      <div>Score</div>
    </div>
  `;

  paginated.forEach((f) => {
    const opponent = f.home.toLowerCase().includes("mavericks")
      ? f.away
      : f.home;

    const type = f.type === "friendly" ? "friendly" : "official";

    const row = document.createElement("div");
    row.classList.add("fixture-row", type);

    const result = getResult(f);
    const badge = result
      ? `<span class="result result-${result}" title="${RESULT_LABELS[result]}" aria-label="${RESULT_LABELS[result]}">${result.toUpperCase()}</span>`
      : "";

    row.innerHTML = `
      <div>${esc(formatDate(f.date))}</div>
      <div>${esc(opponent)}</div>
      <div>${esc(f.time || "TBC")}</div>
      <div>${esc(f.venue || "TBC")}</div>
      <div class="score-cell">${badge}<span>${esc(f.score || "TBC")}</span></div>
    `;

    container.appendChild(row);
  });

  updatePaginationControls(fixtures.length);
}

function paginate(fixtures) {
  const start = (currentPage - 1) * FIXTURES_PER_PAGE;
  const end = start + FIXTURES_PER_PAGE;
  return fixtures.slice(start, end);
}

function updatePaginationControls(totalFixtures) {
  const totalPages = Math.ceil(totalFixtures / FIXTURES_PER_PAGE);

  document.getElementById("page-info").textContent =
    `Page ${currentPage} of ${totalPages}`;

  document.getElementById("prev-page").disabled = currentPage === 1;
  document.getElementById("next-page").disabled = currentPage === totalPages;
}

// Does a fixture's team match the chosen team filter?
// "handball" = every handball team; anything else must match exactly.
function matchesTeam(team, filter) {
  if (filter === "all") return true;
  if (filter === "handball") return team.includes("handball");
  return team === filter;
}

function applyFilters() {
  const teamFilter = document.getElementById("team-filter")?.value || "all";
  const typeFilter = document.getElementById("type-filter")?.value || "all";

  const filtered = allFixtures.filter(
    (f) =>
      matchesTeam(f.team, teamFilter) &&
      (typeFilter === "all" || f.type === typeFilter),
  );

  renderFixturesTable(filtered);
  renderFormGuide(teamFilter);
}

document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    applyFilters();
  }
});

document.getElementById("next-page").addEventListener("click", () => {
  currentPage++;
  applyFilters();
});

["team-filter", "type-filter"].forEach((id) => {
  document.getElementById(id)?.addEventListener("change", () => {
    currentPage = 1;
    applyFilters();
  });
});
document.addEventListener("DOMContentLoaded", loadFixtures);
