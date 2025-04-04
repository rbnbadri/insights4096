const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("client/build")); // Serve React frontend build from client/build

// Function to fetch games for a specific month
async function fetchGames(username, year, month) {
    try {
        const formattedMonth = month.toString().padStart(2, "0");
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
        if (game.time_class === "rapid" && game.eco) {
            rapidCount++;

            const ecoUrlParts = game.eco.split("/");
            const lastPart = ecoUrlParts[ecoUrlParts.length - 1];
            const ecoMain = lastPart.split(/[.\d]/)[0].replace(/-/g, " ");

            const color =
                game.white.username.toLowerCase() === username.toLowerCase()
                    ? "white"
                    : "black";

            if (!openings[color][ecoMain]) {
                openings[color][ecoMain] = {
                    played: 0,
                    won: 0,
                    lost: 0,
                    drawn: 0,
                };
            }
            if (!openings.both[ecoMain]) {
                openings.both[ecoMain] = {
                    played: 0,
                    won: 0,
                    lost: 0,
                    drawn: 0,
                };
            }

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

// API endpoint
app.get("/openings/:username", async (req, res) => {
    const username = req.params.username;
    const year = 2025;
    const months = [1, 2, 3];

    let allGames = [];

    for (const month of months) {
        const games = await fetchGames(username, year, month);
        allGames = allGames.concat(games);
    }

    const openings = extractOpenings(allGames, username);
    res.json(openings);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
