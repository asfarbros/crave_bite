import React, { useMemo, useState } from "react";
import { Card, StatTile, EmptyState } from "./ui";
import { VIZ, formatCurrency, formatNumber } from "./format";

const COLUMNS = [
  { key: "name", label: "Dish", numeric: false },
  { key: "quantity", label: "Units", numeric: true },
  { key: "orders", label: "Orders", numeric: true },
  { key: "revenue", label: "Revenue", numeric: true }
];

function CategoryBreakdown({ foods }) {
  const categories = useMemo(() => {
    const map = {};
    foods.forEach((food) => {
      const name = food.onMenu ? food.category || "Uncategorised" : "Off menu";
      if (!map[name]) map[name] = { name, revenue: 0, quantity: 0 };
      map[name].revenue += food.revenue;
      map[name].quantity += food.quantity;
    });
    return Object.values(map)
      .filter((c) => c.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue);
  }, [foods]);

  if (categories.length === 0) return <EmptyState>No category revenue in this period.</EmptyState>;

  const max = Math.max(...categories.map((c) => c.revenue));

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <div key={category.name}>
          <div className="flex justify-between text-sm mb-1 gap-2">
            <span className="text-gray-700 font-medium truncate">{category.name}</span>
            <span className="text-gray-500 shrink-0 tabular-nums">{formatCurrency(category.revenue)}</span>
          </div>
          <div className="w-full rounded-full h-[10px]" style={{ backgroundColor: VIZ.track }}>
            <div
              className="h-[10px] rounded-full"
              style={{ width: `${(category.revenue / max) * 100}%`, backgroundColor: VIZ.revenue }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{formatNumber(category.quantity)} units</p>
        </div>
      ))}
    </div>
  );
}

function FoodPanel({ foods, periodLabel }) {
  const [sortKey, setSortKey] = useState("revenue");
  const [descending, setDescending] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categoryOptions = useMemo(() => {
    const set = new Set(foods.filter((f) => f.onMenu && f.category).map((f) => f.category));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [foods]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = foods.filter((food) => {
      const matchesTerm = !term || food.name.toLowerCase().includes(term);
      const matchesCategory = category === "all" || food.category === category;
      return matchesTerm && matchesCategory;
    });

    rows.sort((a, b) => {
      if (sortKey === "name") {
        return descending ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
      }
      return descending ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey];
    });
    return rows;
  }, [foods, search, category, sortKey, descending]);

  const stats = useMemo(() => {
    const sold = foods.filter((f) => f.quantity > 0);
    const best = foods.reduce((top, food) => (!top || food.revenue > top.revenue ? food : top), null);
    const unsoldOnMenu = foods.filter((f) => f.onMenu && f.quantity === 0).length;
    const totalUnits = foods.reduce((sum, f) => sum + f.quantity, 0);
    return { soldCount: sold.length, best, unsoldOnMenu, totalUnits, menuSize: foods.filter((f) => f.onMenu).length };
  }, [foods]);

  const toggleSort = (key) => {
    if (key === sortKey) {
      setDescending((prev) => !prev);
    } else {
      setSortKey(key);
      setDescending(key !== "name");
    }
  };

  const exportCsv = () => {
    const header = ["Dish", "Category", "On menu", "Units", "Orders", "Revenue", "Share %"];
    const escape = (value) => `"${String(value).replace(/"/g, '""')}"`;
    const lines = [
      header.join(","),
      ...visible.map((f) =>
        [f.name, f.onMenu ? f.category : "Removed from menu", f.onMenu ? "yes" : "no", f.quantity, f.orders, f.revenue, f.revenueShare]
          .map(escape)
          .join(",")
      )
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `food-performance-${periodLabel.replace(/\s+/g, "-").toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Dishes sold" value={`${stats.soldCount} / ${stats.menuSize}`} sub="Distinct dishes with sales" />
        <StatTile label="Units sold" value={formatNumber(stats.totalUnits)} sub={periodLabel} />
        <StatTile
          label="Best seller"
          value={stats.best && stats.best.revenue > 0 ? stats.best.name : "—"}
          sub={stats.best && stats.best.revenue > 0 ? `${formatCurrency(stats.best.revenue)} · ${stats.best.revenueShare}% of revenue` : "No sales yet"}
        />
        <StatTile label="Unsold on menu" value={formatNumber(stats.unsoldOnMenu)} sub="Dishes with zero sales" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Revenue by category" subtitle={periodLabel}>
          <CategoryBreakdown foods={foods} />
        </Card>

        <Card
          className="lg:col-span-2"
          title="Dish breakdown"
          subtitle={`${visible.length} of ${foods.length} dishes`}
          action={
            <button
              onClick={exportCsv}
              disabled={visible.length === 0}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              Export CSV
            </button>
          }
        >
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="all">All categories</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      aria-sort={sortKey === col.key ? (descending ? "descending" : "ascending") : "none"}
                      className={`py-2 text-xs font-medium text-gray-500 uppercase tracking-wider ${col.numeric ? "text-right" : "text-left"}`}
                    >
                      <button
                        onClick={() => toggleSort(col.key)}
                        className={`inline-flex items-center gap-1 hover:text-gray-800 transition-colors ${sortKey === col.key ? "text-gray-800" : ""}`}
                      >
                        {col.label}
                        <span className={sortKey === col.key ? "opacity-100" : "opacity-0"}>{descending ? "▾" : "▴"}</span>
                      </button>
                    </th>
                  ))}
                  <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-sm text-gray-500">
                      No dishes match your filters.
                    </td>
                  </tr>
                ) : (
                  visible.map((food) => {
                    const unsold = food.quantity === 0;
                    return (
                      <tr key={food.name} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            {food.imageUrl ? (
                              <img src={food.imageUrl} alt="" className="h-9 w-9 rounded-lg object-cover shadow-sm shrink-0" />
                            ) : (
                              <div className="h-9 w-9 rounded-lg bg-gray-100 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className={`font-medium truncate ${unsold ? "text-gray-500" : "text-gray-900"}`}>{food.name}</p>
                              <p className="text-xs text-gray-400 truncate">
                                {food.onMenu ? food.category : "Removed from menu"}
                                {food.onMenu && !food.isAvailable && " · unavailable"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className={`py-3 text-sm text-right tabular-nums ${unsold ? "text-gray-400" : "text-gray-700"}`}>
                          {formatNumber(food.quantity)}
                        </td>
                        <td className={`py-3 text-sm text-right tabular-nums ${unsold ? "text-gray-400" : "text-gray-700"}`}>
                          {formatNumber(food.orders)}
                        </td>
                        <td className={`py-3 pl-4 text-sm text-right tabular-nums font-semibold ${unsold ? "text-gray-400" : "text-gray-900"}`}>
                          {formatCurrency(food.revenue)}
                        </td>
                        <td className="py-3 pl-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-[60px] rounded-full h-[8px]" style={{ backgroundColor: VIZ.track }}>
                              <div
                                className="h-[8px] rounded-full"
                                style={{ width: `${food.revenueShare}%`, backgroundColor: VIZ.revenue }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 tabular-nums w-11 text-right">{food.revenueShare}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default FoodPanel;
