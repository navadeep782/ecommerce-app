import { BASE_URL } from "../../config";
import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";

const API = BASE_URL;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.token;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API}/api/admin/dashboard`, { headers });
      setStats({
        totalUsers: data.totalUsers || 0,
        totalOrders: data.totalOrders || 0,
        totalRevenue: data.totalRevenue || 0,
        totalProducts: data.totalProducts || 0,
      });
      const ordersRes = await axios.get(`${API}/api/admin/orders`, { headers });
      setRecentOrders((ordersRes.data?.orders || []).slice(0, 5));
    } catch (err) {
      console.error("❌ Dashboard fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // ✅ Socket.IO
  useEffect(() => {
    const socket = io(BASE_URL, { withCredentials: true });

    socket.on("connect", () => {
      socket.emit("joinAdmin");
    });

    socket.on("newOrder", (data) => {
      setStats((prev) => ({
        ...prev,
        totalOrders: prev.totalOrders + 1,
        totalRevenue: prev.totalRevenue + (data.totalPrice || 0),
      }));
      setRecentOrders((prev) => [
        {
          _id: data._id,
          user: data.user,
          totalPrice: data.totalPrice,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus || "pending",
          orderStatus: data.orderStatus || "pending",
          createdAt: data.createdAt,
        },
        ...prev.slice(0, 4),
      ]);
      addNotification(`📦 New order from ${data.user?.name || "a customer"}`, "order");
    });

    socket.on("newUser", (data) => {
      setStats((prev) => ({ ...prev, totalUsers: prev.totalUsers + 1 }));
      addNotification(`👤 ${data.message}`, "user");
    });

    socket.on("orderStatusUpdated", (data) => {
      setRecentOrders((prev) =>
        prev.map((o) =>
          o._id === data.orderId ? { ...o, orderStatus: data.orderStatus } : o
        )
      );
    });

    return () => socket.disconnect();
  }, []);

  const addNotification = (message, type) => {
    const id = Date.now();
    setNotifications((prev) => [{ id, message, type }, ...prev.slice(0, 3)]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

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

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      bg: "from-blue-500 to-blue-600",
      icon: "👥",
      sub: "Registered accounts",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      bg: "from-emerald-500 to-emerald-600",
      icon: "📦",
      sub: "All time orders",
    },
    {
      label: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      bg: "from-violet-500 to-violet-600",
      icon: "💰",
      sub: "From paid orders",
    },
    {
      label: "Total Products",
      value: stats.totalProducts,
      bg: "from-orange-500 to-orange-600",
      icon: "🛍️",
      sub: "In catalogue",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      {/* ✅ Notification Stack — fixed top right */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 w-80">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium text-white animate-bounce-once
              ${n.type === "order" ? "bg-emerald-500" : "bg-blue-500"}`}
          >
            <span className="text-lg">{n.type === "order" ? "📦" : "👤"}</span>
            <span>{n.message}</span>
          </div>
        ))}
      </div>

      <div className="p-6 w-full overflow-auto">

        {/* ✅ Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            Welcome back — here's what's happening today
          </p>
        </div>

        {/* ✅ Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {statCards.map((card) => (
              <div
                key={card.label}
                className={`bg-gradient-to-br ${card.bg} text-white rounded-2xl p-5 shadow-sm`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{card.icon}</span>
                  <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                    Live
                  </span>
                </div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-sm font-semibold mt-0.5 opacity-90">{card.label}</p>
                <p className="text-xs opacity-70 mt-0.5">{card.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* ✅ Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div>
              <h2 className="text-base font-bold text-gray-800">Recent Orders</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest 5 orders — updates live</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-400 text-sm">No orders yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Customer</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Method</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Amount</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Payment</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">

                    <td className="px-6 py-4 font-mono text-xs text-gray-400">
                      #{order._id?.slice(-8).toUpperCase()}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                          {order.user?.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="font-medium text-gray-700">
                          {order.user?.name || "N/A"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${order.paymentMethod === "COD"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                        }`}>
                        {order.paymentMethod === "COD" ? "💵 COD" : "💳 Online"}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-bold text-gray-800">
                      ₹{order.totalPrice?.toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${order.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : order.paymentStatus === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                        {order.paymentStatus === "paid" ? "✅ Paid"
                          : order.paymentStatus === "failed" ? "❌ Failed"
                            : "⏳ Pending"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-gray-400">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short",
                        })
                        : "—"}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
