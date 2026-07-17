fetch("articles.json")
  .then((res) => res.json())
  .then((articles) => {
    const carousel = document.querySelector(".carousel");

    articles.forEach((article) => {
      const card = document.createElement("div");
      card.classList.add("carousel-card");

      card.innerHTML = `
        <img src="${article.image}" alt="${article.title}">
        <h3>${article.title}</h3>
        <p>${article.summary}</p>
        <a href="article.html?id=${article.id}" class="carousel-link">Read More</a>
      `;

      carousel.appendChild(card);
    });
  });
