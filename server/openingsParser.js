const { resultMapping, toTitleCase } = require("./utils");
const ecoData = require("./eco_openings.json").data;

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

    return openings;
}

module.exports = { extractOpenings };
