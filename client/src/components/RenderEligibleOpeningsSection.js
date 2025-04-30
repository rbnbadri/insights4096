// src/components/RenderEligibleOpeningsSection.js

import React from "react";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { BACKEND_URL } from "../apiConfig";
import { downloadPGN } from "../utils/downloadPGN";

export const RenderEligibleOpeningsSection = ({
  openings,
  color,
  startDate,
  endDate,
  username,
}) => {
  const handleDirectDownload = (openingName, resultType) => {
    const eco = openingName.replace(/ /g, "-");
    const queryParams = {
      color,
      eco,
      start: startDate,
      end: endDate,
      gameResult: resultType,
    };

    downloadPGN({
      urlBase: `${BACKEND_URL}/pgns/${username}`,
      queryParams,
      filenameFallback: `${eco}-${resultType}.pgn`,
      showToast: false,
    });
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
      icon = <FaExclamationTriangle className="yellow-icon" />;
      textColor = "light-red-text";
      resultType = "";
    }

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
          <div
            className="top-opening-name-text"
            data-test-id={`top-opening-name-text-${color}`}
          >
            {icon} {name}
          </div>
        </div>
        <div
          className={`top-opening-percent ${textColor}`}
          data-test-id={`top-opening-percent-${color}`}
        >
          {winPercent !== null ? `${winPercent.toFixed(2)}%` : "NA"}
        </div>
        {resultType ? (
          <div
            className="top-opening-link"
            data-test-id={`top-opening-link-${color}`}
          >
            <span
              className="pgn-download-link"
              onClick={() => handleDirectDownload(name, resultType)}
              role="link"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" && handleDirectDownload(name, resultType)
              }
            >
              Download PGN for {resultType} games
            </span>
          </div>
        ) : (
          <div className="top-opening-link">-</div>
        )}
      </div>
    );
  };

  const renderRowsForOpenings = () => {
    if (!openings || openings.length === 0) {
      const dummyOpening = {
        name: "Insufficient data to show trends.",
        winPercent: null,
      };
      return renderOpeningRow(dummyOpening, "noData");
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

  return <div className="top-openings-half">{renderRowsForOpenings()}</div>;
};
