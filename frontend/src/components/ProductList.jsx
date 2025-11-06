import React, { useState, useEffect, useCallback } from "react";
import axios from "../api/axios";
import ProductForm from "./ProductForm";
import RestockModal from "./RestockModal";
import LowStockAlert from "./LowStockAlert";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [restockTarget, setRestockTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("fetch products", err);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    const t = setInterval(fetchProducts, 5000);
    return () => clearInterval(t);
  }, [fetchProducts]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/products/${productToDelete._id}`);
      fetchProducts();
      setShowDeleteModal(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <h2 style={{ color: "var(--primary)" }}>Products</h2>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          style={addBtnStyle}
        >
          <i className="bi bi-plus-circle" style={{ marginRight: "8px" }}></i>
          Add Product
        </button>
      </div>

      {/* LOW STOCK ALERT */}
      <LowStockAlert items={products.filter((p) => p.lowStock)} />

      {/* PRODUCT CARDS */}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div style={cardsContainerStyle}>
          {products.map((p) => (
            <div key={p._id} style={cardStyle} className="product-card">
              <div style={cardHeaderStyle}>
                <h3 style={{ color: "var(--primary)", fontSize: "1rem" }}>
                  {p.name}
                </h3>
                {p.lowStock && (
                  <span style={lowStockBadgeStyle}>Low Stock</span>
                )}
              </div>

              <div style={cardInfoStyle}>
                <div>
                  <strong>Category:</strong> {p.category}
                </div>
                <div>
                  <strong>Price:</strong> ₱{Number(p.sellingPrice).toFixed(2)}
                </div>
                <div>
                  <strong>Stock:</strong> {p.stock}
                </div>
              </div>

              <div style={actionsContainerStyle} className="product-actions">
                <button
                  onClick={() => {
                    setEditing(p);
                    setShowForm(true);
                  }}
                  style={actionBtnStyle}
                >
                  <i className="bi bi-pencil-square"></i> Edit
                </button>

                <button
                  onClick={() => setRestockTarget(p)}
                  style={actionBtnStyle}
                >
                  <i className="bi bi-arrow-repeat"></i> Restock
                </button>

                <button
                  onClick={() => {
                    setProductToDelete(p);
                    setShowDeleteModal(true);
                  }}
                  style={deleteBtnStyle}
                >
                  <i className="bi bi-trash"></i> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALS */}
      {showForm && (
        <ProductForm
          product={editing}
          onClose={() => {
            setShowForm(false);
            fetchProducts();
          }}
        />
      )}

      {restockTarget && (
        <RestockModal
          product={restockTarget}
          onClose={() => {
            setRestockTarget(null);
            fetchProducts();
          }}
        />
      )}

      {showDeleteModal && (
        <div style={modalBackdropStyle}>
          <div style={modalStyle} className="modal-box">
            <h3 style={modalHeaderStyle}>
              Are you sure you want to delete this product?
            </h3>
            <p style={{ textAlign: "center" }}>This action cannot be undone.</p>
            <div style={buttonsContainerStyle}>
              <button onClick={handleDelete} style={confirmBtnStyle}>
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={cancelBtnStyle}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESPONSIVE FIXES */}
      <style>
        {`
          @media (max-width: 600px) {
            h2 {
              font-size: 18px;
            }
            .product-card {
              padding: 14px !important;
            }
            button {
              font-size: 13px !important;
              padding: 6px 10px !important;
            }
            .product-actions {
              flex-direction: column !important;
              gap: 8px !important;
            }
            .modal-box {
              width: 90% !important;
            }
          }
        `}
      </style>
    </div>
  );
}

/* === BASE STYLES === */
const containerStyle = {
  padding: "24px",
  background: "var(--background)",
  minHeight: "100vh",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "12px",
};

const addBtnStyle = {
  background: "var(--primary)",
  color: "#fff",
  padding: "10px 20px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  transition: "background-color 0.3s ease",
};

const cardsContainerStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "16px",
  marginTop: "20px",
};

const cardStyle = {
  background: "var(--accent3)",
  padding: "20px",
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
};

const cardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const lowStockBadgeStyle = {
  backgroundColor: "var(--danger-light, #ffe6e6)",
  color: "var(--danger, #e74c3c)",
  padding: "4px 8px",
  borderRadius: "4px",
  fontSize: "12px",
};

const cardInfoStyle = {
  marginTop: "14px",
  fontSize: "14px",
  color: "var(--text-dark)",
  lineHeight: "1.5",
};

const actionsContainerStyle = {
  marginTop: "16px",
  display: "flex",
  gap: "8px",
  justifyContent: "space-between",
  flexWrap: "wrap",
};

const actionBtnStyle = {
  background: "var(--primary, #3498db)",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  flexGrow: 1,
  transition: "background-color 0.3s ease, transform 0.1s ease",
};

const deleteBtnStyle = {
  ...actionBtnStyle,
  background: "var(--danger, #e74c3c)",
};

const modalBackdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "var(--accent3, #2c2c2c)",
  padding: "24px",
  borderRadius: "10px",
  width: "400px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  textAlign: "center",
};

const modalHeaderStyle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "var(--primary, #3498db)",
};

const buttonsContainerStyle = {
  marginTop: "16px",
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
};

const confirmBtnStyle = {
  background: "var(--danger, #e74c3c)",
  color: "#fff",
  border: "none",
  padding: "10px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  flexGrow: 1,
  transition: "background-color 0.3s ease",
};

const cancelBtnStyle = {
  background: "var(--primary, #3498db)",
  color: "#fff",
  border: "none",
  padding: "10px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  flexGrow: 1,
  transition: "background-color 0.3s ease",
};
