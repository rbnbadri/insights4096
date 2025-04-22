export function generateChessComLink(
  ecoUrlString,
  resultType,
  color,
  username = null,
) {
  const baseUrl = username
    ? `https://www.chess.com/games/archive/${username}?gameType=live&gameTypeslive%5B%5D=rapid`
    : "https://www.chess.com/games/archive?gameOwner=my_game&gameType=live&gameTypeslive%5B%5D=rapid";

  // encode the full ECO URL to be URL-safe
  const encodedOpening = encodeURIComponent(ecoUrlString);

  // If resultType is provided and not 'played', add it as a query parameter
  const resultParam =
    resultType && resultType !== "played" ? `&gameResult=${resultType}` : "";

  const colorParam = color === "both" ? "" : `&color=${color}`;

  return `${baseUrl}${resultParam}${colorParam}&opening=${encodedOpening}&timeSort=desc`;
}
