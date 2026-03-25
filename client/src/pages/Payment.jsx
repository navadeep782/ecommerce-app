import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Payment() {
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    localStorage.setItem("paymentMethod", paymentMethod);
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-sm p-8 w-full max-w-md">

        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Method</h1>
        <p className="text-sm text-gray-400 mb-8">Choose how you'd like to pay</p>

        <form onSubmit={submitHandler} className="space-y-4">

          {/* COD Option */}
          <label
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "COD"
                ? "border-black bg-gray-50"
                : "border-gray-100 hover:border-gray-200"
              }`}
          >
            <input
              type="radio"
              value="COD"
              checked={paymentMethod === "COD"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="hidden"
            />
            {/* Custom radio */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === "COD" ? "border-black" : "border-gray-300"
              }`}>
              {paymentMethod === "COD" && (
                <div className="w-2.5 h-2.5 rounded-full bg-black" />
              )}
            </div>
            <div className="flex items-center gap-3 flex-1">
              <span className="text-2xl">💵</span>
              <div>
                <p className="font-semibold text-gray-800">Cash on Delivery</p>
                <p className="text-xs text-gray-400">Pay when your order arrives</p>
              </div>
            </div>
            {paymentMethod === "COD" && (
              <span className="text-xs bg-black text-white px-2 py-1 rounded-full">Selected</span>
            )}
          </label>

          {/* Online Option */}
          <label
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "Online"
                ? "border-black bg-gray-50"
                : "border-gray-100 hover:border-gray-200"
              }`}
          >
            <input
              type="radio"
              value="Online"
              checked={paymentMethod === "Online"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="hidden"
            />
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === "Online" ? "border-black" : "border-gray-300"
              }`}>
              {paymentMethod === "Online" && (
                <div className="w-2.5 h-2.5 rounded-full bg-black" />
              )}
            </div>
            <div className="flex items-center gap-3 flex-1">
              <span className="text-2xl">💳</span>
              <div>
                <p className="font-semibold text-gray-800">Online Payment</p>
                <p className="text-xs text-gray-400">Pay securely via Stripe</p>
              </div>
            </div>
            {paymentMethod === "Online" && (
              <span className="text-xs bg-black text-white px-2 py-1 rounded-full">Selected</span>
            )}
          </label>

          {/* Secure badge */}
          <div className="flex items-center gap-2 text-xs text-gray-400 justify-center py-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            100% Secure & Encrypted Payment
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white py-3.5 rounded-xl font-semibold transition-colors"
          >
            Continue →
          </button>

        </form>
      </div>
    </div>
  );
}

export default Payment;
