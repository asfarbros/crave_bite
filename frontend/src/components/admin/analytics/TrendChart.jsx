import React, { useState } from "react";
import { VIZ, formatCompactCurrency, formatCurrency, formatNumber } from "./format";
import { EmptyState } from "./ui";

const W = 800;
const H = 240;
const PAD_L = 52;
const PAD_R = 14;
const PAD_T = 16;
const PAD_B = 30;

const niceMax = (max) => {
  if (max <= 0) return 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  const residual = max / magnitude;
  let step = 1;
  if (residual > 5) step = 10;
  else if (residual > 2) step = 5;
  else if (residual > 1) step = 2;
  return step * magnitude;
};

const METRICS = [
  { key: "total", label: "Revenue", color: VIZ.revenue },
  { key: "orders", label: "Orders", color: VIZ.accent }
];

function TrendChart({ series }) {
  const [metricKey, setMetricKey] = useState("total");
  const [hoverIdx, setHoverIdx] = useState(null);

  const metric = METRICS.find((m) => m.key === metricKey);
  const isCurrency = metricKey === "total";
  const formatValue = (v) => (isCurrency ? formatCurrency(v) : formatNumber(v));
  const formatTick = (v) => (isCurrency ? formatCompactCurrency(v) : formatNumber(v));

  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const maxVal = niceMax(Math.max(...series.map((p) => p[metricKey]), 0));

  const xFor = (i) => PAD_L + (series.length > 1 ? (i / (series.length - 1)) * plotW : plotW / 2);
  const yFor = (v) => PAD_T + plotH - (v / maxVal) * plotH;

  const linePath = series.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p[metricKey])}`).join(" ");
  const areaPath = series.length
    ? `${linePath} L ${xFor(series.length - 1)} ${PAD_T + plotH} L ${xFor(0)} ${PAD_T + plotH} Z`
    : "";

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxVal * f));
  const labelEvery = Math.max(1, Math.ceil(series.length / 10));

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    let best = Infinity;
    series.forEach((p, i) => {
      const dist = Math.abs(xFor(i) - x);
      if (dist < best) {
        best = dist;
        nearest = i;
      }
    });
    setHoverIdx(nearest);
  };

  const toggle = (
    <div className="inline-flex bg-gray-100 rounded-lg p-0.5 shrink-0">
      {METRICS.map((m) => (
        <button
          key={m.key}
          onClick={() => setMetricKey(m.key)}
          aria-pressed={metricKey === m.key}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
            metricKey === m.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );

  if (series.length === 0) {
    return (
      <>
        <div className="flex justify-end mb-2">{toggle}</div>
        <EmptyState>No orders in this period.</EmptyState>
      </>
    );
  }

  const hovered = hoverIdx !== null ? series[hoverIdx] : null;
  const tooltipLeft = Math.min(92, Math.max(8, (xFor(hoverIdx ?? 0) / W) * 100));

  return (
    <div>
      <div className="flex justify-end mb-2">{toggle}</div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIdx(null)}
        >
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={PAD_L} x2={W - PAD_R} y1={yFor(t)} y2={yFor(t)} stroke={VIZ.grid} strokeWidth="1" />
              <text x={PAD_L - 10} y={yFor(t)} textAnchor="end" dominantBaseline="middle" fontSize="10" fill={VIZ.muted}>
                {formatTick(t)}
              </text>
            </g>
          ))}

          <line x1={PAD_L} x2={W - PAD_R} y1={H - PAD_B} y2={H - PAD_B} stroke={VIZ.axis} strokeWidth="1" />

          {series.map((p, i) =>
            i % labelEvery === 0 || i === series.length - 1 ? (
              <text key={p.key} x={xFor(i)} y={H - PAD_B + 16} textAnchor="middle" fontSize="10" fill={VIZ.muted}>
                {p.label}
              </text>
            ) : null
          )}

          <path d={areaPath} fill={metric.color} opacity="0.1" />
          <path
            d={linePath}
            fill="none"
            stroke={metric.color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {hoverIdx !== null && (
            <line x1={xFor(hoverIdx)} x2={xFor(hoverIdx)} y1={PAD_T} y2={H - PAD_B} stroke={VIZ.axis} strokeWidth="1" />
          )}

          {series.map((p, i) =>
            i === series.length - 1 || i === hoverIdx ? (
              <circle
                key={p.key}
                cx={xFor(i)}
                cy={yFor(p[metricKey])}
                r="4"
                fill={metric.color}
                stroke={VIZ.surface}
                strokeWidth="2"
              />
            ) : null
          )}
        </svg>

        {hovered && (
          <div
            className="absolute pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg -translate-x-1/2 whitespace-nowrap"
            style={{ left: `${tooltipLeft}%`, top: 0 }}
          >
            <p className="font-semibold">{formatValue(hovered[metricKey])}</p>
            <p className="text-gray-300">
              {hovered.label} · {formatNumber(hovered.orders)} order{hovered.orders === 1 ? "" : "s"}
            </p>
          </div>
        )}
      </div>

      <details className="mt-3">
        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-800 select-none">View data</summary>
        <div className="mt-2 max-h-48 overflow-y-auto border border-gray-100 rounded-lg">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-500">Period</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">Revenue</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {series.map((p) => (
                <tr key={p.key}>
                  <td className="px-3 py-1.5 text-gray-600">{p.label}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-gray-700">{formatCurrency(p.total)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-gray-700">{formatNumber(p.orders)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

export default TrendChart;
