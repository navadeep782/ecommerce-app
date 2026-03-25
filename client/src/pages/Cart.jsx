import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, increaseQty, decreaseQty } from "../redux/cartSlice";
import { useNavigate } from "react-router-dom";

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty, 0
  );

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const checkoutHandler = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    if (totalPrice === 0) {
      alert("Cannot checkout with ₹0 total!");
      return;
    }
    navigate("/shipping");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          🛒 Shopping Cart
          {cartItems.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({totalItems} {totalItems === 1 ? "item" : "items"})
            </span>
          )}
        </h1>

        {/* Empty State */}
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm flex flex-col items-center justify-center py-20">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-6xl">🛒</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-400 text-sm mb-8">
              Looks like you haven't added anything yet
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Cart Items */}
            <div className="flex-1 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl shadow-sm p-4 flex gap-4 items-center"
                >
                  {/* Product Image */}
                  <img
                    src={item.images?.[0]?.url || "https://via.placeholder.com/80"}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                  />

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-gray-800 truncate">{item.name}</h2>
                    <p className="text-sm text-gray-400">{item.category}</p>
                    <p className="text-blue-600 font-bold mt-1">₹{item.price?.toLocaleString()}</p>

                    {/* Qty Controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => dispatch(decreaseQty(item._id))}
                        className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-600 transition-colors"
                      >
                        −
                      </button>
                      <span className="font-bold text-gray-800 w-6 text-center">{item.qty}</span>
                      <button
                        onClick={() => dispatch(increaseQty(item._id))}
                        className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-600 transition-colors"
                      >
                        +
                      </button>
                      <span className="text-xs text-gray-400 ml-1">
                        Subtotal: <span className="font-semibold text-gray-600">₹{(item.price * item.qty).toLocaleString()}</span>
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => dispatch(removeFromCart(item._id))}
                    className="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:w-72">
              <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-24">
                <h2 className="font-bold text-gray-800 text-lg mb-4">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Items ({totalItems})</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-gray-800 text-base">
                    <span>Total</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={checkoutHandler}
                  className="w-full mt-5 bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  Proceed to Checkout →
                </button>

                <button
                  onClick={() => navigate("/")}
                  className="w-full mt-2 border border-gray-200 hover:border-gray-400 text-gray-600 py-3 rounded-xl font-medium text-sm transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;

