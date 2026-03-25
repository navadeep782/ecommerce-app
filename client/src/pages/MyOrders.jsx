import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const API = import.meta.env.VITE_API_URL;

// ✅ 4-step display mapping
const getDisplayStep = (status) => {
  switch (status) {
    case "pending": return 0;
    case "confirmed": return 1;
    case "processing": return 1;
    case "shipped": return 2;
    case "delivered": return 3;
    default: return 0;
  }
};

// ✅ 4 steps only — matches Orders.jsx exactly
const TRACK_STEPS = [
  { key: "pending", label: "Order Placed", icon: "📋" },
  { key: "confirmed", label: "Confirmed", icon: "✅" },
  { key: "shipped", label: "Shipped", icon: "🚚" },
  { key: "delivered", label: "Delivered", icon: "🏠" },
];

function OrderTracker({ status }) {
  const currentStep = getDisplayStep(status);
  const isCancelled = status === "cancelled";

  if (isCancelled) {
    return (
      <div className="mt-3 bg-red-50 rounded-xl p-3 flex items-center gap-2">
        <span className="text-red-500 text-lg">❌</span>
        <p className="text-sm font-semibold text-red-600">Order Cancelled</p>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between">
        {TRACK_STEPS.map((step, i) => (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= currentStep
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 text-gray-400"
                }`}>
                {i < currentStep ? "✓" : step.icon}
              </div>
              <p className={`text-[10px] mt-1 font-medium capitalize text-center ${i <= currentStep ? "text-emerald-600" : "text-gray-400"
                }`}>
                {step.label}
              </p>
            </div>
            {i < TRACK_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 mx-0.5 transition-all ${i < currentStep ? "bg-emerald-400" : "bg-gray-200"
                }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusToast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed top-20 right-4 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 max-w-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">
          🔔
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800">Order Update</p>
          <p className="text-xs text-gray-500 mt-0.5">{message}</p>
        </div>
        <button onClick={onClose} className="ml-auto text-gray-300 hover:text-gray-500 text-lg">×</button>
      </div>
    </div>
  );
}

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const { userInfo } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const token = userInfo?.token ||
    JSON.parse(localStorage.getItem("userInfo"))?.token;

  const userId = userInfo?.user?._id ||
    JSON.parse(localStorage.getItem("userInfo"))?.user?._id;

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API}/api/orders/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const sorted = (Array.isArray(data) ? data : [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sorted);
    } catch (err) {
      console.error("❌ Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial fetch
  useEffect(() => {
    if (token) fetchOrders();
    else setLoading(false);
  }, [token]);

  // ✅ Auto refresh every 10 seconds
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // ✅ Socket for real-time updates
  useEffect(() => {
    if (!userId) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL);

    socket.on("connect", () => {
      socket.emit("join", userId);
    });

    // ✅ Refetch from DB instead of local state update
    socket.on("orderStatusUpdated", (data) => {
      fetchOrders();
      setToast(data.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const paymentColor = (status) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-700";
      case "failed": return "bg-red-100 text-red-700";
      case "refund in progress": return "bg-orange-100 text-orange-700";
      case "refunded": return "bg-blue-100 text-blue-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  // ✅ Payment label — COD shows "Pay on delivery" not "Payment Pending"
  const paymentLabel = (order) => {
    if (order.paymentMethod === "COD" && order.paymentStatus === "pending") {
      return "💵 Pay on delivery";
    }
    switch (order.paymentStatus) {
      case "paid": return "✅ Paid";
      case "failed": return "❌ Payment Failed";
      case "refund in progress": return "🟠 Refund in Progress";
      case "refunded": return "🔵 Refunded";
      default: return "⏳ Payment Pending";
    }
  };

  // ✅ Payment badge color — COD pending shows neutral not yellow warning
  const paymentBadgeColor = (order) => {
    if (order.paymentMethod === "COD" && order.paymentStatus === "pending") {
      return "bg-gray-100 text-gray-600";
    }
    return paymentColor(order.paymentStatus);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {toast && (
        <StatusToast
          message={toast}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
            <p className="text-sm text-gray-400 mt-1">
              {loading ? "Loading..." : `${orders.length} order${orders.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-sm bg-black text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            + New Order
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-3xl shadow-sm flex flex-col items-center justify-center py-20">
            <p className="text-6xl mb-4">📦</p>
            <h2 className="text-xl font-bold text-gray-700 mb-2">No orders yet</h2>
            <p className="text-gray-400 text-sm mb-6">Start shopping to see your orders here</p>
            <button
              onClick={() => navigate("/")}
              className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        )}

        {/* Orders */}
        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-400">Order ID</p>
                    <p className="font-mono text-sm font-bold text-gray-700">
                      #{order._id?.slice(-10).toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {order.paymentMethod === "COD" ? "💵 COD" : "💳 Online"}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-3">
                  {order.orderItems?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img
                        src={item.image || "https://via.placeholder.com/40"}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-xl flex-shrink-0 bg-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-700">
                        ₹{(item.price * item.qty).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ✅ 4-step Order Tracking */}
                <OrderTracker status={order.orderStatus} />

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between flex-wrap gap-2">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${paymentBadgeColor(order)}`}>
                    {paymentLabel(order)}
                  </span>
                  <p className="text-base font-bold text-gray-800">
                    ₹{order.totalPrice?.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default MyOrders;