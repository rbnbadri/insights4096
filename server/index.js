const express = require("express");
const axios = require("axios");
const cors = require("cors");
const ecoData = require("./eco_openings.json").data;
const { fetchGamesInRange } = require("./gameFetcher");

const app = express();
const PORT = 3000;

app.use(cors()); // Enable CORS for all requests

const fs = require("fs");
const archiver = require("archiver");
const path = require("path");

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

// Mapping results to standardized categories
const resultMapping = {
    resigned: "lost",
    win: "win",
    abandoned: "lost",
    timeout: "lost",
    checkmated: "lost",
    timevsinsufficient: "drawn",
    repetition: "drawn",
    agreed: "drawn",
    stalemate: "drawn",
    insufficient: "drawn",
};

function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1),
    );
}

// Extract ECO codes from rapid games
function extractOpenings(games, username) {
    const openings = { white: {}, black: {}, both: {} };
    let rapidCount = 0;

    games.forEach((game) => {
        if (game.time_class === "rapid" && game.pgn) {
            rapidCount++;

            let ecoUrl = null;
            const ecoUrlMatch = game.pgn.match(/\[ECOUrl\s+"(.*?)"\]/);
            if (ecoUrlMatch) {
                ecoUrl = ecoUrlMatch[1];
            }
            const ecoUrlParts = ecoUrl.split("/");
            const lastPart = ecoUrlParts[ecoUrlParts.length - 1];
            const ecoMain = toTitleCase(
                lastPart
                    .split(/[.\d]/)[0]
                    .replace(/-/g, " ")
                    .trim()
                    .toLowerCase(),
            );

            const color =
                game.white.username.toLowerCase() === username.toLowerCase()
                    ? "white"
                    : "black";

            // Extract ECO code from PGN and override if needed
            let ecoCodeString = "NA: NA";
            let ecoUrlString = null;

            try {
                const ecoMatch = game.pgn.match(/\[ECO\s+"([A-E][0-9]{2})"\]/);
                let ecoCode = ecoMatch ? ecoMatch[1] : null;

                // Force override for Scotch Game
                if (ecoMain.includes("Scotch Game")) {
                    ecoCode = "C45";
                }
                ecoUrl = ecoCode;
                if (ecoCode && ecoData[ecoCode] && ecoData[ecoCode].Opening) {
                    ecoCodeString = `${ecoCode}: ${ecoData[ecoCode].Opening}`;
                    ecoUrlString = ecoData[ecoCode].OpeningUrl;
                }
            } catch (err) {
                console.warn("ECO parsing failed:", err.message);
            }

            // Initialize structure if needed
            if (!openings[color][ecoMain]) {
                openings[color][ecoMain] = {
                    played: 0,
                    won: 0,
                    lost: 0,
                    drawn: 0,
                    ecoCode: ecoCodeString,
                    ecoUrl: ecoUrl,
                    ecoUrlString: ecoUrlString,
                };
            }

            if (!openings.both[ecoMain]) {
                openings.both[ecoMain] = {
                    played: 0,
                    won: 0,
                    lost: 0,
                    drawn: 0,
                    ecoCode: ecoCodeString,
                    ecoUrl: ecoUrl,
                    ecoUrlString: ecoUrlString,
                };
            }

            // Update stats
            openings[color][ecoMain].played++;
            openings.both[ecoMain].played++;

            const result = resultMapping[game[color].result] || "unknown";
            if (result === "win") {
                openings[color][ecoMain].won++;
                openings.both[ecoMain].won++;
            } else if (result === "lost") {
                openings[color][ecoMain].lost++;
                openings.both[ecoMain].lost++;
            } else if (result === "drawn") {
                openings[color][ecoMain].drawn++;
                openings.both[ecoMain].drawn++;
            }
        }
    });

    console.log(`Total Rapid Games Processed: ${rapidCount}`);
    return openings;
}

// API Endpoint with optional date range
app.get("/openings/:username", async (req, res) => {
    const username = req.params.username;
    const { start, end } = req.query;

    try {
        let allGames = [];

        if (start && end) {
            console.log(
                `Fetching games for ${username} between ${start} and ${end}`,
            );
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

        const totalGamesPlayed = Object.values(openings.both).reduce(
            (sum, opening) => sum + (opening.played || 0),
            0,
        );

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

let gameCacheStore = {};

app.get("/pgns/:username", async (req, res) => {
    const username = req.params.username;
    const { start, end, color, eco, gameResult } = req.query;

    if (!start || !end || !color || !eco) {
        return res
            .status(400)
            .json({ message: "Missing required parameters." });
    }

    if (!gameCacheStore[username]) {
        return res
            .status(400)
            .json({ message: "Game data not cached. Please search first." });
    }

    const ecos = eco.split(",");
    console.log("Searching for ECOs:", ecos);
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
        console.log(cleanedEcoUrl, cleanedEcoUrl.startsWith(ecos[0]));

        // Match if **any** eco in the ecos array is a prefix of ecoUrlLastPart
        const matchesAnyEco = ecos.includes(cleanedEcoUrl);

        if (!matchesAnyEco) return false;

        // Result match
        if (resultsFilter) {
            const playerResult =
                resultMapping[game[gameColor].result] || "unknown";
            if (!resultsFilter.includes(playerResult)) return false;
        }

        return true;
    });
    if (filteredGames.length === 0) {
        return res.status(404).json({ message: "No matching games found." });
    }

    if (filteredGames.length > 100) {
        return res.status(400).json({
            message: "Too many games to export. Please narrow your filter.",
        });
    }

    const pgnContent = filteredGames.map((g) => g.pgn).join("\n\n");

    if (filteredGames.length <= 50) {
        res.setHeader(
            "Content-disposition",
            `attachment; filename=${username}_games.pgn`,
        );
        res.setHeader("Content-Type", "application/x-chess-pgn");
        return res.send(pgnContent);
    } else {
        const tempPgnPath = path.join(__dirname, `${username}_temp.pgn`);
        fs.writeFileSync(tempPgnPath, pgnContent);

        const archive = archiver("zip", { zlib: { level: 9 } });
        res.setHeader(
            "Content-disposition",
            `attachment; filename=${username}_games.zip`,
        );
        res.setHeader("Content-Type", "application/zip");

        archive.pipe(res);
        archive.file(tempPgnPath, { name: `${username}_games.pgn` });
        archive.finalize();

        archive.on("end", () => {
            fs.unlinkSync(tempPgnPath); // Clean up after sending
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
