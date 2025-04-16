import { useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const dateRangeOptions = [
  { value: "current-month", label: "Current Month" },
  { value: "last-30", label: "Last 1 Month" },
  { value: "last-60", label: "Last 2 Months" },
  { value: "custom", label: "Custom Range" },
];

const DateRangeSelector = ({ onDateRangeResolved }) => {
  const [dateRangeOption, setDateRangeOption] = useState("last-30");
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
    <div className="date-range-dropdown">
      <Select
        placeholder="Select Date Range"
        options={dateRangeOptions}
        value={dateRangeOptions.find((opt) => opt.value === dateRangeOption)}
        onChange={(opt) => setDateRangeOption(opt.value)}
        classNamePrefix="react-select"
      />

      {dateRangeOption === "custom" && (
        <div className="date-picker-range">
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

      <button onClick={handleSearch} className="search-button">
        Search
      </button>
    </div>
  );
};

export default DateRangeSelector;
