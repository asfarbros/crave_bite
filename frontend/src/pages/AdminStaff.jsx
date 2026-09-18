import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config";
import AttendanceTab from "../components/staff/AttendanceTab";
import ShiftsTab from "../components/staff/ShiftsTab";
import LeaveTab from "../components/staff/LeaveTab";
import PayrollTab from "../components/staff/PayrollTab";
import PerformanceTab from "../components/staff/PerformanceTab";
import DocumentsTab from "../components/staff/DocumentsTab";
import AnalyticsTab from "../components/staff/AnalyticsTab";

const EMPTY_FORM = { name: "", role: "", phone: "", email: "", avatar: "🧑", salaryType: "monthly", baseSalary: "" };

const TABS = [
  { key: "attendance", label: "Attendance" },
  { key: "shifts", label: "Shifts" },
  { key: "leave", label: "Leave" },
  { key: "payroll", label: "Payroll" },
  { key: "performance", label: "Performance" },
  { key: "documents", label: "Documents" },
  { key: "analytics", label: "Analytics" }
];

function AdminStaff() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("attendance");

  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

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
      if (!storedToken || !user || !["admin", "manager"].includes(user.role)) {
        navigate("/");
        return;
      }
      setToken(storedToken);
      setIsAdmin(user.role === "admin");
    } catch {
      navigate("/");
    }
  }, [navigate]);

  const loadEmployees = useCallback(() => {
    if (!token) return;
    setEmployeesLoading(true);
    fetch(`${API_URL}/api/staff`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setEmployees(data.data);
      })
      .catch((err) => console.error("Error loading employees:", err))
      .finally(() => setEmployeesLoading(false));
  }, [token]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

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
        body: JSON.stringify({
          ...formData,
          baseSalary: formData.baseSalary ? Number(formData.baseSalary) : 0
        })
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        loadEmployees();
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
        loadEmployees();
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
            <p className="text-gray-500 text-sm">Attendance, shifts, leave, payroll and more for your team.</p>
          </div>
          {isAdmin && (
            <button
              onClick={openAddModal}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold shadow transition-transform hover:scale-105"
            >
              + Add Employee
            </button>
          )}
        </div>

        <div className="mb-6 border-b border-gray-200 flex flex-wrap gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition ${
                activeTab === tab.key
                  ? "bg-white text-yellow-600 border border-b-0 border-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {employeesLoading && employees.length === 0 ? (
          <p className="text-gray-500">Loading staff...</p>
        ) : (
          <>
            {activeTab === "attendance" && <AttendanceTab token={token} />}
            {activeTab === "shifts" && <ShiftsTab token={token} employees={employees} />}
            {activeTab === "leave" && <LeaveTab token={token} employees={employees} isAdmin={isAdmin} />}
            {activeTab === "payroll" && <PayrollTab token={token} employees={employees} isAdmin={isAdmin} />}
            {activeTab === "performance" && <PerformanceTab token={token} employees={employees} isAdmin={isAdmin} />}
            {activeTab === "documents" && <DocumentsTab token={token} employees={employees} isAdmin={isAdmin} />}
            {activeTab === "analytics" && <AnalyticsTab token={token} />}
          </>
        )}

        {isAdmin && employees.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow overflow-x-auto">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">All Employees</h3>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {employee.avatar} {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{employee.phone}</div>
                      <div className="text-xs text-gray-400">{employee.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{employee.baseSalary || 0} / {employee.salaryType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => setDeactivateId(employee._id)} className="text-red-600 hover:text-red-900">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary Type</label>
                  <select
                    name="salaryType"
                    value={formData.salaryType}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="daily">Daily</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Salary</label>
                  <input
                    name="baseSalary"
                    type="number"
                    min="0"
                    value={formData.baseSalary}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                  />
                </div>
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
