import React, { useState } from "react";
import TrendChart from "./TrendChart";
import { Card, StatTile, EmptyState } from "./ui";
import { VIZ, formatCurrency, formatNumber, percentChange } from "./format";

function TopItems({ items }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  if (items.length === 0) return <EmptyState>Nothing sold in this period.</EmptyState>;

  const maxRevenue = Math.max(...items.map((i) => i.revenue));

  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li
          key={item.name}
          onMouseEnter={() => setHoverIdx(i)}
          onMouseLeave={() => setHoverIdx(null)}
          onFocus={() => setHoverIdx(i)}
          onBlur={() => setHoverIdx(null)}
          tabIndex={0}
          className="outline-none rounded"
        >
          <div className="flex justify-between text-sm mb-1 gap-2">
            <span className="text-gray-700 font-medium truncate">
              <span className="text-gray-300 tabular-nums mr-1.5">{i + 1}</span>
              {item.name}
            </span>
            <span className="text-gray-500 shrink-0 tabular-nums">{formatCurrency(item.revenue)}</span>
          </div>
          <div className="w-full rounded-full h-[10px]" style={{ backgroundColor: VIZ.track }}>
            <div
              className="h-[10px] rounded-full transition-all"
              style={{
                width: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0}%`,
                backgroundColor: VIZ.revenue,
                opacity: hoverIdx === i ? 1 : 0.85
              }}
            />
          </div>
          <p className={`text-xs mt-1 ${hoverIdx === i ? "text-gray-500" : "text-gray-400"}`}>
            {formatNumber(item.quantity)} sold · {formatNumber(item.orders)} order{item.orders === 1 ? "" : "s"}
          </p>
        </li>
      ))}
    </ol>
  );
}

function OverviewPanel({ data }) {
  const { totals, previous, series, topItems, period } = data;
  const deltaLabel = previous?.label;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Total sales"
          value={formatCurrency(totals.totalSales)}
          delta={previous ? percentChange(totals.totalSales, previous.totalSales) : null}
          deltaLabel={deltaLabel}
          sub={period.label}
        />
        <StatTile
          label="Orders"
          value={formatNumber(totals.orderCount)}
          delta={previous ? percentChange(totals.orderCount, previous.orderCount) : null}
          deltaLabel={deltaLabel}
          sub={period.label}
        />
        <StatTile
          label="Avg. order value"
          value={formatCurrency(totals.avgOrderValue)}
          delta={previous ? percentChange(totals.avgOrderValue, previous.avgOrderValue) : null}
          deltaLabel={deltaLabel}
          sub={period.label}
        />
        <StatTile
          label="Items sold"
          value={formatNumber(totals.itemsSold)}
          delta={previous ? percentChange(totals.itemsSold, previous.itemsSold) : null}
          deltaLabel={deltaLabel}
          sub={period.label}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Sales trend" subtitle={period.label}>
          <TrendChart series={series} />
        </Card>
        <Card title="Top selling items" subtitle="By revenue">
          <TopItems items={topItems} />
        </Card>
      </div>
    </div>
  );
}

export default OverviewPanel;
