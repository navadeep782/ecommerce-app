import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../redux/cartSlice";

const API = import.meta.env.VITE_API_URL;

function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems = [] } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.user);
  const shipping = JSON.parse(localStorage.getItem("shipping"));
  const paymentMethod = localStorage.getItem("paymentMethod");

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty, 0
  );

  const placeOrderHandler = async () => {
    try {
      if (!cartItems || cartItems.length === 0) {
        alert("Your cart is empty!");
        navigate("/cart");
        return;
      }
      if (!shipping) {
        alert("Please add a shipping address!");
        navigate("/shipping");
        return;
      }
      if (!userInfo?.token) {
        alert("Please login first!");
        navigate("/login");
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      };

      // Sync cart to backend
      for (const item of cartItems) {
        await fetch(`${API}/api/cart`, {
          method: "POST",
          headers,
          body: JSON.stringify({ productId: item._id, qty: item.qty }),
        });
      }

      // Create order
      const orderRes = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify({ shippingAddress: shipping, paymentMethod }),
      });

      const orderData = await orderRes.json();
      const orderId = orderData._id;

      if (!orderId) {
        alert("Failed to create order: " + (orderData.message || "Unknown error"));
        return;
      }

      // COD
      if (paymentMethod === "COD") {
        dispatch(clearCart());
        localStorage.removeItem("cartItems");
        navigate("/order-success", {
          state: {
            order: {
              id: orderId,
              paymentMethod: "COD",
              paymentStatus: "Pending",
              shippingAddress: shipping,
              items: cartItems,
            },
          },
        });
        return;
      }

      // Online
      const paymentRes = await fetch(
        `${API}/api/payment/create-checkout-session`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ orderId }),
        }
      );

      const paymentData = await paymentRes.json();

      if (paymentData.url) {
        window.location.assign(paymentData.url);
        return;
      } else {
        alert("Payment session failed: " + (paymentData.error || "Unknown error"));
      }

    } catch (error) {
      console.error("❌ placeOrderHandler error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h1>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left — Details */}
          <div className="flex-1 space-y-4">

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📍</span>
                <h2 className="font-bold text-gray-800">Shipping Address</h2>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{shipping?.address}</p>
                <p>{shipping?.city} — {shipping?.postalCode}</p>
                <p>{shipping?.country}</p>
              </div>
              <button
                onClick={() => navigate("/shipping")}
                className="text-xs text-blue-500 hover:text-blue-700 mt-2 font-medium"
              >
                Change →
              </button>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{paymentMethod === "COD" ? "💵" : "💳"}</span>
                <h2 className="font-bold text-gray-800">Payment Method</h2>
              </div>
              <p className="text-sm text-gray-600">
                {paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment (Stripe)"}
              </p>
              <button
                onClick={() => navigate("/payment")}
                className="text-xs text-blue-500 hover:text-blue-700 mt-2 font-medium"
              >
                Change →
              </button>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🛍️</span>
                <h2 className="font-bold text-gray-800">
                  Items ({cartItems.reduce((a, i) => a + i.qty, 0)})
                </h2>
              </div>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <img
                      src={item.images?.[0]?.url || "https://via.placeholder.com/50"}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-xl flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-800">
                      ₹{(item.price * item.qty).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Summary */}
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-24">
              <h2 className="font-bold text-gray-800 text-lg mb-4">Price Details</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Price ({cartItems.reduce((a, i) => a + i.qty, 0)} items)</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax</span>
                  <span>₹0</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-gray-800 text-base">
                  <span>Total Amount</span>
                  <span className="text-green-600">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-green-600 font-medium mt-2">
                🎉 You save ₹0 on this order
              </p>

              <button
                onClick={placeOrderHandler}
                className="w-full mt-5 bg-black hover:bg-gray-800 text-white py-3.5 rounded-xl font-bold transition-colors"
              >
                {paymentMethod === "COD" ? "Place Order" : "Proceed to Pay ₹" + totalPrice.toLocaleString()}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Safe & Secure Payments
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Checkout;


