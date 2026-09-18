import React, { useEffect, useState, useCallback } from "react";
import { API_URL } from "../../config";

const EMPTY_FORM = { employeeId: "", label: "", startTime: "", endTime: "", notes: "" };

function ShiftsTab({ token, employees }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadShifts = useCallback(() => {
    if (!token || !date) return;
    setLoading(true);
    setError("");
    fetch(`${API_URL}/api/staff/shifts?date=${encodeURIComponent(date)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setShifts(data.data);
        else setError(data.message || "Failed to load shifts.");
      })
      .catch(() => setError("Network error fetching shifts."))
      .finally(() => setLoading(false));
  }, [token, date]);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!form.employeeId || !form.startTime || !form.endTime) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/staff/shifts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, date })
      });
      const data = await res.json();
      if (data.success) {
        setForm(EMPTY_FORM);
        loadShifts();
      } else {
        setError(data.message || "Failed to assign shift.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error assigning shift.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/staff/shifts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) loadShifts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-2">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50 mb-4"
        />

        <form onSubmit={handleAssign} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Employee</label>
            <select
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Select...</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
            <input
              type="text"
              placeholder="Morning/Evening"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Start</label>
            <input
              type="time"
              required
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">End</label>
            <input
              type="time"
              required
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
          >
            {saving ? "Saving..." : "Assign Shift"}
          </button>
        </form>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : shifts.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No shifts assigned for this date.</td></tr>
            ) : (
              shifts.map((shift) => (
                <tr key={shift._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {shift.employeeId?.avatar} {shift.employeeId?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shift.label || "—"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shift.startTime} – {shift.endTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleRemove(shift._id)} className="text-red-600 hover:text-red-900">Remove</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ShiftsTab;
