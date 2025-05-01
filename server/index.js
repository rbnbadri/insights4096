const express = require("express");
const cors = require("cors");
const { setupPgnDownloadRoute } = require("./pgnDownloader");
const { fetchGamesInRange } = require("./gameFetcher");
const axios = require("axios");
const { extractOpenings } = require("./openingsParser");
const app = express();
const PORT = 3000;

app.use(cors()); // Enable CORS for all requests

// Function to fetch games for a specific month with proper zero-padding
async function fetchGames(username, year, month) {
  try {
    const formattedMonth = month.toString().padStart(2, "0"); // Ensure MM format
    const url = `https://api.chess.com/pub/player/${username}/games/${year}/${formattedMonth}`;
    const response = await axios.get(url);
    console.info(url);
    console.log(
      `Fetched ${response.data.games.length} games for ${username} in ${year}-${formattedMonth}`,
    );
    return response.data.games || [];
  } catch (error) {
    console.error(`Error fetching games for ${month}/${year}:`, error);
    return [];
  }
}

app.get("/openings/:username", async (req, res) => {
  const username = req.params.username;
  const { start, end } = req.query;

  try {
    let allGames = [];

    if (start && end) {
      allGames = await fetchGamesInRange(username, start, end);
    } else {
      // Default to hardcoded Jan-Mar 2025
      const year = 2025;
      const months = [1, 2, 3];
      for (const month of months) {
        const games = await fetchGames(username, year, month);
        allGames = allGames.concat(games);
      }
    }

    gameCacheStore[username] = allGames;
    const openings = extractOpenings(allGames, username);

    const totalGamesPlayed =
      Object.values(openings.white).reduce((sum, o) => sum + o.played, 0) +
      Object.values(openings.black).reduce((sum, o) => sum + o.played, 0);

    res.json({
      status: "success",
      timestamp: new Date().toISOString(),
      count: totalGamesPlayed,
      data: openings,
    });
  } catch (err) {
    console.error("Error processing request:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// API Endpoint with optional date range
let gameCacheStore = {};
setupPgnDownloadRoute(app, gameCacheStore);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
