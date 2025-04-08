import React, { useState } from "react";

const OpeningStatsTable = ({ data }) => {
  const [sortConfig, setSortConfig] = useState({
    key: "played",
    direction: "desc",
  });
  const [visibleCount, setVisibleCount] = useState(5);

  const sortedData = Object.entries(data).sort((a, b) => {
    const getValue = (entry, key) => {
      if (key === "name") return entry[0];
      if (key === "ecoCode") return entry[1].ecoCode || "";
      return entry[1][key];
    };

    const aVal = getValue(a, sortConfig.key);
    const bVal = getValue(b, sortConfig.key);

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
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
            <th colSpan="7">
              <div className="summary-header">
                <strong>
                  All Openings: P: {total.played} W: {total.won} L: {total.lost}{" "}
                  D: {total.drawn}
                </strong>
                {openingCount > 5 && (
                  <div className="summary-buttons">
                    {openingCount > 5 && visibleCount !== 5 && (
                      <button onClick={() => setVisibleCount(5)}>Top 5</button>
                    )}
                    {openingCount > 10 && visibleCount !== 10 && (
                      <button onClick={() => setVisibleCount(10)}>
                        Top 10
                      </button>
                    )}
                    {visibleCount !== "all" && (
                      <button onClick={() => setVisibleCount("all")}>
                        All
                      </button>
                    )}
                  </div>
                )}
              </div>
            </th>
          </tr>

          <tr>
            <th className="sortable" onClick={() => handleSort("name")}>
              Opening Name
            </th>
            <th className="sortable" onClick={() => handleSort("ecoCode")}>
              Opening Name with Eco
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
              <td>
                {stats.ecoCode && stats.ecoUrl ? (
                  <a href={stats.ecoUrl} target="_blank" rel="noreferrer">
                    {stats.ecoCode}
                  </a>
                ) : (
                  "NA"
                )}
              </td>
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
