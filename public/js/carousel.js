fetch("data/articles.json")
  .then((res) => res.json())
  .then((articles) => {
    const track = document.getElementById("carousel-track");

    // Sort newest → oldest
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    const formatDate = (d) =>
      new Date(d).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

    articles.forEach((article) => {
      const isMatch = article.type === "match-report";

      const card = document.createElement("a");
      card.className = "carousel-card";
      card.href = `article.html?id=${article.id}`;

      card.innerHTML = `
        <img src="${article.image}" alt="" class="carousel-img" loading="lazy">
        <div class="carousel-overlay"></div>
        <span class="article-tag">${article.type.replace("-", " ")}</span>
        ${isMatch ? `<span class="score-badge">${article.score}</span>` : ""}
        <div class="carousel-body">
          <span class="carousel-date">${formatDate(article.date)}</span>
          <h3>${article.title}</h3>
          <p>${isMatch ? article.venue : article.summary}</p>
          <span class="read-more">Read more <i class="fa-solid fa-arrow-right"></i></span>
        </div>
      `;

      track.appendChild(card);
    });

    // Arrow buttons
    const scrollAmount = () => track.querySelector(".carousel-card").offsetWidth + 20;
    document.querySelector(".carousel-btn.prev").addEventListener("click", () =>
      track.scrollBy({ left: -scrollAmount(), behavior: "smooth" })
    );
    document.querySelector(".carousel-btn.next").addEventListener("click", () =>
      track.scrollBy({ left: scrollAmount(), behavior: "smooth" })
    );

    // Featured article (guarded)
    const featured = articles.find((a) => a.type === "featured");
    const container = document.getElementById("featured-article");
    if (featured && container) {
      container.innerHTML = `
        <div class="featured-bg" style="background-image: url('${featured.image}')"></div>
        <div class="featured-content">
          <h2>${featured.title}</h2>
          <p>${featured.summary}</p>
          <a href="article.html?id=${featured.id}" class="featured-btn">Read More</a>
        </div>
      `;
    }
  });