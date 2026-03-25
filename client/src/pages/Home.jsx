

import { useEffect, useState } from "react";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import { io } from "socket.io-client";


// ✅ Updated to match actual categories in your DB
const CATEGORIES = ["All", "Electronics", "Clothing", "Footwear", "Accessories", "Beauty"];

function Home() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/products?limit=100");
        const list = (res.data.products || res.data || []).filter(Boolean);
        setProducts(list);
      } catch (err) {
        console.error("❌ Fetch error:", err.message);
      }
    };
    fetchProducts();
  }, []);

 

// Add inside Home component, after fetchProducts useEffect:

useEffect(() => {
  const socket = io(import.meta.env.VITE_SOCKET_URL, {
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
  });

  // ✅ Listen for stock updates
  socket.on("stockUpdated", (data) => {
    setProducts((prev) =>
      prev.map((p) =>
        p._id === data.productId
          ? { ...p, stock: data.stock }
          : p
      )
    );
  });

  return () => socket.disconnect();
}, []);

  const filtered = products
    .filter((p) =>
      activeCategory === "All" ||
      p.category?.toLowerCase() === activeCategory.toLowerCase()
    )
    .filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-2 border border-slate-200 rounded-xl mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />

      {/* Category Pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all
              ${activeCategory === cat
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-500 mb-4">{filtered.length} products found</p>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-slate-500">No products found</p>
          <button
            onClick={() => { setActiveCategory("All"); setSearch(""); }}
            className="mt-3 bg-black text-white px-4 py-2 rounded-lg text-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;