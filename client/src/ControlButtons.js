// ControlButtons.js
import React from "react";

const ControlButtons = ({ handleShow5, handleShow10, handleShowAll, handleClearFilters }) => (
  <div className="summary-buttons">
    <button onClick={handleShow5}>Show 5</button>
    <button onClick={handleShow10}>Show 10</button>
    <button onClick={handleShowAll}>Show All</button>
    <button onClick={handleClearFilters}>Clear Filters</button>
  </div>
);

export default ControlButtons;