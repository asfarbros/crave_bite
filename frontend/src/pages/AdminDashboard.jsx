import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config";

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

const EMPTY_FORM = {
  id: "",
  name: "",
  description: "",
  price: "",
  category: "",
  isAvailable: true
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [tab, setTab] = useState("menu");

  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tableBookings, setTableBookings] = useState([]);
  const [hallBookings, setHallBookings] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formFile, setFormFile] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Security check before rendering, mirroring admin.html
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

  const loadMenu = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/foods?all=true`);
      const data = await res.json();
      if (data.success) {
        setFoods(data.data);
      }
    } catch (error) {
      console.error("Error loading menu:", error);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/order/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  }, [token]);

  const loadTableBookings = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/booking/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTableBookings(data.data);
      }
    } catch (error) {
      console.error("Error loading table bookings:", error);
    }
  }, [token]);

  const loadHallBookings = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/hall-booking/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHallBookings(data.data);
      }
    } catch (error) {
      console.error("Error loading hall bookings:", error);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (tab === "menu") loadMenu();
    if (tab === "orders") loadOrders();
    if (tab === "tables") loadTableBookings();
    if (tab === "halls") loadHallBookings();
  }, [tab, token, loadMenu, loadOrders, loadTableBookings, loadHallBookings]);

  const adminLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const openAddModal = () => {
    setFormData(EMPTY_FORM);
    setFormFile(null);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (food) => {
    setFormData({
      id: food._id,
      name: food.name,
      description: food.description || "",
      price: food.price,
      category: food.category,
      isAvailable: food.isAvailable
    });
    setFormFile(null);
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFoodSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      let imageBase64 = null;
      if (formFile) {
        imageBase64 = await toBase64(formFile);
      }

      if (!formData.id && !imageBase64) {
        setFormError("Please select an image.");
        setSaving(false);
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category
      };

      if (imageBase64) payload.imageBase64 = imageBase64;
      if (formData.id) payload.isAvailable = formData.isAvailable;

      const method = formData.id ? "PUT" : "POST";
      const url = formData.id ? `${API_URL}/api/foods/${formData.id}` : `${API_URL}/api/foods`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        loadMenu();
      } else {
        setFormError(data.message || "Error saving dish");
      }
    } catch (error) {
      console.error(error);
      setFormError("Network error occurred");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/foods/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDeleteId(null);
        loadMenu();
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(false);
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
          <nav className="flex items-center space-x-6 text-gray-700 font-medium">
            <button
              onClick={() => setTab("menu")}
              className={tab === "menu" ? "text-yellow-600 font-bold transition-colors" : "hover:text-yellow-500 transition-colors"}
            >
              Menu Management
            </button>
            <button
              onClick={() => setTab("orders")}
              className={tab === "orders" ? "text-yellow-600 font-bold transition-colors" : "hover:text-yellow-500 transition-colors"}
            >
              Orders
            </button>
            <button
              onClick={() => setTab("tables")}
              className={tab === "tables" ? "text-yellow-600 font-bold transition-colors" : "hover:text-yellow-500 transition-colors"}
            >
              Tables
            </button>
            <button
              onClick={() => setTab("halls")}
              className={tab === "halls" ? "text-yellow-600 font-bold transition-colors" : "hover:text-yellow-500 transition-colors"}
            >
              Halls
            </button>
            <Link
              to="/admin/available-tables"
              className="hover:text-yellow-500 transition-colors"
            >
              Available Tables
            </Link>
            <Link
              to="/admin/staff"
              className="hover:text-yellow-500 transition-colors"
            >
              Staff
            </Link>
            <button
              onClick={adminLogout}
              className="text-red-500 hover:text-red-600 font-semibold transition-colors ml-4 border-l pl-4 border-gray-300"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-6">
        {tab === "menu" && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Menu Management</h2>
              <button
                onClick={openAddModal}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold shadow transition-transform hover:scale-105"
              >
                + Add New Dish
              </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {foods.map((food) => (
                    <tr key={food._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img src={food.imageUrl} alt={food.name} className="h-12 w-12 rounded-lg object-cover shadow-sm" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{food.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{food.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{food.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${food.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {food.isAvailable ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => openEditModal(food)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                          Edit
                        </button>
                        <button onClick={() => setDeleteId(food._id)} className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "orders" && (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Orders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.length === 0 ? (
                <p className="text-gray-500 col-span-full">No orders found.</p>
              ) : (
                orders.map((order) => {
                  const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                  return (
                    <div key={order._id} className="bg-white p-6 rounded-xl shadow-md border-t-4 border-yellow-400 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <p className="text-sm text-gray-500">
                            Order ID: <br />
                            <span className="font-mono text-xs">{order._id}</span>
                          </p>
                          <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded border">Placed</span>
                        </div>
                        <p className="text-sm font-bold text-gray-800 mb-2">User ID: {order.userId}</p>
                        <p className="text-xs text-gray-500 mb-3">{new Date(order.createdAt).toLocaleString()}</p>
                        <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto mb-4 border">
                          <ul className="space-y-1 text-sm text-gray-700">
                            {order.items.map((item, i) => (
                              <li key={i}>
                                <span className="font-bold">{item.quantity}x</span> {item.name} - ₹{item.price}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="pt-4 flex justify-between items-center">
                        <p className="font-bold text-green-700">Total: ₹{total}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {tab === "tables" && (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Booked Tables</h2>
            <div className="bg-white rounded-xl shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked On</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableBookings.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-8 text-center text-gray-500">No table bookings found.</td>
                    </tr>
                  ) : (
                    tableBookings.map((booking) => (
                      <tr key={booking._id}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{booking.tableIcon} {booking.tableName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">#{booking.tableNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.guests}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{booking.phone}</div>
                          <div className="text-xs text-gray-400">{booking.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate" title={booking.requests}>{booking.requests || "—"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">{new Date(booking.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "halls" && (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Booked Halls</h2>
            <div className="bg-white rounded-xl shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hall</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked On</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hallBookings.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-8 text-center text-gray-500">No hall bookings found.</td>
                    </tr>
                  ) : (
                    hallBookings.map((booking) => (
                      <tr key={booking._id}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{booking.hallIcon} {booking.hallName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.eventType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.guestCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{booking.phone}</div>
                          <div className="text-xs text-gray-400">{booking.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate" title={booking.requests}>{booking.requests || "—"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">{new Date(booking.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-6 text-gray-800">{formData.id ? "Edit Dish" : "Add New Dish"}</h3>

            <form onSubmit={handleFoodSubmit} className="space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    name="price"
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    name="category"
                    type="text"
                    required
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormFile(e.target.files[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                />
                {formData.id && <p className="text-xs text-gray-500 mt-1">Leave blank to keep existing image</p>}
              </div>

              {formData.id && (
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleFormChange}
                    className="h-4 w-4 text-yellow-500 rounded focus:ring-yellow-400"
                  />
                  <label className="ml-2 block text-sm text-gray-700">Available</label>
                </div>
              )}

              {formError && <div className="text-red-500 text-sm">{formError}</div>}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2 rounded-lg font-bold transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Dish"}
              </button>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => setDeleteId(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-red-600">Delete Dish</h2>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this dish? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition">
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
