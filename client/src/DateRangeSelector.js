import { useState, useEffect } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const dateRangeOptions = [
  { value: "current-month", label: "Current Month" },
  { value: "last-30", label: "Last 1 Month" },
  { value: "last-60", label: "Last 2 Months" },
  { value: "custom", label: "Custom Range" },
];

const DateRangeSelector = ({
  onDateRangeResolved,
  resetToDefaultRange,
  dateRangeOption,
  setDateRangeOption,
}) => {
  useEffect(() => {
    if (resetToDefaultRange) {
      setDateRangeOption("last-30");
      setCustomStartDate(null);
      setCustomEndDate(null);
    }
  }, [resetToDefaultRange]);

  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);

  const handleSearch = () => {
    const today = new Date();
    let startDate, endDate;

    if (dateRangeOption === "custom" && customStartDate && customEndDate) {
      startDate = customStartDate.toISOString().split("T")[0];
      endDate = customEndDate.toISOString().split("T")[0];
    } else if (dateRangeOption === "current-month") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = start.toISOString().split("T")[0];
      endDate = today.toISOString().split("T")[0];
    } else if (dateRangeOption === "last-60") {
      const start = new Date(today);
      start.setDate(today.getDate() - 60);
      startDate = start.toISOString().split("T")[0];
      endDate = today.toISOString().split("T")[0];
    } else {
      const start = new Date(today);
      start.setDate(today.getDate() - 30);
      startDate = start.toISOString().split("T")[0];
      endDate = today.toISOString().split("T")[0];
    }

    onDateRangeResolved(startDate, endDate);
  };

  return (
    <div className="date-range-selector">
      {/* Row: dropdown + button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div style={{ flex: 1 }}>
          <Select
            placeholder="Select Date Range"
            options={dateRangeOptions}
            value={dateRangeOptions.find(
              (opt) => opt.value === dateRangeOption,
            )}
            onChange={(opt) => setDateRangeOption(opt.value)}
            classNamePrefix="react-select"
          />
        </div>
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>

      {/* Row: start + end pickers */}
      {dateRangeOption === "custom" && (
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <DatePicker
            selected={customStartDate}
            onChange={(date) => setCustomStartDate(date)}
            placeholderText="Start Date"
            maxDate={new Date()}
            minDate={
              new Date(new Date().setFullYear(new Date().getFullYear() - 1))
            }
          />
          <DatePicker
            selected={customEndDate}
            onChange={(date) => setCustomEndDate(date)}
            placeholderText="End Date"
            maxDate={new Date()}
            minDate={
              customStartDate ||
              new Date(new Date().setFullYear(new Date().getFullYear() - 1))
            }
          />
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
