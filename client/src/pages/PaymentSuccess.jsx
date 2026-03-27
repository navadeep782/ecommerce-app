import { BASE_URL } from "../config";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCart } from "../redux/cartSlice";

const API = BASE_URL;

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get("orderId");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!orderId || !sessionId) {
          navigate("/");
          return;
        }

        const res = await fetch(`${API}/api/payment/verify-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ orderId, sessionId })
        });

        const data = await res.json();

        if (data.success || data.message === "Payment verified successfully") {
          // Clear LocalCart
          localStorage.removeItem("cartItems");
          dispatch(clearCart());
          navigate(`/orders?orderId=${orderId}`);
        } else {
          alert("Payment verification failed");
          navigate("/cart");
        }
      } catch (error) {
        console.error("Verification error:", error);
        navigate("/cart");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [orderId, sessionId, navigate, dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-800">Verifying Payment...</h1>
        <p className="text-gray-500 text-sm mt-2">Please do not close this window</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <h1 className="text-xl font-semibold text-green-600">Payment Successful! Redirecting...</h1>
    </div>
  );
}

export default PaymentSuccess;