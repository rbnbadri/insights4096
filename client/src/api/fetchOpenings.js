import { BACKEND_URL } from "../apiConfig";

export async function fetchOpenings(
  username,
  start,
  end,
  setCacheWhite,
  setCacheBlack,
  source = "initial_fetch",
) {
  const baseUrl = `${BACKEND_URL}/openings/${username}`;
  const url =
    start && end
      ? `${baseUrl}?start=${start}&end=${end}&source=${source}`
      : `${baseUrl}?source=${source}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status}`);
  }

  const result = await response.json();
  const gamedata = result.data;

  // Cache only if it is 1 month
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setDate(today.getDate() - 30);
  const defaultStart = oneMonthAgo.toISOString().split("T")[0];
  const defaultEnd = today.toISOString().split("T")[0];

  const isDefaultOneMonth = start === defaultStart && end === defaultEnd;

  if (isDefaultOneMonth) {
    if (gamedata.white && setCacheWhite)
      setCacheWhite({ data: gamedata.white, startDate: start, endDate: end });
    if (gamedata.black && setCacheBlack)
      setCacheBlack({ data: gamedata.black, startDate: start, endDate: end });
  }

  return gamedata;
}
