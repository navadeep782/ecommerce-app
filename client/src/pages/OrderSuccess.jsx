// ✅ Correct — separate imports
import { useNavigate, useLocation } from "react-router-dom";



function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;



  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-xl font-bold text-gray-700">No Order Found</h2>
          <button onClick={() => navigate("/")} className="mt-4 bg-black text-white px-6 py-2 rounded-xl">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const totalPaid = order.items.reduce(
    (sum, item) => sum + item.price * item.qty, 0
  );

  const isPaid = order.paymentStatus === "Confirmed" || order.paymentStatus === "paid";

  const steps = [
    { label: "Order Placed", icon: "📋", done: true },
    { label: "Confirmed", icon: "✅", done: true },
    { label: "Shipped", icon: "🚚", done: false },
    { label: "Delivered", icon: "🏠", done: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4 relative">



      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-20">

        {/* ✅ Animated Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-8 text-center text-white relative overflow-hidden">
          {/* Background circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          {/* Checkmark */}
          <div
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
            style={{ animation: "popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold mb-1">Order Placed!</h1>
          <p className="text-emerald-100 text-sm">Thank you for shopping with us 🎉</p>
          <div className="mt-3 bg-white/20 rounded-full px-4 py-1.5 inline-block">
            <p className="text-white text-xs font-mono font-bold">
              ORDER #{order.id?.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">

          {/* ✅ Order Tracking Steps */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              📍 Order Tracking
            </p>
            <div className="flex items-start justify-between">
              {steps.map((step, i) => (
                <div key={step.label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm transition-all ${step.done
                        ? "bg-emerald-500 shadow-emerald-200"
                        : "bg-gray-100"
                      }`}>
                      {step.icon}
                    </div>
                    <p className={`text-[10px] mt-1.5 font-semibold text-center leading-tight ${step.done ? "text-emerald-600" : "text-gray-300"
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
            <div className={`rounded-2xl p-4 ${isPaid ? "bg-green-50" : "bg-amber-50"}`}>
              <p className="text-xs text-gray-400 mb-1">Payment Status</p>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full animate-pulse ${isPaid ? "bg-green-500" : "bg-amber-400"}`} />
                <p className={`font-bold text-sm ${isPaid ? "text-green-700" : "text-amber-700"}`}>
                  {order.paymentStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="border border-gray-100 rounded-2xl p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              📍 Delivering To
            </p>
            <p className="text-sm font-semibold text-gray-800">{order.shippingAddress?.address}</p>
            <p className="text-sm text-gray-500">
              {order.shippingAddress?.city}{order.shippingAddress?.postalCode ? `, ${order.shippingAddress.postalCode}` : ""}
            </p>
            <p className="text-sm text-gray-500">{order.shippingAddress?.country}</p>
          </div>

          {/* Items */}
          <div className="border border-gray-100 rounded-2xl p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              🛍️ Items ({order.items?.length})
            </p>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <img
                    src={item.images?.[0]?.url || "https://via.placeholder.com/48"}
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

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-800">Total Amount</p>
                {order.paymentMethod === "COD" && (
                  <p className="text-xs text-amber-500 mt-0.5 font-medium">
                    💵 Pay when delivered
                  </p>
                )}
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                ₹{totalPaid.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => navigate("/myorders")}
              className="flex-1 bg-gray-900 hover:bg-gray-700 text-white py-3.5 rounded-2xl font-bold text-sm transition-colors shadow-sm"
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

      <style>{`
        @keyframes popIn {
          0%   { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default OrderSuccess;






