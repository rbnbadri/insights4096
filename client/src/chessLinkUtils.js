export function generateChessComLink(ecoUrlString, resultType) {
  const baseUrl =
    "https://www.chess.com/games/archive?gameOwner=my_game&gameType=live&gameTypeslive%5B%5D=rapid";

  // encode the full ECO URL to be URL-safe
  const encodedOpening = encodeURIComponent(ecoUrlString);

  // If resultType is provided and not 'played', add it as a query parameter
  const resultParam =
    resultType && resultType !== "played" ? `&gameResult=${resultType}` : "";

  return `${baseUrl}${resultParam}&opening=${encodedOpening}&timeSort=desc`;
}
