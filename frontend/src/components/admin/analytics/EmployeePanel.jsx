import React, { useCallback, useEffect, useMemo, useState } from "react";
import { API_URL } from "../../../config";
import { Card, StatTile, EmptyState } from "./ui";
import { VIZ, formatNumber } from "./format";

function Stars({ value }) {
  const filled = Math.round(value || 0);
  return (
    <span aria-hidden="true" className="tracking-tight text-sm">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={{ color: star <= filled ? VIZ.accent : VIZ.grid }}>
          ★
        </span>
      ))}
    </span>
  );
}

function DistributionBars({ distribution, size = "sm" }) {
  const max = Math.max(...distribution, 1);
  const height = size === "sm" ? "h-[8px]" : "h-[10px]";

  return (
    <div className="space-y-1.5">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution[star - 1];
        return (
          <div key={star} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-3 tabular-nums">{star}</span>
            <div className={`flex-1 rounded-full ${height}`} style={{ backgroundColor: VIZ.track }}>
              <div
                className={`${height} rounded-full`}
                style={{ width: `${(count / max) * 100}%`, backgroundColor: VIZ.accent }}
              />
            </div>
            <span className="text-xs text-gray-500 w-6 text-right tabular-nums">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function RatingCard({ row, rank }) {
  const {
    employee,
    avgRating,
    ratingCount,
    noteCount,
    distribution,
    periodAvgRating,
    periodRatingCount,
    latestNote
  } = row;

  const unrated = noteCount - ratingCount;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <span className="text-3xl">{employee.avatar}</span>
            {rank !== null && (
              <span className="absolute -top-1 -left-1 bg-gray-900 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {rank}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{employee.name}</p>
            <p className="text-xs text-gray-400 truncate">{employee.role}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-semibold text-gray-900 leading-none">
            {avgRating !== null ? avgRating.toFixed(1) : "—"}
          </p>
          <Stars value={avgRating} />
          <p className="text-xs text-gray-400 mt-0.5">
            {formatNumber(ratingCount)} rating{ratingCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {ratingCount > 0 ? (
        <div className="mt-4">
          <DistributionBars distribution={distribution} />
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-400">
          No ratings yet — add one from the Performance tab on the Staff page.
        </p>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-1">
        <p>
          {periodRatingCount > 0
            ? `${periodRatingCount} rated this period · avg ${periodAvgRating.toFixed(1)}`
            : "No ratings in this period"}
          {unrated > 0 && ` · ${unrated} unrated note${unrated === 1 ? "" : "s"}`}
        </p>
        {latestNote && (
          <p className="text-gray-400 line-clamp-2" title={latestNote.note}>
            Latest: “{latestNote.note}”
          </p>
        )}
      </div>
    </div>
  );
}

function EmployeePanel({ token, range, anchor, periodLabel }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    fetch(`${API_URL}/api/staff/analytics/performance?range=${range}&anchor=${anchor}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setRows(res.data);
        else setError(res.message || "Failed to load employee ratings.");
      })
      .catch(() => setError("Network error fetching employee ratings."))
      .finally(() => setLoading(false));
  }, [token, range, anchor]);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) => {
        if (a.avgRating === null && b.avgRating === null) return a.employee.name.localeCompare(b.employee.name);
        if (a.avgRating === null) return 1;
        if (b.avgRating === null) return -1;
        if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
        return b.ratingCount - a.ratingCount;
      }),
    [rows]
  );

  const summary = useMemo(() => {
    const totalRatings = rows.reduce((sum, r) => sum + r.ratingCount, 0);
    const weighted = rows.reduce((sum, r) => sum + (r.avgRating || 0) * r.ratingCount, 0);
    const teamDistribution = [0, 0, 0, 0, 0];
    rows.forEach((r) => r.distribution.forEach((count, i) => (teamDistribution[i] += count)));

    return {
      totalRatings,
      teamAverage: totalRatings > 0 ? Math.round((weighted / totalRatings) * 10) / 10 : null,
      ratedThisPeriod: rows.reduce((sum, r) => sum + r.periodRatingCount, 0),
      ratedEmployees: rows.filter((r) => r.ratingCount > 0).length,
      teamDistribution,
      top: rows.length > 0 ? [...rows].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))[0] : null
    };
  }, [rows]);

  if (loading && rows.length === 0) {
    return <p className="text-gray-500">Loading ratings...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
        No active employees yet. Add your team from the Staff page.
      </div>
    );
  }

  const topRated = summary.top && summary.top.avgRating !== null ? summary.top : null;

  return (
    <div className={`space-y-6 ${loading ? "opacity-60 transition-opacity" : ""}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Team average"
          value={summary.teamAverage !== null ? summary.teamAverage.toFixed(1) : "—"}
          sub={`Across ${formatNumber(summary.totalRatings)} lifetime rating${summary.totalRatings === 1 ? "" : "s"}`}
        />
        <StatTile label="Rated this period" value={formatNumber(summary.ratedThisPeriod)} sub={periodLabel} />
        <StatTile
          label="Employees rated"
          value={`${summary.ratedEmployees} / ${rows.length}`}
          sub="Have at least one rating"
        />
        <StatTile
          label="Top performer"
          value={topRated ? topRated.employee.name : "—"}
          sub={topRated ? `${topRated.avgRating.toFixed(1)} average` : "No ratings yet"}
        />
      </div>

      <Card title="Team rating distribution" subtitle="All ratings ever recorded">
        {summary.totalRatings > 0 ? (
          <DistributionBars distribution={summary.teamDistribution} size="md" />
        ) : (
          <EmptyState>No ratings recorded yet.</EmptyState>
        )}
      </Card>

      <div>
        <h3 className="font-bold text-gray-800 mb-1">Employee ratings</h3>
        <p className="text-xs text-gray-400 mb-4">
          Ranked by lifetime average. Period activity is called out on each card.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {sorted.map((row, index) => (
            <RatingCard key={row.employee._id} row={row} rank={row.avgRating !== null ? index + 1 : null} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmployeePanel;
