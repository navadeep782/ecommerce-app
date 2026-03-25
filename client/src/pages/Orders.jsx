import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCart } from "../redux/cartSlice";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// ✅ Same display step logic as MyOrders
const getDisplayStep = (status) => {
  switch (status) {
    case "pending": return 0;
    case "confirmed": return 1;
    case "processing": return 1; // processing shows as confirmed
    case "shipped": return 2;
    case "delivered": return 3;
    default: return 0;
  }
};

function Orders() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [waitingForPayment, setWaitingForPayment] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }

    const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
    if (!token) { setLoading(false); return; }

    const headers = { Authorization: `Bearer ${token}` };
    const pollRef = { current: null };
    let attempts = 0;
    const MAX_ATTEMPTS = 15;

    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(
          `${API}/api/orders/${orderId}`,
          { headers }
        );

        setOrder(data);
        setLoading(false);

        if (data.paymentStatus === "paid") {
          setWaitingForPayment(false);
          dispatch(clearCart());
          localStorage.removeItem("cartItems");
          clearInterval(pollRef.current);
          return;
        }

        // ✅ COD orders don't need payment polling
        if (data.paymentMethod === "COD") {
          setWaitingForPayment(false);
          clearInterval(pollRef.current);
          return;
        }

        attempts++;
        setWaitingForPayment(true);

        if (attempts >= MAX_ATTEMPTS) {
          console.warn("⚠️ Max attempts reached");
          setWaitingForPayment(false);
          clearInterval(pollRef.current);
        }

      } catch (err) {
        console.error("❌ Fetch order error:", err);
        setLoading(false);
        clearInterval(pollRef.current);
      }
    };

    fetchOrder();
    pollRef.current = setInterval(fetchOrder, 2000);

    return () => clearInterval(pollRef.current);

  }, [orderId]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading your order...</p>
      </div>
    </div>
  );

  if (waitingForPayment) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p className="text-gray-800 font-bold text-xl">Confirming your payment...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait, do not close this page</p>
        <p className="text-gray-300 text-xs mt-4">This usually takes 2-5 seconds</p>
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <p className="text-5xl mb-4">😕</p>
      <h2 className="text-xl font-bold text-gray-700">No Order Found</h2>
      <p className="text-sm text-gray-400 mt-1">orderId: {orderId || "missing"}</p>
      <button onClick={() => navigate("/")} className="mt-4 bg-black text-white px-6 py-2 rounded-xl">
        Go Home
      </button>
    </div>
  );

  // ✅ Consistent 4-step display
  const currentStep = getDisplayStep(order.orderStatus);

  const steps = [
    { label: "Order Placed", icon: "📋", done: currentStep >= 0 },
    { label: "Confirmed", icon: "✅", done: currentStep >= 1 },
    { label: "Shipped", icon: "🚚", done: currentStep >= 2 },
    { label: "Delivered", icon: "🏠", done: currentStep >= 3 },
  ];

  const totalPaid = order.orderItems?.reduce(
    (sum, item) => sum + item.price * item.qty, 0
  );

  // ✅ For COD show order placed success, for online show payment status
  const isSuccess = order.paymentMethod === "COD" || order.paymentStatus === "paid";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4 relative">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-20">

        {/* Header */}
        <div className={`bg-gradient-to-r ${isSuccess
            ? "from-emerald-500 to-green-600"
            : "from-orange-400 to-yellow-500"
          } p-8 text-center text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            {isSuccess ? (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="#10b981" strokeWidth="3"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <span style={{ fontSize: 32 }}>⏳</span>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-1">
            {order.paymentMethod === "COD"
              ? "Order Placed Successfully!"
              : order.paymentStatus === "paid"
                ? "Payment Successful!"
                : "Payment Pending"}
          </h1>
          <p className="text-white/80 text-sm">
            {order.paymentMethod === "COD"
              ? "Pay when your order arrives 💵"
              : order.paymentStatus === "paid"
                ? "Thank you for your purchase 🎉"
                : "Your order is waiting for payment confirmation"}
          </p>
          <div className="mt-3 bg-white/20 rounded-full px-4 py-1.5 inline-block">
            <p className="text-white text-xs font-mono font-bold">
              ORDER #{order._id?.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">

          {/* ✅ Tracking Steps — matches MyOrders exactly */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              📍 Order Tracking
            </p>
            <div className="flex items-start justify-between">
              {steps.map((step, i) => (
                <div key={step.label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm ${step.done ? "bg-emerald-500" : "bg-gray-100"
                      }`}>
                      {step.done && i < currentStep ? "✓" : step.icon}
                    </div>
                    <p className={`text-[10px] mt-1.5 font-semibold text-center ${step.done ? "text-emerald-600" : "text-gray-300"
                      }`}>
                      {step.label}
                    </p>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-5 mx-1 rounded-full ${steps[i + 1].done ? "bg-emerald-400" : "bg-gray-200"
                      }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-1">Payment Method</p>
              <p className="font-bold text-gray-800 text-sm">
                {order.paymentMethod === "COD" ? "💵 Cash on Delivery" : "💳 Online"}
              </p>
            </div>
            <div className={`rounded-2xl p-4 ${isSuccess ? "bg-green-50" : "bg-orange-50"
              }`}>
              <p className="text-xs text-gray-400 mb-1">Payment Status</p>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full animate-pulse ${isSuccess ? "bg-green-500" : "bg-orange-400"
                  }`} />
                <p className={`font-bold text-sm capitalize ${isSuccess ? "text-green-700" : "text-orange-600"
                  }`}>
                  {order.paymentMethod === "COD" ? "Pay on delivery" : order.paymentStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="border border-gray-100 rounded-2xl p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              📍 Delivering To
            </p>
            <p className="text-sm font-semibold text-gray-800">
              {order.shippingAddress?.address}
            </p>
            <p className="text-sm text-gray-500">
              {order.shippingAddress?.city}
              {order.shippingAddress?.postalCode ? `, ${order.shippingAddress.postalCode}` : ""}
            </p>
            <p className="text-sm text-gray-500">{order.shippingAddress?.country}</p>
          </div>

          {/* Items */}
          <div className="border border-gray-100 rounded-2xl p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              🛍️ Items ({order.orderItems?.length})
            </p>
            <div className="space-y-3">
              {order.orderItems?.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <img
                    src={item.image || "https://via.placeholder.com/48"}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-xl bg-gray-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-800">
                    ₹{(item.price * item.qty).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <p className="font-bold text-gray-800">
                {order.paymentMethod === "COD" ? "Total Amount" : "Total Paid"}
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                ₹{totalPaid?.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => navigate("/myorders")}
              className="flex-1 bg-gray-900 hover:bg-gray-700 text-white py-3.5 rounded-2xl font-bold text-sm transition-colors"
            >
              📦 Track Order
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 border-2 border-gray-100 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700 py-3.5 rounded-2xl font-bold text-sm transition-colors"
            >
              🛍️ Shop More
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Orders;