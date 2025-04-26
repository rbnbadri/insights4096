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

function countGamesPlayed(openings) {
  return Object.values(openings.both).reduce((sum, opening) => sum + (opening.played || 0), 0);
}

module.exports = { resultMapping, toTitleCase, countGamesPlayed };
