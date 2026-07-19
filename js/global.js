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

      const now = new Date();

      const upcomingFixtures = allFixtures.filter(
        (f) => new Date(f.date) >= now,
      );
      const pastFixtures = allFixtures.filter((f) => new Date(f.date) < now);

      // Sort upcoming (soonest first)
      upcomingFixtures.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Sort past (most recent first)
      pastFixtures.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Store globally if needed later
      window.upcomingFixtures = upcomingFixtures;
      window.pastFixtures = pastFixtures;

      renderFixtures();
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
  function renderFixtures() {
    loading.style.display = "none";
    fixturesList.innerHTML = "";

    // Highlight cards
    renderNextMatchCard();
    renderRecentMatchCard();

    // Remaining fixtures
    const remainingUpcoming = upcomingFixtures.slice(1);
    const remainingPast = pastFixtures.slice(1).reverse(); // oldest → newest

    const remainingFixtures = [...remainingUpcoming, ...remainingPast];

    remainingFixtures.forEach((fixture) => renderSingleFixture(fixture));
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

  function renderNextMatchCard() {
    const card = document.getElementById("next-match-card");

    if (!upcomingFixtures.length) {
      card.innerHTML = "";
      return;
    }

    const next = upcomingFixtures[0];

    const dateFormatted = new Date(next.date).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const homeTeam = next.home.toLowerCase().includes("mavericks");
    const awayTeam = next.away.toLowerCase().includes("mavericks");

    card.innerHTML = `
    <div class="highlight-card">
    
      <div class="highlight-left">
        <div class="fixture-teams">
          <img src="images/icons/${homeTeam ? "home" : "away"}.svg" class="fixture-icon">
          ${next.home} vs ${next.away}
        </div>
        <div class="fixture-date">${dateFormatted} • ${next.time} • ${next.venue}</div>
      </div>
      <div class="highlight-title">Upcoming Match</div>
      <div class="highlight-score upcoming-score">—</div>
    </div>
  `;
  }

  function renderRecentMatchCard() {
    const card = document.getElementById("recent-match-card");

    if (!pastFixtures.length) {
      card.innerHTML = "";
      return;
    }

    const recent = pastFixtures[0];

    const dateFormatted = new Date(recent.date).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const homeTeam = recent.home.toLowerCase().includes("mavericks");
    const awayTeam = recent.away.toLowerCase().includes("mavericks");

    const scoreParts = recent.score.split("-");
    let mScore = homeTeam ? scoreParts[0] : scoreParts[1];
    let oScore = homeTeam ? scoreParts[1] : scoreParts[0];

    let scoreClass = "";
    if (mScore > oScore) scoreClass = "score-win";
    else if (mScore < oScore) scoreClass = "score-loss";
    else scoreClass = "score-draw";

    card.innerHTML = `
    <div class="highlight-card">
      <div class="highlight-left">
        <div class="fixture-teams">
          <img src="images/icons/${homeTeam ? "home" : "away"}.svg" class="fixture-icon">
          ${recent.home} vs ${recent.away}
        </div>
        <div class="fixture-date">${dateFormatted} • ${recent.time} • ${recent.venue}</div>
      </div>
      <div class="highlight-title">Most Recent Result</div>
      <div class="highlight-score ${scoreClass}">
        ${recent.score}
      </div>
    </div>
  `;
  }

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
