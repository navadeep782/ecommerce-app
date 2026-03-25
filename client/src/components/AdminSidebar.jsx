import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const API = import.meta.env.VITE_API_URL;

const AdminSidebar = () => {
  const [newOrderCount, setNewOrderCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL, { withCredentials: true });

    socket.on("connect", () => {
      socket.emit("joinAdmin"); // join adminRoom
    });

    // 🔥 New order → increment badge
    socket.on("newOrder", () => {
      setNewOrderCount((prev) => prev + 1);
    });

    return () => socket.disconnect();
  }, []);

  // ✅ Clear badge when admin visits Orders page
  useEffect(() => {
    if (location.pathname === "/admin/orders") {
      setTimeout(() => setNewOrderCount(0), 0);
    }
  }, [location.pathname]);

  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Products",  path: "/admin/products",  icon: "📦" },
    { label: "Orders",    path: "/admin/orders",    icon: "🛒" },
    { label: "Users",     path: "/admin/users",     icon: "👥" },
  ];

  return (
    <div className="w-64 min-h-screen bg-gray-800 text-white p-4 flex-shrink-0">
      <h2 className="text-xl font-bold mb-8 px-2">Admin Panel</h2>

      <ul className="space-y-1">
        {navItems.map(({ label, path, icon }) => {
          const isActive = location.pathname === path;
          const isOrders = path === "/admin/orders";

          return (
            <li key={path}>
              <Link
                to={path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? "bg-white/20 text-white font-semibold"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span>{icon}</span>
                  <span>{label}</span>
                </span>

                {/* 🔴 Badge — only on Orders link */}
                {isOrders && newOrderCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center animate-pulse">
                    {newOrderCount > 99 ? "99+" : newOrderCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AdminSidebar;





