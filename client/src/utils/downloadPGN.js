// utils/downloadPGN.js
export const downloadPGN = async ({
  urlBase,
  queryParams,
  filenameFallback = "download.pgn",
  showToast = true,
  toastSuccess,
  toastError,
}) => {
  const queryString = new URLSearchParams(queryParams).toString();
  const checkUrl = `${urlBase}?${queryString}&checkOnly=true`;
  const fullUrl = `${urlBase}?${queryString}`;

  try {
    const res = await fetch(checkUrl);

    if (res.ok) {
      const { filename, gameCount } = await res.json();

      if (showToast && toastSuccess) {
        toastSuccess(
          `Downloading ${filename} with ${gameCount} game${gameCount > 1 ? "s" : ""}.`,
        );
      }

      const fileRes = await fetch(fullUrl);
      const pgnText = await fileRes.text();

      const blob = new Blob([pgnText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || filenameFallback;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } else if (res.status >= 400 && res.status < 500) {
      const errData = await res.json();
      if (showToast && toastError)
        toastError(`${res.status}: ${errData.message}`);
    } else {
      if (showToast && toastError) toastError("Internal server error");
    }
  } catch (err) {
    console.error("Download failed:", err);
    if (showToast && toastError)
      toastError("Download failed or no games found.");
  }
};
