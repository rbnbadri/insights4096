import React, { useState } from "react";

function Insights4096() {
  const [username, setUsername] = useState("");
  const [filteredData, setFilteredData] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const handleChange = (e) => {
    setUsername(e.target.value);
  };

  const handleSubmit = async () => {
    if (!username.trim()) return;

    try {
      const response = await fetch(
        `https://insights4096-backend.onrender.com/openings/${username}`,
      );

      const result = await response.json();
      setFilteredData(result.data);
      setSubmitted(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSort = (side, key) => {
    const dataToSort = filteredData?.[side];
    if (!dataToSort) return;

    const sortedEntries = Object.entries(dataToSort).sort((a, b) => {
      let valA = key === "opening_name" ? a[0] : a[1][key];
      let valB = key === "opening_name" ? b[0] : b[1][key];

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortConfig.direction === "ascending" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });

    const sortedData = Object.fromEntries(sortedEntries);
    const updated = { ...filteredData, [side]: sortedData };
    setFilteredData(updated);
    setSortConfig({
      key,
      direction:
        sortConfig.direction === "ascending" ? "descending" : "ascending",
    });
  };

  const renderTable = (side, title) => {
    const sideData = filteredData?.[side];
    if (!sideData || Object.keys(sideData).length === 0) return null;

    return (
      <div style={{ marginTop: "20px" }}>
        <h2>{title}</h2>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th
                onClick={() => handleSort(side, "opening_name")}
                style={headerStyle}
              >
                Opening Name
              </th>
              <th
                onClick={() => handleSort(side, "played")}
                style={headerStyle}
              >
                Played
              </th>
              <th onClick={() => handleSort(side, "won")} style={headerStyle}>
                Won
              </th>
              <th onClick={() => handleSort(side, "lost")} style={headerStyle}>
                Lost
              </th>
              <th onClick={() => handleSort(side, "drawn")} style={headerStyle}>
                Drawn
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(sideData).map(([openingName, stats], idx) => (
              <tr key={idx}>
                <td style={cellStyle}>{openingName}</td>
                <td style={cellStyle}>{stats.played}</td>
                <td style={cellStyle}>{stats.won}</td>
                <td style={cellStyle}>{stats.lost}</td>
                <td style={cellStyle}>{stats.drawn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const headerStyle = {
    border: "1px solid black",
    padding: "8px",
    backgroundColor: "#f2f2f2",
    cursor: "pointer",
    textAlign: "left",
  };

  const cellStyle = {
    border: "1px solid black",
    padding: "8px",
    textAlign: "left",
  };

  return (
    <div className="App" style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Chess Insights</h1>
      <input
        type="text"
        value={username}
        onChange={handleChange}
        placeholder="Enter Chess.com Username"
        style={{ marginRight: "10px" }}
      />
      <button onClick={handleSubmit}>Search</button>

      {submitted && filteredData?.both ? (
        <>
          {renderTable("both", "All Openings")}

          {/* Uncomment below to restore white and black tables */}
          {/* {renderTable("white", "White Openings")} */}
          {/* {renderTable("black", "Black Openings")} */}
        </>
      ) : submitted ? (
        <p>No data found for the provided search.</p>
      ) : null}
    </div>
  );
}

export default Insights4096;
