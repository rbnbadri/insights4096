const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { resultMapping } = require("./utils");
const { logAction } = require("./logger");
const { sendResponse } = require("./responseUtils");

// Also add fetchGames if you still use the manual month-by-month fetching
function setupPgnDownloadRoute(app, gameCacheStore) {
  app.get("/pgns/:username", async (req, res) => {
    const username = req.params.username;
    const { start, end, color, eco, gameResult, checkOnly, source } = req.query;

    if (!start || !end || !color || !eco) {
      return sendResponse(
        req,
        res,
        400,
        "bad_request",
        {
          message: "Incomplete query parameters in the API request.",
        },
        {
          route: "/pgns/:username",
          reason: "Missing start, end, color or eco",
        },
      );
    }

    if (!gameCacheStore[username]) {
      return sendResponse(
        req,
        res,
        400,
        "bad_request",
        {
          message: "Game data not cached. Please search first.",
        },
        {
          route: "/pgns/:username",
          reason: "No cached data",
        },
      );
    }

    const ecos = eco.split(",").map((e) => e.replace(/-/g, " "));
    const resultsFilter = gameResult ? gameResult.split(",") : null;

    const allGames = gameCacheStore[username];

    const filteredGames = allGames.filter((game) => {
      if (!game.pgn || game.time_class !== "rapid") return false;

      // Color match
      const gameColor =
        game.white.username.toLowerCase() === username.toLowerCase()
          ? "white"
          : "black";
      if (gameColor !== color) return false;

      const matchesAnyEco = ecos.includes(game.ecoDisplayName);

      if (!matchesAnyEco) return false;

      // Result match
      if (resultsFilter) {
        const playerResult = resultMapping[game[gameColor].result] || "unknown";
        if (!resultsFilter.includes(playerResult)) return false;
      }

      return true;
    });

    if (filteredGames.length > 100) {
      return sendResponse(
        req,
        res,
        400,
        "too_many_games",
        {
          message: "Too many games to export. Please narrow your filter.",
        },
        {
          route: "/pgns/:username",
          reason: "More than 100 games matched",
        },
      );
    }

    const pgnContent = filteredGames.map((g) => g.pgn).join("\n\n");
    let newFilename =
      ecos.length === 1
        ? `${username}_${color}_${eco}`
        : `${username}_${color}_multiple_ecos`;

    if (resultsFilter) newFilename += `_${resultsFilter.join("_")}`;
    const compressed = filteredGames.length > 50;
    newFilename += compressed ? ".zip" : ".pgn";

    if (filteredGames.length === 0) {
      return sendResponse(
        req,
        res,
        404,
        "not_found",
        {
          message: "No matching games found for the given filters.",
        },
        {
          route: "/pgns/:username",
          reason: "Filtered list was empty",
        },
      );
    }

    if (checkOnly) {
      return sendResponse(
        req,
        res,
        200,
        "download_check_only",
        {
          status: "ready",
          gameCount: filteredGames.length,
          filename: newFilename,
        },
        {
          username,
          color,
          source: source || "unspecified",
          eco,
          result: gameResult || "all",
        },
      );
    }

    logAction(req, "download_pgn", {
      username,
      color,
      source: source || "unspecified",
      eco,
      result: gameResult || "all",
      count: filteredGames.length,
    });

    if (filteredGames.length <= 50) {
      res.setHeader(
        "Content-disposition",
        `attachment; filename=${newFilename}`,
      );
      res.setHeader("Content-Type", "application/x-chess-pgn");
      return res.send(pgnContent);
    } else {
      const tempPgnPath = path.join(__dirname, `${username}_temp.pgn`);
      fs.writeFileSync(tempPgnPath, pgnContent);

      const archive = archiver("zip", { zlib: { level: 9 } });
      res.setHeader(
        "Content-disposition",
        `attachment; filename=${newFilename}`,
      );
      res.setHeader("Content-Type", "application/zip");

      archive.pipe(res);
      archive.file(tempPgnPath, { name: `${newFilename}.pgn` });
      archive.finalize();

      archive.on("end", () => {
        fs.unlinkSync(tempPgnPath); // Clean up after sending
      });
    }
  });
}

module.exports = { setupPgnDownloadRoute };
