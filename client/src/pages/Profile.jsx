import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem("userInfo"));
    return storedUser?.user || null;
  });
  const navigate = useNavigate();


  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-sm p-8 w-full max-w-md">

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center text-white text-3xl font-bold mb-3">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
          <span className={`mt-2 text-xs font-semibold px-3 py-1 rounded-full ${
            user.role === "admin"
              ? "bg-violet-100 text-violet-700"
              : "bg-gray-100 text-gray-500"
          }`}>
            {user.role === "admin" ? "👑 Admin" : "👤 Customer"}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-6">
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-xl">👤</span>
            <div>
              <p className="text-xs text-gray-400 font-medium">Full Name</p>
              <p className="text-sm font-semibold text-gray-800">{user.name}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-xl">📧</span>
            <div>
              <p className="text-xs text-gray-400 font-medium">Email Address</p>
              <p className="text-sm font-semibold text-gray-800">{user.email}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-xl">🔑</span>
            <div>
              <p className="text-xs text-gray-400 font-medium">Account Role</p>
              <p className="text-sm font-semibold text-gray-800 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/myorders")}
            className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            📦 View My Orders
          </button>

          {user.role === "admin" && (
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              ⚙️ Admin Dashboard
            </button>
          )}

          <button
            onClick={logoutHandler}
            className="w-full border-2 border-red-100 hover:bg-red-50 text-red-500 py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;

