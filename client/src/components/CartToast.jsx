// CartToast.jsx — place in src/components/
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CartToast({ product, onClose }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setVisible(true), 10);

    // Auto close after 3 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: "80px",
        right: "20px",
        zIndex: 9999,
        transform: visible ? "translateX(0)" : "translateX(120%)",
        opacity: visible ? 1 : 0,
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 20px rgba(0,0,0,0.1)",
          padding: "16px",
          width: "300px",
          border: "1px solid #f0f0f0",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "#22c55e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: "14px", color: "#111" }}>
            Added to Cart!
          </span>
          <button
            onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#999",
              fontSize: "18px",
              lineHeight: 1,
              padding: "0",
            }}
          >
            ×
          </button>
        </div>

        {/* Product info */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "14px" }}>
          <img
            src={product?.images?.[0]?.url || "https://via.placeholder.com/60"}
            alt={product?.name}
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "10px",
              objectFit: "cover",
              flexShrink: 0,
              background: "#f8f8f8",
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#111",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {product?.name}
            </p>
            <p style={{ fontSize: "13px", color: "#555", margin: "2px 0 0", fontWeight: 700 }}>
              ₹{product?.price?.toLocaleString()}
            </p>
            <p style={{ fontSize: "11px", color: "#22c55e", margin: "2px 0 0", fontWeight: 500 }}>
              In Stock
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => { navigate("/cart"); onClose(); }}
            style={{
              flex: 1,
              padding: "9px",
              background: "#111",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.target.style.background = "#333"}
            onMouseLeave={e => e.target.style.background = "#111"}
          >
            🛒 View Cart
          </button>
          <button
            onClick={() => { navigate("/checkout"); onClose(); }}
            style={{
              flex: 1,
              padding: "9px",
              background: "#f59e0b",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => e.target.style.background = "#d97706"}
            onMouseLeave={e => e.target.style.background = "#f59e0b"}
          >
            ⚡ Checkout
          </button>
        </div>

        {/* Progress bar */}
        <div
          style={{
            marginTop: "12px",
            height: "3px",
            background: "#f0f0f0",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "#22c55e",
              borderRadius: "2px",
              animation: "shrink 3s linear forwards",
            }}
          />
        </div>

        <style>{`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}</style>
      </div>
    </div>
  );
}

export default CartToast;