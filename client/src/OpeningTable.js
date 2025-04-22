import React from "react";
import { generateChessComLink } from "./chessLinkUtils";

const OpeningTable = ({
  color,
  loading,
  filteredEntries,
  renderSortIndicator,
  startDate,
  endDate,
  handleSortColumn,
}) => {
  const renderLinkedCell = (count, resultType, ecoUrlString) => {
    if (count > 0 && startDate && endDate) {
      const startFormatted = new Date(startDate).toLocaleDateString("en-US");
      const endFormatted = new Date(endDate).toLocaleDateString("en-US");
      const baseLink = generateChessComLink(ecoUrlString, resultType, color);
      const dataTestId = `${resultType ? resultType : "played"}-count`;
      const dateQuery = `&endDate%5Bdate%5D=${encodeURIComponent(endFormatted)}&startDate%5Bdate%5D=${encodeURIComponent(startFormatted)}`;
      return (
        <a
          href={baseLink + dateQuery}
          data-test-id={dataTestId}
          target="_blank"
          rel="noreferrer"
        >
          {count}
        </a>
      );
    }
    return count;
  };

  return (
    <div className="table-wrapper" style={{ position: "relative" }}>
      {loading && <div className="loading-overlay">Loading data...</div>}
      <table className="chess-table" style={{ opacity: loading ? 0.5 : 1 }}>
        <thead>
          <tr data-test-id={`Table header for ${color || "all"} openings`}>
            <th
              className="opening-name-cell"
              onClick={() => handleSortColumn("name")}
            >
              Opening Name{renderSortIndicator("name")}
            </th>
            <th>Opening Name with Eco</th>
            <th className="sortable" onClick={() => handleSortColumn("played")}>
              Played{renderSortIndicator("played")}
            </th>
            <th className="sortable" onClick={() => handleSortColumn("won")}>
              Won{renderSortIndicator("won")}
            </th>
            <th className="sortable" onClick={() => handleSortColumn("lost")}>
              Lost{renderSortIndicator("lost")}
            </th>
            <th className="sortable" onClick={() => handleSortColumn("drawn")}>
              Drawn{renderSortIndicator("drawn")}
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(filteredEntries).map(([name, stats]) => (
            <tr key={name} data-test-id="Chess data row">
              <td className="opening-name-cell" title={name}>
                {name}
              </td>
              <td className="eco-code">
                <a href={stats.ecoUrl} target="_blank" rel="noreferrer">
                  {stats.ecoCode}
                </a>
              </td>
              <td>
                {renderLinkedCell(stats.played, null, stats.ecoUrlString)}
              </td>
              <td>{renderLinkedCell(stats.won, "win", stats.ecoUrlString)}</td>
              <td>
                {renderLinkedCell(stats.lost, "lost", stats.ecoUrlString)}
              </td>
              <td>
                {renderLinkedCell(stats.drawn, "draw", stats.ecoUrlString)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OpeningTable;
