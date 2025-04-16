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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleChange = (e) => setUsername(e.target.value);

  const handleSubmit = async (start = startDate, end = endDate) => {
    if (!username) return;

    const baseUrl = `https://insights4096-backend.onrender.com/openings/${username}`;
    const url = start && end ? `${baseUrl}?start=${start}&end=${end}` : baseUrl;

    console.log("Fetching data from:", url);

    try {
      const response = await fetch(url);
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

      setFilteredData({
        ...gamedata["both"],
        startDate: start,
        endDate: end,
      });
      setSubmitted(true);
      setTotals(total);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setDate(today.getDate() - 30);

    const defaultStart = oneMonthAgo.toISOString().split("T")[0];
    const defaultEnd = today.toISOString().split("T")[0];

    setStartDate(defaultStart);
    setEndDate(defaultEnd);
  }, []);

  return (
    <div className="App">
      <div className="flex-row">
        <h1 className="header">Chess Insights v0.4.1</h1>
      </div>
      <div className="flex-row">
        <input
          type="text"
          value={username}
          onChange={handleChange}
          placeholder="Enter ChessDotCom username"
        />
        <button onClick={() => handleSubmit()}>Search</button>
      </div>

      {submitted && filteredData ? (
        <OpeningStatsTable
          title="All Openings"
          data={filteredData}
          side="both"
          onDateRangeChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
            handleSubmit(start, end);
          }}
        />
      ) : submitted ? (
        <p>No data found for the provided search.</p>
      ) : null}
    </div>
  );
}

export default Insights4096;
