import { BASE_URL } from "../../config";
import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import { useSelector } from "react-redux";

const API = BASE_URL;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  //const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const { userInfo } = useSelector((state) => state.user);
  const token = userInfo?.token;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${API}/api/admin/users`, { headers });
      setUsers(data.users || []);
    } catch (err) {
      console.error("❌ Fetch users error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${API}/api/admin/users/${id}`, { headers });
        fetchUsers();
      } catch (err) {
        console.error("❌ Delete user error:", err.message);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="p-6 w-full">
        <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

        {loading ? (
          <p className="text-gray-500">Loading users...</p>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-3 font-semibold text-gray-600">Name</th>
                  <th className="p-3 font-semibold text-gray-600">Email</th>
                  <th className="p-3 font-semibold text-gray-600">Role</th>
                  <th className="p-3 font-semibold text-gray-600">Joined</th>
                  <th className="p-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-500">{user.email}</td>
                    <td className="p-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${user.role === "admin"
                          ? "bg-violet-100 text-violet-700"
                          : "bg-gray-100 text-gray-700"
                        }`}>
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
