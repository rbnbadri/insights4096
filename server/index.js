const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

if (fs.existsSync(".env.development.local")) {
  dotenv.config({ path: ".env.development.local", override: true });
}

const express = require("express");
const cors = require("cors");
const { setupPgnDownloadRoute } = require("./routes/pgnDownloader");
const { fetchGamesInRange } = require("./gameFetcher");
const { extractOpenings } = require("./openingsParser");
const app = express();
const PORT = 3000;
const { logAction } = require("./logger");
const { sendResponse } = require("./responseUtils");
const logsRouter = require("./routes/logs");

app.use("/logs", logsRouter);
app.use(cors()); // Enable CORS for all requests

app.get("/openings/:username", async (req, res) => {
  const username = req.params.username;
  const { start, end, source } = req.query;

  try {
    let allGames = [];

    let resolvedStart = start;
    let resolvedEnd = end;

    if (!start && !end) {
      const today = new Date();
      const endDate = today.toISOString().split("T")[0]; // yyyy-mm-dd
      const startDateObj = new Date(today);
      startDateObj.setDate(today.getDate() - 30);
      const startDate = startDateObj.toISOString().split("T")[0];

      resolvedStart = startDate;
      resolvedEnd = endDate;
    }

    allGames = await fetchGamesInRange(username, resolvedStart, resolvedEnd);

    logAction(req, "fetch_openings", {
      username,
      source: source || "unspecified",
      resolvedStart,
      resolvedEnd,
    });

    gameCacheStore[username] = allGames;
    const openings = extractOpenings(allGames, username);

    const totalGamesPlayed =
      Object.values(openings.white).reduce((sum, o) => sum + o.played, 0) +
      Object.values(openings.black).reduce((sum, o) => sum + o.played, 0);

    return sendResponse(
      req,
      res,
      200,
      "openings_processed",
      {
        status: "success",
        timestamp: new Date().toISOString(),
        count: totalGamesPlayed,
        data: openings,
      },
      {
        username,
        count: totalGamesPlayed,
      },
    );
  } catch (err) {
    return sendResponse(
      req,
      res,
      500,
      "error",
      {
        status: "error",
        message: err.message,
      },
      {
        route: "/api/openings",
        error: err.message,
      },
    );
  }
});

// API Endpoint with optional date range
let gameCacheStore = {};
setupPgnDownloadRoute(app, gameCacheStore);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
