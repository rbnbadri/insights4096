const express = require("express");
const axios = require("axios");
const cors = require("cors"); // Import CORS
const ecoData = require("./eco_openings.json").data; // Load ECO mapping

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

// Extract ECO codes from rapid games
function extractOpenings(games, username) {
    const openings = { white: {}, black: {}, both: {} };
    let rapidCount = 0;

    games.forEach((game) => {
        if (game.time_class === "rapid" && game.eco && game.pgn) {
            rapidCount++;

            const ecoUrl = game.eco;
            const ecoUrlParts = ecoUrl.split("/");
            const lastPart = ecoUrlParts[ecoUrlParts.length - 1];
            const ecoMain = lastPart.split(/[.\d]/)[0].replace(/-/g, " ");

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

// API Endpoint
const { fetchGamesInRange } = require("./gameFetcher"); // Import the range fetcher

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
