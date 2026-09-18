import React, { useMemo, useState } from "react";

const BAR_COLOR = "#2a78d6";

const formatCurrency = (n) => `₹${Math.round(n).toLocaleString()}`;

const COLUMNS = [
  { key: "name", label: "Dish", numeric: false },
  { key: "quantity", label: "Units sold", numeric: true },
  { key: "orders", label: "Orders", numeric: true },
  { key: "revenue", label: "Revenue", numeric: true }
];

function FoodPerformance({ foods }) {
  const [sortKey, setSortKey] = useState("revenue");
  const [descending, setDescending] = useState(true);

  const sorted = useMemo(() => {
    const rows = [...foods];
    rows.sort((a, b) => {
      if (sortKey === "name") {
        return descending ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
      }
      return descending ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey];
    });
    return rows;
  }, [foods, sortKey, descending]);

  const toggleSort = (key) => {
    if (key === sortKey) {
      setDescending((prev) => !prev);
    } else {
      setSortKey(key);
      setDescending(key !== "name");
    }
  };

  const soldCount = foods.filter((f) => f.quantity > 0).length;

  return (
    <section className="mt-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Food performance</h3>
          <p className="text-gray-500 text-sm">How every dish on the menu sold this month.</p>
        </div>
        <p className="text-sm text-gray-400">
          {soldCount} of {foods.length} dishes sold
        </p>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  aria-sort={sortKey === col.key ? (descending ? "descending" : "ascending") : "none"}
                  className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${col.numeric ? "text-right" : "text-left"}`}
                >
                  <button
                    onClick={() => toggleSort(col.key)}
                    className={`inline-flex items-center gap-1 hover:text-gray-800 transition-colors ${sortKey === col.key ? "text-gray-800" : ""}`}
                  >
                    {col.label}
                    <span className={sortKey === col.key ? "opacity-100" : "opacity-0"}>
                      {descending ? "▾" : "▴"}
                    </span>
                  </button>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                Share of revenue
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No dishes on the menu yet.</td>
              </tr>
            ) : (
              sorted.map((food) => {
                const unsold = food.quantity === 0;
                return (
                  <tr key={food.name} className={unsold ? "bg-gray-50/50" : undefined}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {food.imageUrl ? (
                          <img src={food.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover shadow-sm" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                            n/a
                          </div>
                        )}
                        <div>
                          <p className={`font-medium ${unsold ? "text-gray-500" : "text-gray-900"}`}>{food.name}</p>
                          <p className="text-xs text-gray-400">
                            {food.onMenu ? food.category : "Removed from menu"}
                            {food.onMenu && !food.isAvailable && " · unavailable"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right tabular-nums ${unsold ? "text-gray-400" : "text-gray-700"}`}>
                      {food.quantity}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right tabular-nums ${unsold ? "text-gray-400" : "text-gray-700"}`}>
                      {food.orders}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right tabular-nums font-semibold ${unsold ? "text-gray-400" : "text-gray-900"}`}>
                      {formatCurrency(food.revenue)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-[80px] bg-gray-100 rounded-full h-[10px]">
                          <div
                            className="h-[10px] rounded-full"
                            style={{ width: `${food.revenueShare}%`, backgroundColor: BAR_COLOR }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 tabular-nums w-12 text-right">{food.revenueShare}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default FoodPerformance;
