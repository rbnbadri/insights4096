import React, { useState, useEffect } from "react";

function Insights4096() {
  const [username, setUsername] = useState("");
  const [openingsData, setOpeningsData] = useState(null);

  useEffect(() => {
    document.title = "insights4096";
  }, []);

  const handleSearch = async () => {
    if (!username) return;

    try {
      const response = await fetch(
        `https://insights4096-backend.onrender.com/openings/${username}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      setOpeningsData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div style={{ textAlign: "left", margin: "50px" }}>
      <h1>Chess Insights</h1>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter Chess.com username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: "10px", width: "250px", marginRight: "10px" }}
        />
        <button onClick={handleSearch} style={{ padding: "10px 15px" }}>
          Search
        </button>
      </div>

      {openingsData && (
        <table
          style={{
            borderCollapse: "collapse",
            width: "80%",
            textAlign: "left",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid black", padding: "10px" }}>
                Opening
              </th>
              <th style={{ border: "1px solid black", padding: "10px" }}>
                Won
              </th>
              <th style={{ border: "1px solid black", padding: "10px" }}>
                Lost
              </th>
              <th style={{ border: "1px solid black", padding: "10px" }}>
                Drawn
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(openingsData.white || {}).map(
              ([opening, stats]) => (
                <tr key={opening}>
                  <td style={{ border: "1px solid black", padding: "10px" }}>
                    {opening}
                  </td>
                  <td style={{ border: "1px solid black", padding: "10px" }}>
                    {stats.won}
                  </td>
                  <td style={{ border: "1px solid black", padding: "10px" }}>
                    {stats.lost}
                  </td>
                  <td style={{ border: "1px solid black", padding: "10px" }}>
                    {stats.drawn}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Insights4096;
