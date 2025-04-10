// server/gameFetcher.js

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

/**
 * Generate an array of months between two dates in the format YYYY/MM
 */
function getMonthRange(startDate, endDate) {
  const result = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (current <= endDate) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    result.push(`${year}/${month}`);
    current.setMonth(current.getMonth() + 1);
  }

  return result;
}

/**
 * Parses the PGN of a game to extract its end date and checks if it's within range.
 */
function isGameInRange(game, start, end) {
  const match =
    game.pgn && game.pgn.match(/\[EndDate\s+"(\d{4})\.(\d{2})\.(\d{2})"\]/);
  if (!match) return false;

  const endDate = new Date(`${match[1]}-${match[2]}-${match[3]}`);
  return endDate >= start && endDate <= end;
}

/**
 * Fetches games for a user within a specified date range (YYYY-MM-DD format).
 */
async function fetchGamesInRange(username, startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const monthRange = getMonthRange(start, end);

  const fetchPromises = monthRange.map(async (month) => {
    const url = `https://api.chess.com/pub/player/${username}/games/${month}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`Failed to fetch ${url}`);
        return [];
      }
      const json = await res.json();
      return json.games || [];
    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
      return [];
    }
  });

  const gamesByMonth = await Promise.all(fetchPromises);
  const allGames = gamesByMonth.flat();

  // Filter by PGN end date field
  const filteredGames = allGames.filter((game) =>
    isGameInRange(game, start, end),
  );

  console.log("Number of filtered games:", gamesByMonth.length);
  return filteredGames;
}

module.exports = { fetchGamesInRange };
