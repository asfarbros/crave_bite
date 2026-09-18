import React, { useEffect, useState, useCallback } from "react";
import { API_URL } from "../../config";

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function DocumentsTab({ token, employees, isAdmin }) {
  const [employeeId, setEmployeeId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const loadDocuments = useCallback(() => {
    if (!token || !employeeId) {
      setDocuments([]);
      return;
    }
    setLoading(true);
    setError("");
    fetch(`${API_URL}/api/staff/documents?employeeId=${employeeId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDocuments(data.data);
        else setError(data.message || "Failed to load documents.");
      })
      .catch(() => setError("Network error fetching documents."))
      .finally(() => setLoading(false));
  }, [token, employeeId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!employeeId || !title || !file) return;
    setUploading(true);
    setError("");
    try {
      const fileBase64 = await fileToBase64(file);
      const res = await fetch(`${API_URL}/api/staff/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ employeeId, title, fileBase64 })
      });
      const data = await res.json();
      if (data.success) {
        setTitle("");
        setFile(null);
        loadDocuments();
      } else {
        setError(data.message || "Failed to upload document.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error uploading document.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    try {
      const res = await fetch(`${API_URL}/api/staff/documents/${employeeId}/${docId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) loadDocuments();
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
          <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input type="text" required placeholder="ID Proof, Contract..." value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">File</label>
              <input type="file" required onChange={(e) => setFile(e.target.files[0])} className="w-full text-sm" />
            </div>
            <button type="submit" disabled={uploading} className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50">
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>
        )}
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {employeeId && (
        <div className="bg-white rounded-xl shadow divide-y divide-gray-200">
          {loading ? (
            <p className="px-6 py-8 text-center text-gray-500">Loading...</p>
          ) : documents.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-500">No documents uploaded yet.</p>
          ) : (
            documents.map((doc) => (
              <div key={doc._id} className="px-6 py-4 flex justify-between items-center gap-4">
                <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">
                  {doc.title}
                </a>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  {isAdmin && (
                    <button onClick={() => handleDelete(doc._id)} className="text-red-600 hover:text-red-900 text-sm">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default DocumentsTab;
