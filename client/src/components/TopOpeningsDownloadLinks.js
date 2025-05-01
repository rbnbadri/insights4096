// TopOpeningsDownloadLinks.js
import React from "react";
import "../App.css";
import { RenderEligibleOpeningsSection } from "./RenderEligibleOpeningsSection";
import "./TopOpeningsDownloadLinks.css";

const TopOpeningsDownloadLinks = ({
  openingsData,
  startDate,
  endDate,
  username,
  onCustomDownloadClick,
}) => {
  if (!openingsData || !openingsData.white || !openingsData.black) {
    return null;
  }

  const calculateWinPercentage = (entry) => {
    if (
      !entry ||
      typeof entry.won !== "number" ||
      typeof entry.lost !== "number"
    ) {
      return 0;
    }
    const wins = entry.won;
    const losses = entry.lost;
    if (wins + losses === 0) return 0;
    return Number(((wins * 100) / (wins + losses)).toFixed(2));
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

  return (
    <div className="table-wrapper">
      <div className="summary-bar-vertical">
        <div className="top-openings-header">
          <div className="top-openings-header-half">
            White Openings Win/loss trends
          </div>
          <div className="top-openings-header-half">
            Black Openings Win/loss trends
          </div>
        </div>
      </div>
      <div className="top-openings-section">
        <RenderEligibleOpeningsSection
          openings={whiteOpenings}
          color="white"
          startDate={startDate}
          endDate={endDate}
          username={username}
        />
        <RenderEligibleOpeningsSection
          openings={blackOpenings}
          color="black"
          startDate={startDate}
          endDate={endDate}
          username={username}
        />
      </div>
      <div className="download-other-section">
        <button className="btn-secondary" onClick={onCustomDownloadClick}>
          Download Other PGNs
        </button>
      </div>
    </div>
  );
};

export default TopOpeningsDownloadLinks;
