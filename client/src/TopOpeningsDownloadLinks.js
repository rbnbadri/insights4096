// TopOpeningsDownloadLinks.js
import React from "react";
import "./App.css";
import { FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import { BACKEND_URL } from "./apiConfig";

const TopOpeningsDownloadLinks = ({
  openingsData,
  startDate,
  endDate,
  username,
}) => {
  if (!openingsData || !openingsData.white || !openingsData.black) {
    return null;
  }

  const calculateWinPercentage = (entry) => {
    const wins = entry.won;
    const losses = entry.lost;
    if (wins + losses === 0) return 0;
    return ((wins * 100) / (wins + losses)).toFixed(2);
  };

  const filterEligibleOpenings = (entries) =>
    Object.entries(entries)
      .filter(([, stats]) => stats.played >= 10)
      .map(([name, stats]) => ({
        name,
        stats,
        winPercent: calculateWinPercentage(stats),
      }))
      .sort((a, b) => a.winPercent - b.winPercent);

  const whiteOpenings = filterEligibleOpenings(openingsData.white);
  const blackOpenings = filterEligibleOpenings(openingsData.black);

  const getDownloadUrl = (openingName, gameResult, color) => {
    const ecoFormatted = openingName.replace(/ /g, "-");
    return `${BACKEND_URL}/pgns/${username}?color=${color}&eco=${ecoFormatted}&start=${startDate}&end=${endDate}&gameResult=${gameResult}`;
  };

  const renderOpeningRow = (opening, position, color) => {
    const { name, winPercent } = opening;
    const isHighest = position === 2;
    const textColor = isHighest ? "green-text" : "red-text";
    const icon = isHighest ? (
      <FaCheckCircle className="green-icon" />
    ) : (
      <FaExclamationTriangle className="red-icon" />
    );
    const resultType = isHighest ? "win" : "lost";
    return (
      <div
        className="top-opening-row"
        data-test-id={`top-opening-row-${color}`}
        key={name}
      >
        <div
          className={`top-opening-name ${textColor}`}
          data-test-id={`top-opening-name-${color}`}
          title={name}
        >
          {icon} {name}
        </div>
        <div
          className={`top-opening-percent ${textColor}`}
          data-test-id={`top-opening-percent-${color}`}
        >
          {winPercent}%
        </div>
        <div className="top-opening-link">
          <a
            href={getDownloadUrl(name, resultType, color)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download PGN for {resultType} games
          </a>
        </div>
      </div>
    );
  };

  const renderOpeningsSection = (openings, color) => (
    <div className="top-openings-half">
      {openings.length > 0 && (
        <>
          {renderOpeningRow(openings[0], 0, color)}
          {renderOpeningRow(openings[1], 1, color)}
          {renderOpeningRow(openings[openings.length - 1], 2, color)}
        </>
      )}
    </div>
  );

  return (
    <div className="table-wrapper">
      <div className="summary-bar-vertical">
        <div className="top-openings-header-half">
          White Openings Win/loss trends
        </div>
        <div className="top-openings-header-half">
          Black Openings Win/loss trends
        </div>
      </div>
      <div className="top-openings-section">
        {renderOpeningsSection(whiteOpenings, "white")}
        {renderOpeningsSection(blackOpenings, "black")}
      </div>
    </div>
  );
};

export default TopOpeningsDownloadLinks;
