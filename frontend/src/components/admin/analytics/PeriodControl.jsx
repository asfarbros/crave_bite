import React from "react";
import { canGoForward, shiftAnchor, todayAnchor } from "./periodNav";

const RANGES = [
  { key: "today", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
  { key: "all", label: "Overall" }
];

function PeriodControl({ range, anchor, label, onRangeChange, onAnchorChange }) {
  const navigable = range !== "all";
  const forward = canGoForward(range, anchor);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      {navigable && (
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-1 py-1 shadow-sm">
          <button
            onClick={() => onAnchorChange(shiftAnchor(range, anchor, -1))}
            aria-label="Previous period"
            className="px-2 py-1 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
          >
            ‹
          </button>
          <span className="px-2 text-sm font-semibold text-gray-800 whitespace-nowrap min-w-[140px] text-center">
            {label || "—"}
          </span>
          <button
            onClick={() => onAnchorChange(shiftAnchor(range, anchor, 1))}
            disabled={!forward}
            aria-label="Next period"
            className="px-2 py-1 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
          >
            ›
          </button>
          {forward && (
            <button
              onClick={() => onAnchorChange(todayAnchor())}
              className="ml-1 px-2 py-1 text-xs font-semibold text-yellow-700 hover:bg-yellow-50 rounded transition-colors"
            >
              Now
            </button>
          )}
        </div>
      )}

      <div role="group" aria-label="Time range" className="inline-flex bg-gray-100 rounded-lg p-1">
        {RANGES.map((option) => (
          <button
            key={option.key}
            onClick={() => onRangeChange(option.key)}
            aria-pressed={range === option.key}
            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
              range === option.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PeriodControl;
