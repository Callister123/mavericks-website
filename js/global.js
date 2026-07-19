document.addEventListener("DOMContentLoaded", () => {
  // ============================
  // DOM ELEMENTS
  // ============================
  const fixturesList = document.getElementById("fixtures-list");
  const loading = document.getElementById("fixtures-loading");
  const empty = document.getElementById("fixtures-empty");
  const loadMoreBtn = document.getElementById("fixtures-load-more");

  // ============================
  // CONFIG
  // ============================
  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/1th9Gu0HYfY_upaA1MMNW8VyWibYff_Oxf_vUAGzJhY8/export?format=csv";

  const FIXTURES_LIMIT = 5;

  // ============================
  // STATE
  // ============================
  let allFixtures = [];
  let fixturesShown = 0;

  // ============================
  // LOAD CSV FIXTURES
  // ============================
  async function loadFixtures() {
    try {
      const res = await fetch(CSV_URL);
      const csvText = await res.text();

      allFixtures = parseCSV(csvText);

      if (allFixtures.length === 0) {
        loading.style.display = "none";
        empty.style.display = "block";
        return;
      }

      renderFixturesBatch();
    } catch (err) {
      console.error("Error loading fixtures:", err);
      loading.textContent = "Failed to load fixtures.";
    }
  }

  // ============================
  // CSV → FIXTURE OBJECTS
  // ============================
  function parseCSV(csv) {
    const lines = csv.trim().split("\n");

    return lines.slice(1).map((line) => {
      const cols = line.split(",");

      return {
        team: cols[0].trim().toLowerCase(),
        date: cols[1].trim(),
        time: cols[2].trim(),
        home: cols[3].trim(),
        away: cols[4].trim(),
        score: cols[5].trim() || null,
        venue: cols[6].trim(),
      };
    });
  }

  // ============================
  // RENDER FIXTURES IN BATCHES
  // ============================
  function renderFixturesBatch() {
    loading.style.display = "none";

    const remaining = allFixtures.length - fixturesShown;

    if (remaining <= 0) {
      loadMoreBtn.style.display = "none";
      return;
    }

    const batch = allFixtures.slice(
      fixturesShown,
      fixturesShown + FIXTURES_LIMIT
    );

    batch.forEach((fixture) => renderSingleFixture(fixture));

    fixturesShown += batch.length;

    loadMoreBtn.style.display =
      fixturesShown < allFixtures.length ? "block" : "none";
  }

  // ============================
  // RENDER A SINGLE FIXTURE
  // ============================
  function renderSingleFixture(fixture) {
    const li = document.createElement("li");

    // Clean team names (handles weird Google Sheets spaces)
    function clean(str) {
      return str
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/\u00A0/g, " ")
        .trim();
    }

    const homeTeam = clean(fixture.home);
    const awayTeam = clean(fixture.away);

    const isHome = homeTeam.includes("mavericks");
    const isAway = awayTeam.includes("mavericks");

    const hasScore = fixture.score !== null && fixture.score !== "";
    const scoreParts = hasScore ? fixture.score.split("-") : ["", ""];

    let mavericksScore = "";
    let opponentScore = "";

    if (hasScore) {
      if (isHome) {
        mavericksScore = Number(scoreParts[0]);
        opponentScore = Number(scoreParts[1]);
      } else if (isAway) {
        mavericksScore = Number(scoreParts[1]);
        opponentScore = Number(scoreParts[0]);
      }
    }

    let scoreClass = "";
    if (hasScore) {
      if (mavericksScore > opponentScore) scoreClass = "score-win";
      else if (mavericksScore < opponentScore) scoreClass = "score-loss";
      else scoreClass = "score-draw";
    }

    const dateFormatted = new Date(fixture.date).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    li.dataset.team = fixture.team;
    li.dataset.score = hasScore ? fixture.score : "";

    li.innerHTML = `
      <div>
        <div class="fixture-teams">
          <img src="images/icons/${isHome ? "home" : "away"}.svg" class="fixture-icon">
          ${fixture.home} vs ${fixture.away}
        </div>
        <div class="fixture-date">${dateFormatted} • ${fixture.time} • ${fixture.venue}</div>
      </div>

      <div class="fixture-score ${scoreClass}">
        ${hasScore ? fixture.score : "—"}
      </div>
    `;

    fixturesList.appendChild(li);
  }

  // ============================
  // LOAD MORE BUTTON
  // ============================
  loadMoreBtn.addEventListener("click", renderFixturesBatch);

  // ============================
  // FILTERING
  // ============================
  const filterButtons = document.querySelectorAll(".fixtures-filters button");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyFilter(button.dataset.filter);
    });
  });

  function applyFilter(filter) {
    const items = fixturesList.querySelectorAll("li");

    items.forEach((item) => {
      const isCompleted = item.dataset.score !== "";
      const team = item.dataset.team;

      let show = true;

      if (filter === "upcoming" && isCompleted) show = false;
      if (filter === "completed" && !isCompleted) show = false;

      if (
        ["first", "development", "women"].includes(filter) &&
        team !== filter
      ) {
        show = false;
      }

      item.style.display = show ? "flex" : "none";
    });
  }

  // ============================
  // START
  // ============================
  loadFixtures();
});