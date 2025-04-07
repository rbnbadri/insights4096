import React, { useState } from "react";

const OpeningStatsTable = ({ data }) => {
  const [sortConfig, setSortConfig] = useState({
    key: "played",
    direction: "desc",
  });
  const [visibleCount, setVisibleCount] = useState(5); // 5, 10, or "all"

  const sortedData = Object.entries(data).sort((a, b) => {
    const aVal = sortConfig.key === "name" ? a[0] : a[1][sortConfig.key];
    const bVal = sortConfig.key === "name" ? b[0] : b[1][sortConfig.key];

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    } else {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const total = Object.values(data).reduce(
    (acc, item) => {
      acc.played += item.played;
      acc.won += item.won;
      acc.lost += item.lost;
      acc.drawn += item.drawn;
      return acc;
    },
    { played: 0, won: 0, lost: 0, drawn: 0 },
  );

  const openingCount = sortedData.length;

  const getVisibleData = () => {
    if (visibleCount === "all") return sortedData;
    return sortedData.slice(0, visibleCount);
  };

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr className="summary-row">
            <th colSpan="5">
              <strong>
                All Openings: P: {total.played} W: {total.won} L: {total.lost}{" "}
                D: {total.drawn}
              </strong>
            </th>
          </tr>

          {/* Buttons go here */}
          {openingCount > 5 && (
            <tr>
              <th colSpan="5">
                <div
                  style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
                >
                  {openingCount > 5 && visibleCount !== 5 && (
                    <button onClick={() => setVisibleCount(5)}>
                      Show Top 5
                    </button>
                  )}
                  {openingCount > 10 && visibleCount !== 10 && (
                    <button onClick={() => setVisibleCount(10)}>
                      Show Top 10
                    </button>
                  )}
                  {visibleCount !== "all" && (
                    <button onClick={() => setVisibleCount("all")}>
                      Show All
                    </button>
                  )}
                </div>
              </th>
            </tr>
          )}

          <tr>
            <th className="sortable" onClick={() => handleSort("name")}>
              Opening Name
            </th>
            <th className="sortable" onClick={() => handleSort("played")}>
              Played
            </th>
            <th className="sortable" onClick={() => handleSort("won")}>
              Won
            </th>
            <th className="sortable" onClick={() => handleSort("lost")}>
              Lost
            </th>
            <th className="sortable" onClick={() => handleSort("drawn")}>
              Drawn
            </th>
          </tr>
        </thead>

        <tbody>
          {getVisibleData().map(([opening, stats], idx) => (
            <tr key={idx}>
              <td>{opening}</td>
              <td>{stats.played}</td>
              <td>{stats.won}</td>
              <td>{stats.lost}</td>
              <td>{stats.drawn}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OpeningStatsTable;
