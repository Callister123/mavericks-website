
// Fills <div id="team-page" data-team="first"></div> with the team's details
// and its fixtures/results from the Google Sheet.

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1th9Gu0HYfY_upaA1MMNW8VyWibYff_Oxf_vUAGzJhY8/export?format=csv";
const SCORE_ORDER = "home-away"; // keep the same as in fixture-table.js
const FORM_LENGTH = 5;
const RESULT = { w: "Win", d: "Draw", l: "Loss" };

// ============================
// (the key must match the team name used in the Google Sheet)
// Add a day to "when" if you like, e.g. "Tuesdays, 9-10pm"
// ============================
const TEAMS = {
  first: {
    training: [
      { when: "Wednesday 9-10pm", where: "Cottesloe Sports Hall" },
      { when: "Fridays, 7-8pm", where: "Cottesloe Sports Hall", note: "extra session" },
    ],
    home: "Cranfield University Sports Hall",
  },
  development: {
    training: [{ when: "Wednesday 8-9pm", where: "Cottesloe Sports Hall" }],
    home: "Bedford University Sports Hall",
  },
  women: {
    training: [{ when: "Monday 7:30-9pm", where: "Goldington Academy" }],
    home: "Bedford University Sports Hall",
  },
  youth: { training: [], home: "" },
};

// ---------- helpers ----------
function esc(text) {
  const el = document.createElement("div");
  el.textContent = text ?? "";
  return el.innerHTML;
}

function parseCSV(csv) {
  return csv
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((row) => {
      const c = row
        .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
        .map((col) => col.replace(/^"|"$/g, "").trim());
      return {
        team: (c[0] || "").toLowerCase(),
        date: c[1],
        time: c[2],
        home: c[3] || "",
        away: c[4] || "",
        score: c[5],
        venue: c[6],
        type: (c[7] || "official").toLowerCase(),
      };
    })
    .filter((f) => f.date);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function getResult(f) {
  const m = /^(\d+)\s*[-\u2013:]\s*(\d+)$/.exec((f.score || "").trim());
  if (!m) return null;
  let ours = Number(m[1]);
  let theirs = Number(m[2]);
  if (SCORE_ORDER === "home-away" && !f.home.toLowerCase().includes("mavericks")) {
    [ours, theirs] = [theirs, ours];
  }
  return ours > theirs ? "w" : ours < theirs ? "l" : "d";
}

// ---------- pieces of the page ----------
function factsHTML(team) {
  const t = TEAMS[team] || { training: [], home: "" };
  const training = t.training.length
    ? t.training
        .map(
          (s) =>
            `<li>${s.when ? `<strong>${esc(s.when)}</strong> at ` : ""}${esc(s.where)}${
              s.note ? ` (${esc(s.note)})` : ""
            }</li>`,
        )
        .join("")
    : "<li>Get in touch for session details.</li>";

  return `
    <section class="band band-base facts">
      <div class="band-inner">
        <div class="section-head"><h2>Training and matches</h2></div>
        <div class="facts-split">
          <div class="facts-info">
            <h3>Training</h3>
            <ul>${training}</ul>
            ${
              t.home
                ? `<h3>Home matches</h3><ul><li>${esc(t.home)}</li></ul>`
                : ""
            }
          </div>
          <div class="facts-cta">
            <h3>Want to play?</h3>
            <p>New players are always welcome. Come and join us.</p>
            <a href="join.html" class="btn btn-red">Join this team</a>
          </div>
        </div>
      </div>
    </section>`;
}

function rowHTML(f) {
  const opponent = f.home.toLowerCase().includes("mavericks") ? f.away : f.home;
  const r = getResult(f);
  const badge = r
    ? `<span class="result result-${r}" title="${RESULT[r]}" aria-label="${RESULT[r]}">${r.toUpperCase()}</span>`
    : "";
  return `
    <div class="fixture-row ${f.type === "friendly" ? "friendly" : "official"}">
      <div>${esc(formatDate(f.date))}</div>
      <div>${esc(opponent)}</div>
      <div>${esc(f.time || "TBC")}</div>
      <div>${esc(f.venue || "TBC")}</div>
      <div class="score-cell">${badge}<span>${esc(f.score || "-")}</span></div>
    </div>`;
}

const TABLE_HEAD = `
  <div class="fixture-row header">
    <div>Date</div><div>Opponent</div><div>Time</div><div>Venue</div><div>Score</div>
  </div>`;

function table(rows) {
  return `<div class="fixtures-table">${TABLE_HEAD}${rows.map(rowHTML).join("")}</div>`;
}

function fixturesHTML(mine) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const byDate = (a, b) => new Date(a.date) - new Date(b.date);

  const upcoming = mine
    .filter((f) => !getResult(f) && new Date(f.date) >= today)
    .sort(byDate)
    .slice(0, 3);
  const played = mine.filter((f) => getResult(f)).sort(byDate);
  const recent = played.slice(-5).reverse();
  const form = played.filter((f) => f.type === "official").slice(-FORM_LENGTH);

  if (!upcoming.length && !recent.length) return "";

  const dots = form
    .map((f) => {
      const r = getResult(f);
      return `<span class="form-dot form-dot-${r}" title="${RESULT[r]} (${esc(f.score)})"></span>`;
    })
    .join("");

  return `
    <section class="band band-base team-fixtures">
      <div class="band-inner">
        <div class="section-head">
          <h2>Fixtures and results</h2>
          <a href="index.html#fixtures" class="section-link">All fixtures</a>
        </div>
        ${
          form.length
            ? `<div class="form-team"><span class="form-name">Form</span><span class="form-dots">${dots}</span></div>
               <p class="form-caption">Last ${form.length} official results, oldest to newest</p>`
            : ""
        }
        ${upcoming.length ? `<h3>Next fixtures</h3>${table(upcoming)}` : ""}
        ${recent.length ? `<h3>Recent results</h3>${table(recent)}` : ""}
      </div>
    </section>`;
}

// ---------- start ----------
async function initTeamPage() {
  const root = document.getElementById("team-page");
  if (!root) return;
  const team = (root.dataset.team || "").toLowerCase();

  root.innerHTML = factsHTML(team); // shows straight away

  try {
    const res = await fetch(CSV_URL);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const mine = parseCSV(await res.text()).filter((f) => f.team === team);
    root.insertAdjacentHTML("beforeend", fixturesHTML(mine));
  } catch (err) {
    console.error("Could not load fixtures:", err);
  }
}

document.addEventListener("DOMContentLoaded", initTeamPage);