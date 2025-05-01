import React from "react";
import Select, { components } from "react-select";
import ControlButtons from "./ControlButtons";
import DateRangeSelector from "./DateRangeSelector";
import "./css/SummaryBar.css";

const SummaryBar = ({
  summaryData,
  filterProps,
  dateRangeProps,
  controlProps,
  tableMetrics,
}) => {
  const { summaryLabel, fullSummary, filteredSummary } = summaryData;

  const {
    selectedOptions,
    setSelectedOptions,
    filterOptions,
    showingFilteredSummary,
    setShowingFilteredSummary,
  } = filterProps;

  const {
    dateRangeOption,
    setDateRangeOption,
    onDateRangeChange,
    onResetToCachedOneMonth,
  } = dateRangeProps;

  const { handleShow5, handleShow10, handleShowAll, handleClearFilters } =
    controlProps;

  const { totalRows, visibleRows, testId, color } = tableMetrics;

  const CustomControl = ({ children, innerRef, innerProps, ...rest }) => (
    <components.Control
      {...rest}
      innerRef={innerRef}
      innerProps={{ ...innerProps, "data-test-id": testId }}
    >
      {children}
    </components.Control>
  );

  const MultiValue = ({ index, getValue, ...props }) => {
    const maxToShow = 3;
    if (index < maxToShow) return <components.MultiValue {...props} />;
    if (index === maxToShow) {
      return (
        <components.MultiValue {...props}>
          <span style={{ paddingLeft: "4px" }}>...</span>
        </components.MultiValue>
      );
    }
    return null;
  };

  return (
    <div className="summary-bar-vertical">
      <div className="summary-text">
        {showingFilteredSummary ? (
          <>
            {summaryLabel}: (P: {fullSummary.played}, W: {fullSummary.won}, L:{" "}
            {fullSummary.lost}, D: {fullSummary.drawn})<br />
            Filtered {summaryLabel}: (P: {filteredSummary.played}, W:{" "}
            {filteredSummary.won}, L: {filteredSummary.lost}, D:{" "}
            {filteredSummary.drawn})<br />
          </>
        ) : (
          <>
            {summaryLabel}: (P: {fullSummary.played}, W: {fullSummary.won}, L:{" "}
            {fullSummary.lost}, D: {fullSummary.drawn})<br />
          </>
        )}
        Showing {visibleRows} rows out of {totalRows}
      </div>
      <div className="filter-dropdown">
        <Select
          isMulti
          options={filterOptions}
          value={selectedOptions}
          onChange={(newOptions, actionMeta) => {
            if (["select-option", "remove-value"].includes(actionMeta.action)) {
              setShowingFilteredSummary(true);
            } else if (actionMeta.action === "clear") {
              setShowingFilteredSummary(false);
            }
            setSelectedOptions(newOptions || []);
          }}
          components={{ MultiValue, Control: CustomControl }}
          placeholder="Filter openings..."
          className="react-select-container"
          classNamePrefix="react-select"
          inputId={testId}
        />
      </div>
      <div className="date-range-dropdown">
        <DateRangeSelector
          dateRangeOption={dateRangeOption}
          setDateRangeOption={setDateRangeOption}
          onDateRangeChange={onDateRangeChange}
          onResetToCachedOneMonth={onResetToCachedOneMonth}
          testId={`date range selector - ${color || "both"}`}
        />
      </div>
      <ControlButtons
        handleShow5={handleShow5}
        handleShow10={handleShow10}
        handleShowAll={handleShowAll}
        handleClearFilters={handleClearFilters}
      />
    </div>
  );
};

export default SummaryBar;
