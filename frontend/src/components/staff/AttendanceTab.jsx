import React, { useEffect, useState, useCallback } from "react";
import { API_URL } from "../../config";

const STATUS_STYLES = {
  present: "bg-green-100 text-green-700",
  absent: "bg-red-100 text-red-700",
  leave: "bg-yellow-100 text-yellow-700"
};

function AttendanceTab({ token }) {
  const [attendance, setAttendance] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState(null);
  const [checkInDrafts, setCheckInDrafts] = useState({});

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
        body: JSON.stringify({
          employeeId,
          date,
          status,
          checkInTime: status === "present" ? checkInDrafts[employeeId] || "" : ""
        })
      });
      const data = await res.json();
      if (data.success) {
        setAttendance((prev) =>
          prev.map((row) =>
            row.employee._id === employeeId
              ? { ...row, status: data.data.status, checkInTime: data.data.checkInTime, late: data.data.late }
              : row
          )
        );
      }
    } catch (err) {
      console.error("Error marking attendance:", err);
    } finally {
      setMarkingId(null);
    }
  };

  const presentCount = attendance.filter((r) => r.status === "present").length;
  const absentCount = attendance.filter((r) => r.status === "absent").length;
  const leaveCount = attendance.filter((r) => r.status === "leave").length;
  const unmarkedCount = attendance.filter((r) => !r.status).length;
  const lateCount = attendance.filter((r) => r.late).length;

  return (
    <div>
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
          <span className="bg-orange-50 text-orange-700 font-semibold px-3 py-1.5 rounded-full">Late: {lateCount}</span>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Mark Attendance</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : attendance.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No employees found. Add one to get started.</td>
              </tr>
            ) : (
              attendance.map(({ employee, status, checkInTime, late }) => (
                <tr key={employee._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {employee.avatar} {employee.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status ? STATUS_STYLES[status] : "bg-gray-100 text-gray-500"}`}>
                      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Not marked"}
                    </span>
                    {late && <span className="ml-2 text-xs font-semibold text-orange-600">Late</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input
                      type="time"
                      value={checkInDrafts[employee._id] ?? checkInTime ?? ""}
                      onChange={(e) => setCheckInDrafts((prev) => ({ ...prev, [employee._id]: e.target.value }))}
                      className="px-2 py-1 border border-gray-200 rounded text-xs"
                    />
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AttendanceTab;
