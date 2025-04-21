import React from "react";
import Select, { components } from "react-select";
import DateRangeSelector from "./DateRangeSelector";
import ControlButtons from "./ControlButtons";

const SummaryBar = ({
  summaryLabel,
  fullSummary,
  filteredSummary,
  selectedOptions,
  setSelectedOptions,
  filterOptions,
  showingFilteredSummary,
  setShowingFilteredSummary,
  dateRangeOption,
  setDateRangeOption,
  onDateRangeChange,
  onResetToCachedOneMonth,
  totalRows,
  visibleRows,
  testId,
  color,
  handleShow5,
  handleShow10,
  handleShowAll,
  handleClearFilters,
}) => {
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
            Filtered {summaryLabel}: (P: {filteredSummary.played}, W:{" "}
            {filteredSummary.won}, L: {filteredSummary.lost}, D:{" "}
            {filteredSummary.drawn})<br />
            {summaryLabel}: (P: {fullSummary.played}, W: {fullSummary.won}, L:{" "}
            {fullSummary.lost}, D: {fullSummary.drawn})<br />
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
          options={filterOptions}
          isMulti
          placeholder="Filter openings"
          value={selectedOptions}
          onChange={(newOptions, actionMeta) => {
            if (["select-option", "remove-value"].includes(actionMeta.action)) {
              setShowingFilteredSummary(true);
            } else if (actionMeta.action === "clear") {
              setShowingFilteredSummary(false);
            }
            setSelectedOptions(newOptions || []);
          }}
          classNamePrefix="react-select"
          components={{ MultiValue, Control: CustomControl }}
          styles={{
            control: (base) => ({
              ...base,
              minHeight: "30px",
              fontSize: "12px",
            }),
          }}
          data-test-id={testId}
        />
      </div>

      <div className="date-range-dropdown">
        <DateRangeSelector
          onDateRangeResolved={onDateRangeChange}
          dateRangeOption={dateRangeOption}
          setDateRangeOption={setDateRangeOption}
          testId={`date range selector - ${color || "all"}`}
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
