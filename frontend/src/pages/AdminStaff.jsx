import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config";

const EMPTY_FORM = { name: "", role: "", phone: "", email: "", avatar: "🧑" };

const STATUS_STYLES = {
  present: "bg-green-100 text-green-700",
  absent: "bg-red-100 text-red-700",
  leave: "bg-yellow-100 text-yellow-700"
};

function AdminStaff() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);

  const [attendance, setAttendance] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deactivateId, setDeactivateId] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    try {
      const user = userStr ? JSON.parse(userStr) : null;
      if (!storedToken || !user || user.role !== "admin") {
        navigate("/");
        return;
      }
      setToken(storedToken);
    } catch {
      navigate("/");
    }
  }, [navigate]);

  const loadAttendance = useCallback(() => {
    if (!token || !date) return;
    setLoading(true);
    setError("");
    fetch(`${API_URL}/api/staff/attendance?date=${encodeURIComponent(date)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAttendance(data.data);
        } else {
          setError(data.message || "Failed to load staff attendance.");
        }
      })
      .catch(() => setError("Network error fetching attendance."))
      .finally(() => setLoading(false));
  }, [token, date]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const markAttendance = async (employeeId, status) => {
    setMarkingId(employeeId);
    try {
      const res = await fetch(`${API_URL}/api/staff/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ employeeId, date, status })
      });
      const data = await res.json();
      if (data.success) {
        setAttendance((prev) =>
          prev.map((row) =>
            row.employee._id === employeeId ? { ...row, status: data.data.status } : row
          )
        );
      }
    } catch (err) {
      console.error("Error marking attendance:", err);
    } finally {
      setMarkingId(null);
    }
  };

  const openAddModal = () => {
    setFormData(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      const res = await fetch(`${API_URL}/api/staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        loadAttendance();
      } else {
        setFormError(data.message || "Error adding employee");
      }
    } catch (err) {
      console.error(err);
      setFormError("Network error occurred");
    } finally {
      setSaving(false);
    }
  };

  const confirmDeactivate = async () => {
    if (!deactivateId) return;
    setDeactivating(true);
    try {
      const res = await fetch(`${API_URL}/api/staff/${deactivateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: false })
      });
      if (res.ok) {
        setDeactivateId(null);
        loadAttendance();
      }
    } catch (err) {
      console.error("Deactivate failed:", err);
    } finally {
      setDeactivating(false);
    }
  };

  if (!token) {
    return null;
  }

  const presentCount = attendance.filter((r) => r.status === "present").length;
  const absentCount = attendance.filter((r) => r.status === "absent").length;
  const leaveCount = attendance.filter((r) => r.status === "leave").length;
  const unmarkedCount = attendance.filter((r) => !r.status).length;

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold pacifico text-yellow-500">
            CraveBite <span className="text-lg text-gray-400 font-sans">Admin</span>
          </h1>
          <Link to="/admin" className="text-sm font-semibold text-gray-600 hover:text-yellow-600 transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>
            <p className="text-gray-500 text-sm">Mark daily attendance and manage your team.</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold shadow transition-transform hover:scale-105"
          >
            + Add Employee
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50"
            />
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="bg-green-50 text-green-700 font-semibold px-3 py-1.5 rounded-full">Present: {presentCount}</span>
            <span className="bg-red-50 text-red-700 font-semibold px-3 py-1.5 rounded-full">Absent: {absentCount}</span>
            <span className="bg-yellow-50 text-yellow-700 font-semibold px-3 py-1.5 rounded-full">On Leave: {leaveCount}</span>
            <span className="bg-gray-100 text-gray-600 font-semibold px-3 py-1.5 rounded-full">Unmarked: {unmarkedCount}</span>
          </div>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Mark Attendance</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : attendance.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No employees found. Add one to get started.</td>
                </tr>
              ) : (
                attendance.map(({ employee, status }) => (
                  <tr key={employee._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {employee.avatar} {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{employee.phone}</div>
                      <div className="text-xs text-gray-400">{employee.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status ? STATUS_STYLES[status] : "bg-gray-100 text-gray-500"}`}>
                        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Not marked"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => markAttendance(employee._id, "present")}
                        disabled={markingId === employee._id}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full transition ${status === "present" ? "bg-green-500 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => markAttendance(employee._id, "absent")}
                        disabled={markingId === employee._id}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full transition ${status === "absent" ? "bg-red-500 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"}`}
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => markAttendance(employee._id, "leave")}
                        disabled={markingId === employee._id}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full transition ${status === "leave" ? "bg-yellow-500 text-white" : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"}`}
                      >
                        Leave
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => setDeactivateId(employee._id)} className="text-red-600 hover:text-red-900">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Add Employee</h3>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  name="role"
                  type="text"
                  required
                  placeholder="e.g. Waiter, Chef, Manager"
                  value={formData.role}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avatar (emoji)</label>
                  <input
                    name="avatar"
                    type="text"
                    maxLength="2"
                    value={formData.avatar}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                />
              </div>

              {formError && <div className="text-red-500 text-sm">{formError}</div>}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2 rounded-lg font-bold transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Add Employee"}
              </button>
            </form>
          </div>
        </div>
      )}

      {deactivateId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => setDeactivateId(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-red-600">Remove Employee</h2>
            <p className="text-gray-700 mb-6">This will mark the employee as inactive and hide them from the staff list. This does not delete their attendance history.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setDeactivateId(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition">
                Cancel
              </button>
              <button
                onClick={confirmDeactivate}
                disabled={deactivating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50"
              >
                {deactivating ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStaff;
