import React, { useCallback, useEffect, useState } from "react";
import { API_URL } from "../../../config";
import PeriodControl from "./PeriodControl";
import { todayAnchor } from "./periodNav";
import OverviewPanel from "./OverviewPanel";
import FoodPanel from "./FoodPanel";
import EmployeePanel from "./EmployeePanel";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "food", label: "Food performance" },
  { key: "employees", label: "Employee ratings" }
];

function AnalyticsDashboard({ token }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [range, setRange] = useState("month");
  const [anchor, setAnchor] = useState(todayAnchor);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const needsSales = activeTab === "overview" || activeTab === "food";

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    fetch(`${API_URL}/api/order/analytics/summary?range=${range}&anchor=${anchor}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
        else setError(res.message || "Failed to load analytics.");
      })
      .catch(() => setError("Network error fetching analytics."))
      .finally(() => setLoading(false));
  }, [token, range, anchor]);

  useEffect(() => {
    load();
  }, [load]);

  const changeRange = (next) => {
    setRange(next);
    setAnchor(todayAnchor());
  };

  const periodLabel = data?.period?.label || "";

  return (
    <section>
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>
          <p className="text-gray-500 text-sm">Sales, menu and team performance{periodLabel && ` · ${periodLabel}`}</p>
        </div>
        <PeriodControl
          range={range}
          anchor={anchor}
          label={periodLabel}
          onRangeChange={changeRange}
          onAnchorChange={setAnchor}
        />
      </div>

      <div role="tablist" aria-label="Analytics sections" className="flex flex-wrap gap-1 border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-semibold -mb-px border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-yellow-400 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {needsSales && !data && loading && <p className="text-gray-500">Loading analytics...</p>}

      {/* Keep the previous render visible while refetching so the layout never jumps. */}
      <div className={loading && data ? "opacity-60 transition-opacity" : "transition-opacity"}>
        {activeTab === "overview" && data && <OverviewPanel data={data} />}
        {activeTab === "food" && data && <FoodPanel foods={data.foods || []} periodLabel={periodLabel} />}
      </div>

      {activeTab === "employees" && (
        <EmployeePanel token={token} range={range} anchor={anchor} periodLabel={periodLabel || "this period"} />
      )}
    </section>
  );
}

export default AnalyticsDashboard;
