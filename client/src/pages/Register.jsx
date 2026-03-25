import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Name is required");
    if (!email.trim()) return setError("Email is required");
    if (password.length < 6) return setError("Password must be at least 6 characters");

    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/auth/register`, {
        name,
        email,
        password,
      });
      // ✅ Clear old user data first
      localStorage.removeItem("cartItems");
      localStorage.removeItem("shipping");
      localStorage.removeItem("paymentMethod");

      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-sm p-8 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🛍️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
          <p className="text-sm text-gray-400 mt-1">Join us and start shopping</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Arjun Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {/* Password strength */}
            {password.length > 0 && (
              <div className="mt-2 flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${password.length >= (i + 1) * 2
                        ? password.length < 6
                          ? "bg-red-400"
                          : password.length < 10
                            ? "bg-yellow-400"
                            : "bg-green-400"
                        : "bg-gray-100"
                      }`}
                  />
                ))}
                <span className={`text-xs ml-1 ${password.length < 6 ? "text-red-400" :
                    password.length < 10 ? "text-yellow-500" : "text-green-500"
                  }`}>
                  {password.length < 6 ? "Weak" : password.length < 10 ? "Good" : "Strong"}
                </span>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-semibold text-white transition-colors mt-2 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
              }`}
          >
            {loading ? "Creating Account..." : "Create Account →"}
          </button>

        </form>

        {/* Login link */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-black font-semibold hover:underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;

