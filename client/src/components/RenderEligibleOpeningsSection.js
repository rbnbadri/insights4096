// src/components/RenderEligibleOpeningsSection.js

import React from "react";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { BACKEND_URL } from "../apiConfig";

export const RenderEligibleOpeningsSection = ({
  openings,
  color,
  startDate,
  endDate,
  username,
}) => {
  const getDownloadUrl = (openingName, gameResult) => {
    const ecoFormatted = openingName.replace(/ /g, "-");
    return `${BACKEND_URL}/pgns/${username}?color=${color}&eco=${ecoFormatted}&start=${startDate}&end=${endDate}&gameResult=${gameResult}`;
  };

  const renderOpeningRow = (opening, badgeType) => {
    const { name, winPercent } = opening;

    let icon = null;
    let textColor = "black-text";
    let resultType = "";

    if (badgeType === "highest") {
      icon = <FaCheckCircle className="green-icon" />;
      textColor = "green-text";
      resultType = "win";
    } else if (badgeType === "lowest" || badgeType === "secondLowest") {
      icon = <FaExclamationTriangle className="red-icon" />;
      textColor = "red-text";
      resultType = "lost";
    } else if (badgeType === "noData") {
      icon = <FaExclamationTriangle className="black-icon" />;
      textColor = "black-text";
      resultType = "";
    }

    return (
      <div
        className="top-opening-row"
        data-test-id={`top-opening-row-${color}`}
        key={name}
      >
        <div className={`top-opening-name ${textColor}`} title={name}>
          {icon} {name}
        </div>
        <div className={`top-opening-percent ${textColor}`}>{winPercent}%</div>
        {resultType ? (
          <div className="top-opening-link">
            <a
              href={getDownloadUrl(name, resultType)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download PGN for {resultType} games
            </a>
          </div>
        ) : (
          <div className="top-opening-link">-</div>
        )}
      </div>
    );
  };

  const renderRowsForOpenings = () => {
    if (!openings || openings.length === 0) {
      return (
        <div
          className="top-opening-row"
          style={{
            justifyContent: "center",
            color: "black",
            fontWeight: "bold",
          }}
        >
          <FaExclamationTriangle className="black-icon" />
          Insufficient number of games to show trends
        </div>
      );
    }

    switch (openings.length) {
      case 1: {
        const opening = openings[0];
        return opening.winPercent >= 50
          ? renderOpeningRow(opening, "highest")
          : renderOpeningRow(opening, "lowest");
      }
      case 2: {
        const [o1, o2] = openings;
        if (o1.winPercent < 50 && o2.winPercent < 50) {
          return (
            <>
              {renderOpeningRow(o1, "lowest")}
              {renderOpeningRow(o2, "secondLowest")}
            </>
          );
        } else if (o1.winPercent === o2.winPercent && o2.winPercent >= 50) {
          return renderOpeningRow(o2, "highest");
        } else if (o1.winPercent < 50 && o2.winPercent >= 50) {
          return (
            <>
              {renderOpeningRow(o1, "lowest")}
              {renderOpeningRow(o2, "highest")}
            </>
          );
        } else {
          return (
            <div
              className="top-opening-row"
              style={{ flexDirection: "column", alignItems: "center" }}
            >
              <FaExclamationTriangle className="black-icon" />
              Unexpected data pattern:
              <div>O1: {o1.winPercent}%</div>
              <div>O2: {o2.winPercent}%</div>
            </div>
          );
        }
      }
      default: {
        return (
          <>
            {renderOpeningRow(openings[0], "lowest")}
            {renderOpeningRow(openings[1], "secondLowest")}
            {renderOpeningRow(openings[openings.length - 1], "highest")}
          </>
        );
      }
    }
  };

  return (
    <div className="top-openings-half">
      <div className="top-opening-rows">{renderRowsForOpenings()}</div>
    </div>
  );
};
