 import { Link } from "react-router-dom";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../redux/cartSlice";
import CartToast from "./CartToast";

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, qty: 1 }));
    setShowToast(true); // ✅ show toast
  };

  return (
    <>
      {/* ✅ Toast notification */}
      {showToast && (
        <CartToast
          product={product}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="border rounded-xl p-4 shadow hover:shadow-lg transition duration-300 relative">
        {/* Image */}
        <div
          className="overflow-hidden rounded-lg cursor-pointer"
          onClick={() => navigate(`/product/${product._id}`)}
        >
          <img
            src={product.images?.[0]?.url || "https://via.placeholder.com/300"}
            alt={product.name}
            className="w-full h-48 object-cover hover:scale-110 transition duration-300"
          />
        </div>

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Out of Stock
          </div>
        )}

        <h2
          className="text-sm font-semibold mt-3 truncate cursor-pointer hover:text-blue-600"
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {product.name}
        </h2>
        <p className="text-xs text-slate-400">{product.category}</p>
        <p className="text-gray-700 font-bold mt-1">₹{product.price?.toLocaleString()}</p>
        <p className={`text-xs mt-0.5 ${product.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </p>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`mt-3 w-full py-2 rounded-lg text-white text-sm font-semibold transition-all
            ${product.stock === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </>
  );
}

export default ProductCard;