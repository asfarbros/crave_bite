import React, { useEffect, useState, useCallback } from "react";
import { API_URL } from "../../config";

const currentMonth = () => new Date().toISOString().slice(0, 7);

function AnalyticsTab({ token }) {
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(() => {
    if (!token || !month) return;
    setLoading(true);
    setError("");
    fetch(`${API_URL}/api/staff/analytics/attendance?month=${encodeURIComponent(month)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
        else setError(res.message || "Failed to load analytics.");
      })
      .catch(() => setError("Network error fetching analytics."))
      .finally(() => setLoading(false));
  }, [token, month]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-2">Month</label>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm" />
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No data for this month.</td></tr>
            ) : (
              data.map((row) => (
                <tr key={row.employee._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {row.employee.avatar} {row.employee.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap w-64">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                        <div
                          className="bg-yellow-400 h-2.5 rounded-full"
                          style={{ width: `${Math.min(row.attendancePercent, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12">{row.attendancePercent}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.present}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.absent}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.leave}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-semibold">{row.late}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AnalyticsTab;
