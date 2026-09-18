import React, { useEffect, useState, useCallback } from "react";
import { API_URL } from "../../config";

const EMPTY_FORM = { employeeId: "", fromDate: "", toDate: "", reason: "" };

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700"
};

function LeaveTab({ token, employees, isAdmin }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [actingId, setActingId] = useState(null);

  const loadLeaves = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    fetch(`${API_URL}/api/staff/leave`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLeaves(data.data);
        else setError(data.message || "Failed to load leave requests.");
      })
      .catch(() => setError("Network error fetching leave requests."))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employeeId || !form.fromDate || !form.toDate || !form.reason) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/staff/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setForm(EMPTY_FORM);
        loadLeaves();
      } else {
        setError(data.message || "Failed to submit leave request.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error submitting leave request.");
    } finally {
      setSaving(false);
    }
  };

  const review = async (id, status) => {
    setActingId(id);
    try {
      const res = await fetch(`${API_URL}/api/staff/leave/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) loadLeaves();
    } catch (err) {
      console.error(err);
    } finally {
      setActingId(null);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">New Leave Request</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
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
            <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
            <input type="date" required value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
            <input type="date" required value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
            <input type="text" required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <button type="submit" disabled={saving} className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50">
            {saving ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              {isAdmin && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={isAdmin ? 5 : 4} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : leaves.length === 0 ? (
              <tr><td colSpan={isAdmin ? 5 : 4} className="px-6 py-8 text-center text-gray-500">No leave requests yet.</td></tr>
            ) : (
              leaves.map((leave) => (
                <tr key={leave._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {leave.employeeId?.avatar} {leave.employeeId?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.fromDate} → {leave.toDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{leave.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_STYLES[leave.status]}`}>
                      {leave.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      {leave.status === "pending" ? (
                        <>
                          <button disabled={actingId === leave._id} onClick={() => review(leave._id, "approved")} className="text-xs font-bold px-3 py-1.5 rounded-full bg-green-50 text-green-700 hover:bg-green-100">
                            Approve
                          </button>
                          <button disabled={actingId === leave._id} onClick={() => review(leave._id, "rejected")} className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-50 text-red-700 hover:bg-red-100">
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">Reviewed{leave.reviewedBy ? ` by ${leave.reviewedBy}` : ""}</span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeaveTab;
