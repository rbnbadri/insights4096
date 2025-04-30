const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { resultMapping } = require("./utils");

// Also add fetchGames if you still use the manual month-by-month fetching
function setupPgnDownloadRoute(app, gameCacheStore) {
  app.get("/pgns/:username", async (req, res) => {
    const username = req.params.username;
    const { start, end, color, eco, gameResult, checkOnly } = req.query;

    if (!start || !end || !color || !eco) {
      return res
        .status(404)
        .json({ message: "No matching games found for the given filters." });
    }

    if (!gameCacheStore[username]) {
      return res
        .status(400)
        .json({ message: "Game data not cached. Please search first." });
    }

    const ecos = eco.split(",");
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

      // ECO match
      const ecoUrlMatch = game.pgn.match(/\[ECOUrl\s+"(.*?)"\]/);
      if (!ecoUrlMatch) return false;

      const ecoUrlLastPart = ecoUrlMatch[1].split("/").pop();
      const cleanedEcoUrl = ecoUrlLastPart
        .split(/[.\d]/)[0]
        .replace(/-+$/, "")
        .trim();

      // Match if **any** eco in the ecos array is a prefix of ecoUrlLastPart
      const matchesAnyEco = ecos.includes(cleanedEcoUrl);

      if (!matchesAnyEco) return false;

      // Result match
      if (resultsFilter) {
        const playerResult = resultMapping[game[gameColor].result] || "unknown";
        if (!resultsFilter.includes(playerResult)) return false;
      }

      return true;
    });

    if (filteredGames.length > 100) {
      return res.status(400).json({
        message: "Too many games to export. Please narrow your filter.",
      });
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
      return res
        .status(404)
        .json({ message: "No matching games found for the given filters." });
    }

    if (checkOnly) {
      return res.status(200).json({
        status: "ready",
        gameCount: filteredGames.length,
        filename: newFilename,
      });
    }

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
