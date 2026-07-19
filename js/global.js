document.addEventListener("DOMContentLoaded", () => {
  const fixturesList = document.getElementById("fixtures-list");
  const loading = document.getElementById("fixtures-loading");
  const empty = document.getElementById("fixtures-empty");

  const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/1th9Gu0HYfY_upaA1MMNW8VyWibYff_Oxf_vUAGzJhY8/gviz/tq?tqx=out:json";

  async function loadFixtures() {
    try {
      const res = await fetch(SHEET_URL);
      const text = await res.text();

      // Google Sheets returns JS, not pure JSON — we extract the JSON part
      const json = JSON.parse(
        text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1),
      );

      const rows = json.table.rows;

      const fixtures = rows.map((row) => {
        return {
          team: row.c[0]?.v || "",
          date: row.c[1]?.v || "",
          time: row.c[2]?.v || "",
          home: row.c[3]?.v || "",
          away: row.c[4]?.v || "",
          score: row.c[5]?.v || null,
          venue: row.c[6]?.v || "",
        };
      });

      renderFixtures(fixtures);
    } catch (err) {
      console.error("Error loading fixtures:", err);
      loading.textContent = "Failed to load fixtures.";
    }
  }

  function renderFixtures(fixtures) {
    loading.style.display = "none";

    if (fixtures.length === 0) {
      empty.style.display = "block";
      return;
    }

    fixtures.forEach((fixture) => {
      const li = document.createElement("li");

      const dateFormatted = new Date(fixture.date).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const isHome = fixture.home === "Mavericks";

      const hasScore = fixture.score !== null && fixture.score !== "";
      const scoreParts = hasScore ? fixture.score.split("-") : ["", ""];

      const mavericksScore = hasScore
        ? isHome
          ? scoreParts[0]
          : scoreParts[1]
        : "";
      const opponentScore = hasScore
        ? isHome
          ? scoreParts[1]
          : scoreParts[0]
        : "";

      let scoreClass = "";
      if (hasScore) {
        if (mavericksScore > opponentScore) scoreClass = "score-win";
        else if (mavericksScore < opponentScore) scoreClass = "score-loss";
        else scoreClass = "score-draw";
      }

      li.dataset.team = fixture.team.toLowerCase();
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
    });
  }

  // Filtering logic
  const filterButtons = document.querySelectorAll(".fixtures-filters button");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      applyFilter(filter);
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
  loadFixtures();
});
