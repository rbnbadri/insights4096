import React, { useState, useEffect } from "react";
import "./App.css";
import OpeningStatsTable from "./OpeningStatsTable";

function Insights4096() {
  useEffect(() => {
    document.title = "Insights4096";
  }, []);

  const [username, setUsername] = useState("");
  const [filteredData, setFilteredData] = useState(null);
  const [totals, setTotals] = useState({
    played: 0,
    won: 0,
    lost: 0,
    drawn: 0,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setUsername(e.target.value);

  const handleSubmit = async () => {
    if (!username) return;

    try {
      const response = await fetch(
        `https://fc511c5e-ad91-434b-b376-03734aabba98-00-15nynkqgkr4sv.sisko.replit.dev/openings/${username}`,
      );
      const result = await response.json();
      const gamedata = result.data;
      const bothData = gamedata?.["both"];
      console.log(bothData["Catalan Opening Closed"]);

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
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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

      {submitted && filteredData?.both ? (
        <OpeningStatsTable
          title="All Openings"
          data={filteredData.both}
          side="both"
        />
      ) : submitted ? (
        <p>No data found for the provided search.</p>
      ) : null}
    </div>
  );
}

export default Insights4096;
