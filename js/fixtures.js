document.addEventListener("DOMContentLoaded", () => {
  const fixturesList = document.getElementById("fixtures-list");
  const loading = document.getElementById("fixtures-loading");
  const empty = document.getElementById("fixtures-empty");

  // Fixtures data
  const fixtures = [
    { date: "2026-07-20", time: "19:30", home: "Mavericks", away: "Oxford Futsal", score: "3-1", team: "first" },
    { date: "2026-07-27", time: "18:00", home: "Cambridge United", away: "Mavericks", score: "2-2", team: "development" },
    { date: "2026-08-02", time: "20:15", home: "Mavericks", away: "Bedford Futsal", score: "1-4", team: "women" },
    { date: "2026-08-10", time: "19:00", home: "Mavericks", away: "London Futsal", score: null, team: "first" }
  ];

  // Simulate loading delay
  setTimeout(() => {
    loading.style.display = "none";

    if (fixtures.length === 0) {
      empty.style.display = "block";
      return;
    }

    fixtures.forEach(fixture => {
      const li = document.createElement("li");

      // Format date
      const dateFormatted = new Date(fixture.date).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      });

      const isHome = fixture.home === "Mavericks";

      // Handle null score safely
      const hasScore = fixture.score !== null && fixture.score !== "";
      const scoreParts = hasScore ? fixture.score.split("-") : ["", ""];

      const mavericksScore = hasScore ? (isHome ? scoreParts[0] : scoreParts[1]) : "";
      const opponentScore = hasScore ? (isHome ? scoreParts[1] : scoreParts[0]) : "";

      let scoreClass = "";
      if (hasScore) {
        if (mavericksScore > opponentScore) scoreClass = "score-win";
        else if (mavericksScore < opponentScore) scoreClass = "score-loss";
        else scoreClass = "score-draw";
      }

      // Add filter metadata
      li.dataset.team = fixture.team;
      li.dataset.score = hasScore ? fixture.score : "";

      // Render fixture
      li.innerHTML = `
        <div>
          <div class="fixture-teams">
            <img src="images/icons/${isHome ? "home" : "away"}.svg" class="fixture-icon">
            ${fixture.home} vs ${fixture.away}
          </div>
          <div class="fixture-date">${dateFormatted} • ${fixture.time}</div>
        </div>

        <div class="fixture-score ${scoreClass}">
          ${hasScore ? fixture.score : "—"}
        </div>
      `;

      fixturesList.appendChild(li);
    });
  }, 1000);

  // Filtering logic
  const filterButtons = document.querySelectorAll(".fixtures-filters button");

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      applyFilter(filter);
    });
  });

  function applyFilter(filter) {
    const items = fixturesList.querySelectorAll("li");

    items.forEach(item => {
      const isCompleted = item.dataset.score !== "";
      const team = item.dataset.team;

      let show = true;

      if (filter === "upcoming" && isCompleted) show = false;
      if (filter === "completed" && !isCompleted) show = false;

      if (["first", "development", "women"].includes(filter) && team !== filter) {
        show = false;
      }

      item.style.display = show ? "flex" : "none";
    });
  }
});
