import React, { useEffect, useState, useCallback } from "react";
import { API_URL } from "../../config";

function PerformanceTab({ token, employees, isAdmin }) {
  const [employeeId, setEmployeeId] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [rating, setRating] = useState("");
  const [saving, setSaving] = useState(false);

  const loadNotes = useCallback(() => {
    if (!token || !employeeId) {
      setNotes([]);
      return;
    }
    setLoading(true);
    setError("");
    fetch(`${API_URL}/api/staff/performance?employeeId=${employeeId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNotes(data.data);
        else setError(data.message || "Failed to load performance notes.");
      })
      .catch(() => setError("Network error fetching performance notes."))
      .finally(() => setLoading(false));
  }, [token, employeeId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!employeeId || !note) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/staff/performance`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ employeeId, note, rating: rating ? Number(rating) : undefined })
      });
      const data = await res.json();
      if (data.success) {
        setNote("");
        setRating("");
        loadNotes();
      } else {
        setError(data.message || "Failed to add note.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error adding note.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/staff/performance/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) loadNotes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-2">Employee</label>
        <select
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm mb-4"
        >
          <option value="">Select an employee...</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>{emp.name}</option>
          ))}
        </select>

        {employeeId && (
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Note</label>
              <input type="text" required value={note} onChange={(e) => setNote(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rating (1-5)</label>
              <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <button type="submit" disabled={saving} className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50">
              {saving ? "Saving..." : "Add Note"}
            </button>
          </form>
        )}
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {employeeId && (
        <div className="bg-white rounded-xl shadow divide-y divide-gray-200">
          {loading ? (
            <p className="px-6 py-8 text-center text-gray-500">Loading...</p>
          ) : notes.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-500">No performance notes yet.</p>
          ) : (
            notes.map((n) => (
              <div key={n._id} className="px-6 py-4 flex justify-between items-start gap-4">
                <div>
                  <p className="text-gray-800">{n.note}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {n.rating ? `Rating: ${n.rating}/5 · ` : ""}
                    {n.createdBy ? `by ${n.createdBy} · ` : ""}
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {isAdmin && (
                  <button onClick={() => handleDelete(n._id)} className="text-red-600 hover:text-red-900 text-sm shrink-0">
                    Delete
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default PerformanceTab;
