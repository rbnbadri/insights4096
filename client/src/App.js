import React, { useState } from "react";
import "./App.css";

function Insights4096() {
  const [username, setUsername] = useState("");
  const [filteredData, setFilteredData] = useState(null);
  const [totals, setTotals] = useState({
    played: 0,
    won: 0,
    lost: 0,
    drawn: 0,
  });
  const [submitted, setSubmitted] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const handleChange = (e) => setUsername(e.target.value);

  const handleSubmit = async () => {
    if (!username) return;

    try {
      const response = await fetch(
        `https://insights4096-backend.onrender.com/openings/${username}`,
      );
      const result = await response.json();
      const gamedata = result.data;
      const bothData = gamedata?.["both"];

      const total = Object.values(bothData).reduce(
        (acc, item) => {
          acc.played += item.played;
          acc.won += item.won;
          acc.lost += item.lost;
          acc.drawn += item.drawn;
          return acc;
        },
        { played: 0, won: 0, lost: 0, drawn: 0 },
      );

      setFilteredData(gamedata);
      setSubmitted(true);
      setTotals(total);

      console.log("Fetched data:", JSON.stringify(bothData, null, 2));
      console.log("Totals:", total);
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
    setFilteredData({ ...filteredData, [side]: sortedData });

    setSortConfig({
      key,
      direction:
        sortConfig.direction === "ascending" ? "descending" : "ascending",
    });
  };

  const renderTable = (side, title) => {
    const sideData = filteredData?.[side];
    const sideLength = sideData ? Object.keys(sideData).length : 0;
    console.log(
      "Rendering table for side:",
      side,
      "Opening count:",
      sideLength,
    );

    if (!sideData || sideLength === 0) return null;

    return (
      <div className="table-container">
        <div className="flex-row">
          <h2>{title}</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th
                className="table-header"
                onClick={() => handleSort(side, "opening_name")}
              >
                Opening Name
              </th>
              <th
                className="table-header"
                onClick={() => handleSort(side, "played")}
              >
                Played
              </th>
              <th
                className="table-header"
                onClick={() => handleSort(side, "won")}
              >
                Won
              </th>
              <th
                className="table-header"
                onClick={() => handleSort(side, "lost")}
              >
                Lost
              </th>
              <th
                className="table-header"
                onClick={() => handleSort(side, "drawn")}
              >
                Drawn
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(sideData).map(([openingName, stats], idx) => (
              <tr key={idx}>
                <td className="table-cell">{openingName}</td>
                <td className="table-cell">{stats.played}</td>
                <td className="table-cell">{stats.won}</td>
                <td className="table-cell">{stats.lost}</td>
                <td className="table-cell">{stats.drawn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="App">
      <div className="flex-row">
        <h1 className="header">Chess Insights</h1>
      </div>
      <div className="flex-row">
        <input
          type="text"
          value={username}
          onChange={handleChange}
          placeholder="Enter ChessDotCom username"
        />
        <button onClick={handleSubmit}>Search</button>
      </div>

      {submitted && filteredData ? (
        <>
          <div className="openings-header">
            All openings: P: {totals.played} W: {totals.won} L: {totals.lost} D:{" "}
            {totals.drawn}
          </div>
          {renderTable("both", "All Openings")}
        </>
      ) : submitted ? (
        <p>No data found for the provided search.</p>
      ) : null}
    </div>
  );
}

export default Insights4096;
