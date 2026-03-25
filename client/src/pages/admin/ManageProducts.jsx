import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const headers = { Authorization: `Bearer ${userInfo?.token}` };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API}/api/products?limit=100`);
      setProducts(data.products || []);
    } catch (err) {
      console.error("❌ Fetch products error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API}/api/products/${id}`, { headers });
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="p-6 w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manage Products</h1>
            <p className="text-sm text-gray-400 mt-1">
              {loading ? "Loading..." : `${products.length} products`}
            </p>
          </div>
          <Link
            to="/admin/product/create"
            className="bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            + Add Product
          </Link>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-14 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🛍️</p>
            <p className="text-gray-500">No products yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Image</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Name</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Price</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Stock</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">

                    {/* Image */}
                    <td className="px-5 py-3">
                      <img
                        src={p.images?.[0]?.url || "https://via.placeholder.com/40"}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover bg-gray-100"
                      />
                    </td>

                    {/* Name */}
                    <td className="px-5 py-3 font-medium text-gray-800 max-w-xs truncate">
                      {p.name}
                    </td>

                    {/* Price */}
                    <td className="px-5 py-3 font-bold text-gray-700">
                      ₹{p.price?.toLocaleString()}
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.stock === 0
                          ? "bg-red-100 text-red-600"
                          : p.stock < 5
                            ? "bg-orange-100 text-orange-600"
                            : "bg-green-100 text-green-700"
                        }`}>
                        {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/product/${p._id}/edit`}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          ✏️ Edit
                        </Link>
                        <button
                          onClick={() => deleteProduct(p._id)}
                          disabled={deletingId === p._id}
                          className={`text-xs bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-3 py-1.5 rounded-lg transition-colors ${deletingId === p._id ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                          {deletingId === p._id ? "Deleting..." : "🗑️ Delete"}
                        </button>
                      </div>
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

export default ManageProducts;



