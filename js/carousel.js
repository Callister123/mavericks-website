fetch("data/articles.json")
  .then(res => res.json())
  .then(articles => {
    const track = document.getElementById("carousel-track");

    articles.forEach(article => {
      const card = document.createElement("article");
      card.className = "carousel-card";

      card.innerHTML = `
        <img src="${article.image}" alt="${article.title}" class="carousel-img">
        <h3>${article.title}</h3>
        <p>${article.summary}</p>
        <a href="article.html?id=${article.id}" class="read-more">Read More →</a>
      `;

      track.appendChild(card);
    });
  });

  fetch("data/articles.json")
  .then(res => res.json())
  .then(articles => {
    const featured = articles.find(a => a.type === "featured");
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

