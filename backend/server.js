import express from "express";
import fetch from "node-fetch";
import { load } from "cheerio";
import cors from "cors";

const app = express();
app.use(cors());

const MATCHHUB_URL =
  "https://nfs.leaguerepublic.com/matchHub/750699627/-1_-1/438857189/-1/-1/-1/2/true.html";

async function scrapeFixtures() {
  const response = await fetch(MATCHHUB_URL);
  const html = await response.text();
  const $ = cheerio.load(html);

  const fixtures = [];

  $(".matchHubRow").each((i, el) => {
    const date = $(el).find(".matchDate").text().trim();
    const teams = $(el).find(".matchTeams").text().trim();
    const score = $(el).find(".matchScore").text().trim();

    fixtures.push({ date, teams, score });
  });

  return fixtures;
}

app.get("/fixtures", async (req, res) => {
  try {
    const fixtures = await scrapeFixtures();
    res.json(fixtures);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch fixtures" });
  }
});

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
