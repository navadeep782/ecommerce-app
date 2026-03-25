import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { io } from "socket.io-client";


function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await API.get(`/products/${id}`);
      setProduct(res.data.product);
    };
    fetchProduct();
  }, [id]);
  

// Add inside ProductDetails component:
  useEffect(() => {
      const socket = io(import.meta.env.VITE_SOCKET_URL, {
        transports: ["websocket", "polling"],
      });

      socket.on("stockUpdated", (data) => {
        if (data.productId === product?._id) {
          setProduct((prev) => ({ ...prev, stock: data.stock }));
        }
      });

      return () => socket.disconnect();
  }, [product?._id]);


  const addToCartHandler = async () => {
    try {
      await API.post("/cart", { productId: product._id, qty });
      dispatch(addToCart({ ...product, qty }));
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error(error);
    }
  };

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const inStock = product.stock > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          ← Back
        </button>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* Image */}
            <div className="bg-gray-50 p-8 flex items-center justify-center">
              <img
                src={product.images?.[0]?.url || "https://via.placeholder.com/400"}
                alt={product.name}
                className="w-full max-h-96 object-contain rounded-2xl"
              />
            </div>

            {/* Info */}
            <div className="p-8 flex flex-col justify-between">
              <div>
                {/* Category + Brand */}
                <div className="flex items-center gap-2 mb-3">
                  {product.category && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-medium">
                      {product.category}
                    </span>
                  )}
                  {product.brand && (
                    <span className="text-xs bg-blue-50 text-blue-500 px-3 py-1 rounded-full font-medium">
                      {product.brand}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h1 className="text-2xl font-bold text-gray-800 mb-3">
                  {product.name}
                </h1>

                {/* Price */}
                <p className="text-3xl font-bold text-gray-900 mb-4">
                  ₹{product.price?.toLocaleString()}
                </p>

                {/* Description */}
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Stock */}
                <div className="flex items-center gap-2 mb-6">
                  <span className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500" : "bg-red-500"}`} />
                  <span className={`text-sm font-medium ${inStock ? "text-green-600" : "text-red-500"}`}>
                    {inStock ? `${product.stock} in stock` : "Out of stock"}
                  </span>
                </div>

                {/* Qty selector */}
                {inStock && (
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-sm font-medium text-gray-600">Quantity:</span>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-bold text-gray-800">{qty}</span>
                      <button
                        onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                        className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  onClick={addToCartHandler}
                  disabled={!inStock}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all ${
                    !inStock
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : added
                      ? "bg-green-500 text-white"
                      :  "bg-yellow-400 hover:bg-yellow-500 text-gray-900" 
                  }`}
                >
                  {!inStock ? "Out of Stock" : added ? "✓ Added to Cart!" : "Add to Cart"}
                </button>

                <button
                  onClick={async () => {
                    await addToCartHandler();
                    navigate("/cart");
                  }}
                  disabled={!inStock}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm border-2 transition-all ${
                    !inStock
                      ? "border-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600 text-white border-orange-100"
                  }`}
                >
                  Buy Now →
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;