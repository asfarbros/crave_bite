import React from "react";

export function Card({ title, subtitle, action, children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
          <div>
            {title && <h3 className="font-bold text-gray-800">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="px-6 pb-6">{children}</div>
    </div>
  );
}

export function StatTile({ label, value, sub, delta, deltaLabel, upIsGood = true }) {
  const hasDelta = delta !== null && delta !== undefined;
  const flat = hasDelta && delta === 0;
  const good = hasDelta && (delta > 0) === upIsGood;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-semibold text-gray-900 mt-1 truncate" title={typeof value === "string" ? value : undefined}>
        {value}
      </p>
      {hasDelta ? (
        <p className="text-xs mt-2 flex items-center gap-1 flex-wrap">
          <span className={flat ? "text-gray-500" : good ? "text-green-700" : "text-red-600"}>
            {flat ? "■" : delta > 0 ? "▲" : "▼"} {Math.abs(delta)}%
          </span>
          {deltaLabel && <span className="text-gray-400">vs {deltaLabel}</span>}
        </p>
      ) : (
        sub && <p className="text-xs text-gray-400 mt-2">{sub}</p>
      )}
    </div>
  );
}

export function EmptyState({ children }) {
  return <p className="text-sm text-gray-500 text-center py-10">{children}</p>;
}
