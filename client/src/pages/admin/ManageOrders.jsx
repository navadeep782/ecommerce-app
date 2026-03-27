import { BASE_URL } from "../../config";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import AdminSidebar from "../../components/AdminSidebar";

const API = BASE_URL;

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const statusColor = (status) => {
  switch (status) {
    case "delivered": return "bg-green-100 text-green-700";
    case "shipped": return "bg-blue-100 text-blue-700";
    case "confirmed": return "bg-indigo-100 text-indigo-700";
    case "processing": return "bg-orange-100 text-orange-700";
    case "cancelled": return "bg-red-100 text-red-700";
    default: return "bg-yellow-100 text-yellow-700";
  }
};

const statusIcon = (status) => {
  switch (status) {
    case "delivered": return "✅";
    case "shipped": return "🚚";
    case "confirmed": return "✔️";
    case "processing": return "⚙️";
    case "cancelled": return "❌";
    default: return "⏳";
  }
};

const CODModal = ({ order, onConfirm, onClose }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
      <h2 className="text-lg font-bold text-gray-800 mb-2">COD Payment Confirmation</h2>
      <p className="text-sm text-gray-500 mb-1">
        Order <span className="font-mono font-bold">#{order._id?.slice(-8).toUpperCase()}</span>
      </p>
      <p className="text-sm text-gray-500 mb-5">
        Amount: <span className="font-bold text-gray-800">₹{order.totalPrice?.toLocaleString()}</span>
      </p>
      <p className="text-sm font-semibold text-gray-700 mb-4">Did the customer pay at delivery?</p>
      <div className="flex gap-3">
        <button
          onClick={() => onConfirm("delivered", "paid")}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          ✅ Yes, Paid
        </button>
        <button
          onClick={() => onConfirm("cancelled", "pending")}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          ❌ No, Refused
        </button>
      </div>
      <button
        onClick={onClose}
        className="w-full mt-3 border border-gray-200 text-gray-500 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
    </div>
  </div>
);

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [codModal, setCodModal] = useState(null);
  const [newOrderAlert, setNewOrderAlert] = useState(null);

  const socketRef = useRef(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.token;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API}/api/admin/orders`, { headers });
      setOrders(data?.orders || data || []);
    } catch (err) {
      console.error("❌ Fetch orders error:", err.message);
    } finally {
      setLoading(false);
    }
  };


  // ✅ 1. Initial fetch
  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ 2. Auto-refresh every 10 seconds as fallback
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // ✅ 3. Socket for instant updates
  useEffect(() => {
    const socket = io(BASE_URL, {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinAdmin");
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket error:", err.message);
    });

    socket.on("order_updated", () => {
      // ✅ Refetch entire list to get fresh data from DB
      fetchOrders();
    });

    socket.on("newOrder", (order) => {
      fetchOrders(); // ✅ refetch instead of prepend to avoid stale data
      setNewOrderAlert(`New order #${order._id?.slice(-8).toUpperCase()} from ${order.user?.name || "a customer"}`);
      setTimeout(() => setNewOrderAlert(null), 5000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleStatusChange = (order, newStatus) => {
    if (
      order.paymentMethod === "COD" &&
      newStatus === "delivered" &&
      order.paymentStatus !== "paid"
    ) {
      setCodModal(order);
      return;
    }
    updateStatus(order._id, newStatus, null);
  };

  const handleCODConfirm = async (orderStatus, paymentStatus) => {
    const order = codModal;
    setCodModal(null);
    await updateStatus(order._id, orderStatus, paymentStatus);
  };

  const processRefund = async (id) => {
    if (window.confirm("Mark this order as refunded?")) {
      try {
        await axios.put(
          `${API}/api/orders/${id}/refund`,
          {},
          { headers }
        );
        setOrders((prev) =>
          prev.map((o) =>
            o._id === id ? { ...o, paymentStatus: "refunded" } : o
          )
        );
      } catch (err) {
        alert("Refund failed: " + err.response?.data?.message);
      }
    }
  };

  const updateStatus = async (id, orderStatus, paymentStatus = null) => {
    setUpdating(id);
    try {
      await axios.put(
        `${API}/api/admin/orders/${id}/status`,
        { orderStatus },
        { headers }
      );
      if (paymentStatus) {
        await axios.put(
          `${API}/api/orders/${id}/pay`,
          { id, status: paymentStatus, email: "" },
          { headers }
        );
      }
      setOrders((prev) =>
        prev.map((o) =>
          o._id === id
            ? { ...o, orderStatus, paymentStatus: paymentStatus || o.paymentStatus }
            : o
        )
      );
    } catch (err) {
      console.error("❌ Update error:", err.response?.data || err.message);
      alert("Failed to update: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(null);
    }
  };

  const paymentColor = (status) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-700";
      case "refund in progress": return "bg-orange-100 text-orange-700";
      case "refunded": return "bg-blue-100 text-blue-700";
      case "failed": return "bg-red-100 text-red-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      {codModal && (
        <CODModal
          order={codModal}
          onConfirm={handleCODConfirm}
          onClose={() => setCodModal(null)}
        />
      )}

      {newOrderAlert && (
        <div className="fixed top-5 right-5 z-50 bg-green-500 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 animate-bounce">
          <span>📦</span>
          <span className="text-sm font-semibold">{newOrderAlert}</span>
        </div>
      )}

      <div className="p-6 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manage Orders</h1>
            <p className="text-sm text-gray-400 mt-1">
              {loading ? "Fetching orders..." : `${orders.length} total orders`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-16 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-gray-500">No orders yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-500 text-xs uppercase">Order ID</th>
                  <th className="p-4 font-semibold text-gray-500 text-xs uppercase">Customer</th>
                  <th className="p-4 font-semibold text-gray-500 text-xs uppercase">Method</th>
                  <th className="p-4 font-semibold text-gray-500 text-xs uppercase">Total</th>
                  <th className="p-4 font-semibold text-gray-500 text-xs uppercase">Payment Status</th>
                  <th className="p-4 font-semibold text-gray-500 text-xs uppercase">Order Status</th>
                  <th className="p-4 font-semibold text-gray-500 text-xs uppercase">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => {
                  // ✅ isBlocked — disable dropdown if online payment not paid
                  const isBlocked = order.paymentMethod !== "COD" && order.paymentStatus !== "paid";

                  return (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-mono text-xs text-gray-400">
                        #{order._id?.slice(-8).toUpperCase()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                            {order.user?.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <span className="font-medium text-gray-700">
                            {order.user?.name || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${order.paymentMethod === "COD"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                          }`}>
                          {order.paymentMethod === "COD" ? "💵 COD" : "💳 Online"}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-gray-800">
                        ₹{order.totalPrice?.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${paymentColor(order.paymentStatus)}`}>
                          {order.paymentStatus === "paid" ? "✅ Paid"
                            : order.paymentStatus === "failed" ? "❌ Failed"
                              : order.paymentStatus === "refund in progress" ? "🟠 Refund in Progress"
                                : order.paymentStatus === "refunded" ? "🔵 Refunded"
                                  : "⏳ Pending"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColor(order.orderStatus)}`}>
                          {statusIcon(order.orderStatus)} {order.orderStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        {order.orderStatus === "delivered" || order.orderStatus === "cancelled" ? (
                          <span className="text-xs text-gray-400 italic">Completed</span>
                        ) : (
                          <>
                            <select
                              value={order.orderStatus}
                              onChange={(e) => handleStatusChange(order, e.target.value)}
                              disabled={updating === order._id || isBlocked}
                              title={isBlocked ? "Cannot change status — payment not received" : ""}
                              className={`text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-600 ${updating === order._id || isBlocked
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                                }`}
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s} className="capitalize">
                                  {statusIcon(s)} {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                              ))}
                            </select>

                            {/* ✅ Warning message when blocked */}
                            {isBlocked && (
                              <p className="text-xs text-red-500 mt-1">
                                Payment pending — status locked
                              </p>
                            )}
                          </>
                        )}

                        {updating === order._id && (
                          <span className="text-xs text-gray-400 ml-1">Saving...</span>
                        )}

                        {order.orderStatus === "cancelled" &&
                          order.paymentStatus === "refund in progress" && (
                            <button
                              onClick={() => processRefund(order._id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium mt-1 transition-colors block"
                            >
                              💰 Process Refund
                            </button>
                          )}

                        {order.orderStatus === "cancelled" &&
                          order.paymentStatus === "refunded" && (
                            <span className="text-xs text-blue-600 font-medium">✅ Refunded</span>
                          )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrders;


