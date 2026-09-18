import React, { useCallback, useEffect, useMemo, useState } from "react";
import { API_URL } from "../../config";

const RATING_COLOR = "#eb6834";

function Stars({ value }) {
  const filled = Math.round(value || 0);
  return (
    <span aria-hidden="true" className="tracking-tight">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={{ color: star <= filled ? RATING_COLOR : "#e1e0d9" }}>
          ★
        </span>
      ))}
    </span>
  );
}

function RatingCard({ row }) {
  const { employee, avgRating, ratingCount, noteCount, distribution, monthAvgRating, monthRatingCount, latestNote } = row;
  const maxBucket = Math.max(...distribution, 1);

  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-3xl shrink-0">{employee.avatar}</span>
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
            {ratingCount} rating{ratingCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {ratingCount > 0 ? (
        <div className="mt-4 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star - 1];
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-3 tabular-nums">{star}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-[8px]">
                  <div
                    className="h-[8px] rounded-full"
                    style={{ width: `${(count / maxBucket) * 100}%`, backgroundColor: RATING_COLOR }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-5 text-right tabular-nums">{count}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-400">
          No ratings yet — add one from the Performance tab on the Staff page.
        </p>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-1">
        <p>
          {monthRatingCount > 0
            ? `${monthRatingCount} rated this month · avg ${monthAvgRating.toFixed(1)}`
            : "No ratings logged this month"}
          {noteCount > ratingCount && ` · ${noteCount - ratingCount} unrated note${noteCount - ratingCount === 1 ? "" : "s"}`}
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

function EmployeeRatings({ token, month }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    fetch(`${API_URL}/api/staff/analytics/performance?month=${encodeURIComponent(month)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setRows(res.data);
        else setError(res.message || "Failed to load employee ratings.");
      })
      .catch(() => setError("Network error fetching employee ratings."))
      .finally(() => setLoading(false));
  }, [token, month]);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) => {
        if (a.avgRating === null && b.avgRating === null) return a.employee.name.localeCompare(b.employee.name);
        if (a.avgRating === null) return 1;
        if (b.avgRating === null) return -1;
        return b.avgRating - a.avgRating;
      }),
    [rows]
  );

  const summary = useMemo(() => {
    const totalRatings = rows.reduce((sum, r) => sum + r.ratingCount, 0);
    const weighted = rows.reduce((sum, r) => sum + (r.avgRating || 0) * r.ratingCount, 0);
    const ratedThisMonth = rows.reduce((sum, r) => sum + r.monthRatingCount, 0);
    return {
      totalRatings,
      teamAverage: totalRatings > 0 ? Math.round((weighted / totalRatings) * 10) / 10 : null,
      ratedThisMonth
    };
  }, [rows]);

  return (
    <section className="mt-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Employee ratings</h3>
          <p className="text-gray-500 text-sm">
            Lifetime ratings from performance notes, with this month&rsquo;s activity called out.
          </p>
        </div>
        {summary.teamAverage !== null && (
          <p className="text-sm text-gray-500">
            Team average <span className="font-bold text-gray-800">{summary.teamAverage.toFixed(1)}</span>
            <span className="mx-1">·</span>
            {summary.totalRatings} rating{summary.totalRatings === 1 ? "" : "s"}
            <span className="mx-1">·</span>
            {summary.ratedThisMonth} this month
          </p>
        )}
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading && rows.length === 0 ? (
        <p className="text-gray-500">Loading ratings...</p>
      ) : sorted.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          No active employees yet. Add your team from the Staff page.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {sorted.map((row) => (
            <RatingCard key={row.employee._id} row={row} />
          ))}
        </div>
      )}
    </section>
  );
}

export default EmployeeRatings;
