import React, { useEffect, useState, useCallback } from "react";
import { API_URL } from "../../config";

const currentMonth = () => new Date().toISOString().slice(0, 7);

function PayrollTab({ token, employees, isAdmin }) {
  const [month, setMonth] = useState(currentMonth());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [bonus, setBonus] = useState("");
  const [deductions, setDeductions] = useState("");
  const [generating, setGenerating] = useState(false);
  const [payingId, setPayingId] = useState(null);

  const loadRecords = useCallback(() => {
    if (!token || !month) return;
    setLoading(true);
    setError("");
    fetch(`${API_URL}/api/staff/payroll?month=${encodeURIComponent(month)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRecords(data.data);
        else setError(data.message || "Failed to load payroll records.");
      })
      .catch(() => setError("Network error fetching payroll records."))
      .finally(() => setLoading(false));
  }, [token, month]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!employeeId) return;
    setGenerating(true);
    try {
      const res = await fetch(`${API_URL}/api/staff/payroll/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          employeeId,
          month,
          bonus: bonus ? Number(bonus) : 0,
          deductions: deductions ? Number(deductions) : 0
        })
      });
      const data = await res.json();
      if (data.success) {
        setBonus("");
        setDeductions("");
        loadRecords();
      } else {
        setError(data.message || "Failed to generate payroll.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error generating payroll.");
    } finally {
      setGenerating(false);
    }
  };

  const markPaid = async (id) => {
    setPayingId(id);
    try {
      const res = await fetch(`${API_URL}/api/staff/payroll/${id}/pay`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) loadRecords();
    } catch (err) {
      console.error(err);
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div>
      {isAdmin && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Generate Payroll</h3>
          <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Employee</label>
              <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Select...</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
              <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bonus</label>
              <input type="number" min="0" value={bonus} onChange={(e) => setBonus(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Deductions</label>
              <input type="number" min="0" value={deductions} onChange={(e) => setDeductions(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <button type="submit" disabled={generating} className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50">
              {generating ? "Generating..." : "Generate"}
            </button>
          </form>
        </div>
      )}

      {!isAdmin && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">Month</label>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm" />
        </div>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present/Absent/Leave</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonus/Deductions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              {isAdmin && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={isAdmin ? 7 : 6} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={isAdmin ? 7 : 6} className="px-6 py-8 text-center text-gray-500">No payroll records for this month.</td></tr>
            ) : (
              records.map((r) => (
                <tr key={r._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {r.employeeId?.avatar} {r.employeeId?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.presentDays}/{r.absentDays}/{r.leaveDays}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{r.baseSalary}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">+₹{r.bonus} / -₹{r.deductions}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">₹{r.netPay}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${r.status === "paid" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {r.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {r.status === "pending" && (
                        <button disabled={payingId === r._id} onClick={() => markPaid(r._id)} className="text-xs font-bold px-3 py-1.5 rounded-full bg-green-50 text-green-700 hover:bg-green-100">
                          Mark Paid
                        </button>
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

export default PayrollTab;
