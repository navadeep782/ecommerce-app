import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function Navbar() {
  const { cartItems } = useSelector((state) => state.cart);
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const isAdmin = userInfo?.user?.role === "admin";
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("cartItems");
    localStorage.removeItem("shipping");
    localStorage.removeItem("paymentMethod");
    navigate("/login");
  };

  return (
    <nav
      className="flex justify-between items-center px-6 py-3 sticky top-0 z-50 shadow-lg"
      style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}
    >
      {/* Logo + Home */}
      <div className="flex items-center gap-6">
        <Link to="/" className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-base">🛍️</span>
          <span className="hidden sm:block">ShopApp</span>
        </Link>
        <Link to="/" className="text-sm text-blue-200 hover:text-white transition-colors font-medium">
          Home
        </Link>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">

        {/* Admin link */}
        {isAdmin && (
          <Link
            to="/admin/dashboard"
            className="text-xs bg-violet-600 hover:bg-violet-500 px-3 py-1.5 rounded-lg font-semibold transition-colors text-white"
          >
            ⚙️ Admin
          </Link>
        )}

        {userInfo ? (
          <>
            {/* Hi username */}
            <span className="text-sm text-blue-200 hidden sm:block">
              Hi, <span className="text-yellow-400 font-bold">{userInfo.user?.name}</span>
            </span>

            {/* Profile */}
            <Link
              to="/profile"
              className="text-sm text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1"
            >
              👤 <span className="hidden sm:block">Profile</span>
            </Link>

            {/* Orders */}
            <Link
              to="/myorders"
              className="text-sm text-white bg-blue-500/30 hover:bg-blue-500/50 px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1"
            >
              📦 <span className="hidden sm:block">Orders</span>
            </Link>

            {/* Logout */}
            <button
              onClick={logoutHandler}
              className="text-sm bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors font-medium text-white"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm text-blue-200 hover:text-white transition-colors font-medium"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-3 py-1.5 rounded-lg font-bold transition-colors"
            >
              Register
            </Link>
          </>
        )}

        {/* Cart */}
        <Link
          to="/cart"
          className="relative flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-3 py-1.5 rounded-lg transition-colors font-semibold"
        >
          <span className="text-lg">🛒</span>
          <span className="text-sm font-bold hidden sm:block">Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-bounce">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </Link>

      </div>
    </nav>
  );
}

export default Navbar;