const express = require("express");
const fs = require("fs");
const session = require("express-session");
const authenticate = require("./auth");

const app = express();
app.use(express.json());
app.use(session({ secret: "mavericks-secret", resave: false, saveUninitialized: true }));

app.post("/api/articles", authenticate, (req, res) => {
  const path = "./data/articles.json";
  const articles = JSON.parse(fs.readFileSync(path));

  const newArticle = {
    id: Date.now() + "_" + req.body.title,
    title: req.body.title,
    tag: req.body.tag,
    image: req.body.image,
    summary: req.body.summary,
    content: req.body.content,
    date: new Date().toISOString()
  };

  articles.push(newArticle);
  fs.writeFileSync(path, JSON.stringify(articles, null, 2));

  res.json({ success: true, article: newArticle });
});

app.listen(3000, () => console.log("Backend running"));
