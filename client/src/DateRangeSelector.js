// DateRangeSelector.js
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
  dateRangeOption,
  setDateRangeOption,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
}) => {
  return (
    <div className="date-range-dropdown">
      <Select
        placeholder="Select Date Range"
        options={dateRangeOptions}
        value={dateRangeOptions.find(
          (option) => option.value === dateRangeOption,
        )}
        onChange={(selectedOption) => setDateRangeOption(selectedOption.value)}
        classNamePrefix="react-select"
      />

      {dateRangeOption?.value === "custom" && (
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
    </div>
  );
};

export default DateRangeSelector;
