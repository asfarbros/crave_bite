import React, { useEffect, useMemo, useState, useCallback } from "react";
import { API_URL } from "../../config";

const CHART_W = 800;
const CHART_H = 220;
const PAD_L = 44;
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 28;
const LINE_COLOR = "#2a78d6";
const GRID_COLOR = "#e1e0d9";
const AXIS_COLOR = "#c3c2b7";
const MUTED = "#898781";

const currentMonth = () => new Date().toISOString().slice(0, 7);

const formatCompact = (n) => {
  if (n >= 1000000) return `₹${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
};

const niceMax = (max) => {
  if (max <= 0) return 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  const residual = max / magnitude;
  let niceResidual = 1;
  if (residual > 5) niceResidual = 10;
  else if (residual > 2) niceResidual = 5;
  else if (residual > 1) niceResidual = 2;
  return niceResidual * magnitude;
};

function StatTile({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-semibold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function SalesLineChart({ daily }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  const points = daily;
  const maxVal = niceMax(Math.max(...points.map((p) => p.total), 0));
  const plotW = CHART_W - PAD_L - PAD_R;
  const plotH = CHART_H - PAD_T - PAD_B;

  const xFor = (i) => PAD_L + (points.length > 1 ? (i / (points.length - 1)) * plotW : plotW / 2);
  const yFor = (v) => PAD_T + plotH - (v / maxVal) * plotH;

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.total)}`).join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxVal * f));

  const handleMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CHART_W;
    let nearest = 0;
    let bestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(xFor(i) - x);
      if (dist < bestDist) {
        bestDist = dist;
        nearest = i;
      }
    });
    setHoverIdx(nearest);
  };

  if (points.length === 0) {
    return <p className="text-gray-500 text-sm py-10 text-center">No sales recorded for this month yet.</p>;
  }

  const hovered = hoverIdx !== null ? points[hoverIdx] : null;
  const labelEvery = Math.max(1, Math.ceil(points.length / 8));

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="w-full h-auto"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={PAD_L} x2={CHART_W - PAD_R} y1={yFor(t)} y2={yFor(t)} stroke={GRID_COLOR} strokeWidth="1" />
            <text x={PAD_L - 8} y={yFor(t)} textAnchor="end" dominantBaseline="middle" fontSize="10" fill={MUTED}>
              {formatCompact(t)}
            </text>
          </g>
        ))}

        <line x1={PAD_L} x2={CHART_W - PAD_R} y1={CHART_H - PAD_B} y2={CHART_H - PAD_B} stroke={AXIS_COLOR} strokeWidth="1" />

        {points.map((p, i) =>
          i % labelEvery === 0 || i === points.length - 1 ? (
            <text key={p.date} x={xFor(i)} y={CHART_H - PAD_B + 16} textAnchor="middle" fontSize="10" fill={MUTED}>
              {p.date.slice(8, 10)}
            </text>
          ) : null
        )}

        <path d={linePath} fill="none" stroke={LINE_COLOR} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {hoverIdx !== null && (
          <line
            x1={xFor(hoverIdx)}
            x2={xFor(hoverIdx)}
            y1={PAD_T}
            y2={CHART_H - PAD_B}
            stroke={AXIS_COLOR}
            strokeWidth="1"
          />
        )}

        {points.map((p, i) =>
          i === points.length - 1 || i === hoverIdx ? (
            <circle
              key={p.date}
              cx={xFor(i)}
              cy={yFor(p.total)}
              r="4"
              fill={LINE_COLOR}
              stroke="#fcfcfb"
              strokeWidth="2"
            />
          ) : null
        )}
      </svg>

      {hovered && (
        <div
          className="absolute pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg -translate-x-1/2"
          style={{
            left: `${(xFor(hoverIdx) / CHART_W) * 100}%`,
            top: 0
          }}
        >
          <p className="font-semibold">{formatCompact(hovered.total)}</p>
          <p className="text-gray-300">{hovered.date} · {hovered.orders} order{hovered.orders === 1 ? "" : "s"}</p>
        </div>
      )}
    </div>
  );
}

function TopItemsBarChart({ items }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  if (items.length === 0) {
    return <p className="text-gray-500 text-sm py-10 text-center">No items sold this month yet.</p>;
  }

  const maxRevenue = Math.max(...items.map((i) => i.revenue));

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const widthPct = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
        return (
          <div
            key={item.name}
            className="group"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 font-medium truncate pr-2">{item.name}</span>
              <span className="text-gray-500 shrink-0">{formatCompact(item.revenue)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-[10px]">
              <div
                className="h-[10px] rounded-full transition-all"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: LINE_COLOR,
                  opacity: hoverIdx === i ? 1 : 0.85
                }}
              />
            </div>
            {hoverIdx === i && (
              <p className="text-xs text-gray-400 mt-1">{item.quantity} sold · {formatCompact(item.revenue)} revenue</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SalesAnalytics({ token }) {
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    if (!token || !month) return;
    setLoading(true);
    setError("");
    fetch(`${API_URL}/api/order/analytics/summary?month=${encodeURIComponent(month)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
        else setError(res.message || "Failed to load sales analytics.");
      })
      .catch(() => setError("Network error fetching sales analytics."))
      .finally(() => setLoading(false));
  }, [token, month]);

  useEffect(() => {
    load();
  }, [load]);

  const monthLabel = useMemo(() => {
    if (!month) return "";
    const [y, m] = month.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }, [month]);

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sales Analytics</h2>
          <p className="text-gray-500 text-sm">Revenue and order trends for {monthLabel || "this month"}.</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          max={currentMonth()}
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
        />
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading && !data ? (
        <p className="text-gray-500">Loading analytics...</p>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatTile label="Total sales" value={formatCompact(data.totalSales)} />
            <StatTile label="Orders" value={data.orderCount.toLocaleString()} />
            <StatTile label="Avg. order value" value={formatCompact(data.avgOrderValue)} />
            <StatTile label="Items sold" value={data.itemsSold.toLocaleString()} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
              <h3 className="font-bold text-gray-800 mb-4">Daily sales trend</h3>
              <SalesLineChart daily={data.daily} />
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold text-gray-800 mb-4">Top selling items</h3>
              <TopItemsBarChart items={data.topItems} />
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

export default SalesAnalytics;
