fetch("data/articles.json")
  .then((res) => res.json())
  .then((articles) => {
    const track = document.getElementById("carousel-track");

    // Sort newest → oldest
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    articles.forEach((article) => {
      const card = document.createElement("article");
      card.className = "carousel-card";

      // Announcement layout
      if (article.type === "announcement") {
        card.innerHTML = `
        <div class="card-top">
          <img src="${article.image}" alt="${article.title}" class="carousel-img">
          <h3>${article.title}</h3>
          <p>${article.summary}</p>
        </div>

        <div class="card-bottom">
          <span class="article-tag">${article.type.replace("-", " ")}</span>
          <a href="article.html?id=${article.id}" class="read-more">Read More →</a>
        </div>
        `;
      }
      // Match report layout
      else if (article.type === "match-report") {
        card.innerHTML = `
        <div class="card-top">
          <img src="${article.image}" alt="${article.title}" class="carousel-img">
          <h3>${article.title}</h3>
          <p><strong>Score:</strong> ${article.score}</p>
          <p><strong>Venue:</strong> ${article.venue}</p>
        </div>

        <div class="card-bottom">
          <span class="article-tag">${article.type.replace("-", " ")}</span>
          <a href="article.html?id=${article.id}" class="read-more">Read More →</a>
        </div>
        `;
      }
      // Fallback layout
      else {
        card.innerHTML = `
        <div class="card-top">
          <img src="${article.image}" alt="${article.title}" class="carousel-img">
          <h3>${article.title}</h3>
          <p>${article.summary}</p>
        </div>

        <div class="card-bottom">
          <span class="article-tag">${article.type.replace("-", " ")}</span>
          <a href="article.html?id=${article.id}" class="read-more">Read More →</a>
        </div>
        `;
      }

      track.appendChild(card);
    });
  });

fetch("data/articles.json")
  .then((res) => res.json())
  .then((articles) => {
    const featured = articles.find((a) => a.type === "featured");
    const container = document.getElementById("featured-article");

    container.innerHTML = `
      <div class="featured-bg" style="background-image: url('${featured.image}')"></div>
      <div class="featured-content">
        <h2>${featured.title}</h2>
        <p>${featured.summary}</p>
        <a href="article.html?id=${featured.id}" class="featured-btn">Read More</a>
      </div>
    `;
  });
