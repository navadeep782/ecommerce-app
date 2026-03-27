import { BASE_URL } from "../config";
// React hook to manage component state
import { useState } from "react";

// Axios is used to send HTTP requests to backend API
import axios from "axios";

// Hooks from react-router for navigation and linking pages
import { useNavigate, Link } from "react-router-dom";

// Redux hook used to dispatch actions to global store
import { useDispatch } from "react-redux";

// Redux action to store logged-in user information
import { setUser } from "../redux/userSlice";

const API = BASE_URL;

const Login = () => {

  // Hook to redirect users after login
  const navigate = useNavigate();

  // Hook to dispatch Redux actions
  const dispatch = useDispatch();

  // State to store email entered by user
  const [email, setEmail] = useState("");

  // State to store password
  const [password, setPassword] = useState("");

  // State to toggle show/hide password
  const [showPassword, setShowPassword] = useState(false);

  // State to store error messages
  const [error, setError] = useState("");

  // State to show loading when login request is running
  const [loading, setLoading] = useState(false);

  // Function executed when form is submitted
  const submitHandler = async (e) => {

    // Prevent page reload on form submit
    e.preventDefault();

    // Reset error message
    setError("");

    // Validate email field
    if (!email.trim()) return setError("Email is required");

    // Validate password length
    if (password.length < 6) return setError("Password must be at least 6 characters");

    // Show loading state
    setLoading(true);

    try {

      // Send login request to backend API
      const { data } = await axios.post(
        `${API}/api/auth/login`,
        {
          email,
          password,
        }
      );

      // Save logged-in user data in localStorage
      // This keeps user logged in even after page refresh
      // ✅ Clear old user data first
      localStorage.removeItem("cartItems");
      localStorage.removeItem("shipping");
      localStorage.removeItem("paymentMethod");

      localStorage.setItem("userInfo", JSON.stringify(data));

      // Save user data in Redux global state
      dispatch(setUser(data));

      // Redirect user to homepage
      navigate("/");

    } catch (err) {

      // Log error for debugging
      console.error(err);

      // Show error message returned from backend
      setError(err.response?.data?.message || "Invalid email or password");

    } finally {

      // Stop loading state
      setLoading(false);
    }
  };

  return (

    // Full page container centered vertically and horizontally
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

      {/* Login card */}
      <div className="bg-white rounded-3xl shadow-sm p-8 w-full max-w-md">

        {/* Header Section */}
        <div className="text-center mb-8">

          {/* App icon */}
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🛍️</span>
          </div>

          {/* Page title */}
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>

          {/* Subtitle */}
          <p className="text-sm text-gray-400 mt-1">Login to your account</p>
        </div>

        {/* Error message box */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={submitHandler} className="space-y-4">

          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Email Address
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}

              // Update email state when user types
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}

              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
            />
          </div>

          {/* Password Input */}
          <div>

            {/* Label */}
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Password
              </label>
            </div>

            <div className="relative">

              {/* Password field */}
              <input
                type={showPassword ? "text" : "password"} // toggle visibility
                placeholder="Min. 6 characters"
                value={password}

                // Update password state
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}

                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all pr-12"
              />

              {/* Toggle password visibility button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}

                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>

            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"

            // Disable button while loading
            disabled={loading}

            className={`w-full py-3.5 rounded-xl font-semibold text-white transition-colors mt-2 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
              }`}
          >
            {loading ? "Logging in..." : "Login →"}
          </button>

        </form>

        {/* Register link */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-black font-semibold hover:underline"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
