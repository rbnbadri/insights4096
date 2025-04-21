import React, { useState, useEffect } from "react";
import "./App.css";
import OpeningStatsTable from "./OpeningStatsTable";

function Insights4096() {
  const handleResetToCachedOneMonth = (color) => {
    const cache =
      color === "white"
        ? cachedOneMonthWhite
        : color === "black"
          ? cachedOneMonthBlack
          : cachedOneMonthBoth;

    if (cache) {
      setFilteredData((prev) => ({
        ...prev,
        [color]: cache.data,
      }));
      setStartDate(cache.startDate);
      setEndDate(cache.endDate);
      setSubmitted(true);
      setResetToDefaultRange(true);
      setTimeout(() => setResetToDefaultRange(false), 100);
    }
  };

  useEffect(() => {
    document.title = "Insights4096";
  }, []);

  const [username, setUsername] = useState("");
  const [filteredData, setFilteredData] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cachedOneMonthWhite, setCachedOneMonthWhite] = useState(null);
  const [cachedOneMonthBlack, setCachedOneMonthBlack] = useState(null);
  const [cachedOneMonthBoth, setCachedOneMonthBoth] = useState(null);
  const [resetToDefaultRange, setResetToDefaultRange] = useState(false);
  const [fullResetTrigger, setFullResetTrigger] = useState(false);

  const handleChange = (e) => setUsername(e.target.value);

  const handleSubmit = async (start = startDate, end = endDate) => {
    if (!username) return;
    setLoading(true);

    const baseUrl = `https://insights4096-backend.onrender.com/openings/${username}`;
    const url = start && end ? `${baseUrl}?start=${start}&end=${end}` : baseUrl;

    console.log("Fetching data from:", url);

    try {
      const response = await fetch(url);
      const result = await response.json();
      const gamedata = result.data;

      setFilteredData({
        ...gamedata,
        startDate: start,
        endDate: end,
      });

      const today = new Date();
      const oneMonthAgo = new Date(today);
      oneMonthAgo.setDate(today.getDate() - 30);
      const defaultStart = oneMonthAgo.toISOString().split("T")[0];
      const defaultEnd = today.toISOString().split("T")[0];
      if (start === defaultStart && end === defaultEnd) {
        if (gamedata.white)
          setCachedOneMonthWhite({
            data: { ...gamedata.white },
            startDate: defaultStart,
            endDate: defaultEnd,
          });
        if (gamedata.black)
          setCachedOneMonthBlack({
            data: { ...gamedata.black },
            startDate: defaultStart,
            endDate: defaultEnd,
          });
        if (gamedata.both)
          setCachedOneMonthBoth({
            data: { ...gamedata.both },
            startDate: defaultStart,
            endDate: defaultEnd,
          });
      }
      setSubmitted(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
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
        <h1 className="header">Chess Insights v0.6.0</h1>
      </div>
      <div className="flex-row">
        <input
          type="text"
          value={username}
          onChange={handleChange}
          placeholder="Enter ChessDotCom username"
        />
        <button
          onClick={() => {
            const today = new Date();
            const oneMonthAgo = new Date(today);
            oneMonthAgo.setDate(today.getDate() - 30);
            const defaultStart = oneMonthAgo.toISOString().split("T")[0];
            const defaultEnd = today.toISOString().split("T")[0];

            setStartDate(defaultStart);
            setEndDate(defaultEnd);

            // 🔁 Trigger table and dropdown reset
            setResetToDefaultRange(true);
            setFullResetTrigger(true);

            // 🔁 Reset these triggers back so they can be used again
            setTimeout(() => {
              setResetToDefaultRange(false);
              setFullResetTrigger(false);
            }, 100);

            handleSubmit(defaultStart, defaultEnd);
          }}
        >
          Search
        </button>
      </div>

      {submitted && filteredData?.white ? (
        <OpeningStatsTable
          data={{
            ...filteredData.white,
            startDate,
            endDate,
          }}
          color="white"
          summaryLabel="White Games"
          testId="Openings filter- white"
          loading={loading}
          resetToDefaultRange={resetToDefaultRange}
          fullResetTrigger={fullResetTrigger}
          onResetToCachedOneMonth={() => handleResetToCachedOneMonth("white")}
          onDateRangeChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
            handleSubmit(start, end);
          }}
        />
      ) : submitted ? (
        <p>No white games found.</p>
      ) : null}
    </div>
  );
}

export default Insights4096;
