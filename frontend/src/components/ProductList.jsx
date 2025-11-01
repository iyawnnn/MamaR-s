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
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal visibility for delete confirmation
  const [productToDelete, setProductToDelete] = useState(null); // Track the product to be deleted

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
    // Log to check the ID being sent
    console.log("Deleting product with ID: ", productToDelete._id);
    try {
      // Send DELETE request to backend
      await axios.delete(`/products/${productToDelete._id}`);
      fetchProducts(); // Refresh products after deletion
      setShowDeleteModal(false); // Close the modal
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div style={containerStyle}>
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

      <LowStockAlert items={products.filter((p) => p.lowStock)} />

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div style={cardsContainerStyle}>
          {products.map((p) => (
            <div key={p._id} style={cardStyle}>
              <div style={cardHeaderStyle}>
                <h3 style={{ color: "var(--primary)" }}>{p.name}</h3>
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

              <div style={actionsContainerStyle}>
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
                  onClick={() => {
                    setProductToDelete(p);
                    setShowDeleteModal(true);
                  }}
                  style={actionBtnStyle}
                >
                  <i className="bi bi-trash"></i> Delete
                </button>
                <button
                  onClick={() => setRestockTarget(p)}
                  style={actionBtnStyle}
                >
                  <i className="bi bi-arrow-repeat"></i> Restock
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={modalBackdropStyle}>
          <div style={modalStyle}>
            <h3 style={modalHeaderStyle}>
              Are you sure you want to delete this product?
            </h3>
            <p>This action cannot be undone.</p>
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
    </div>
  );
}

const containerStyle = {
  padding: "24px",
  background: "var(--background)",
  minHeight: "100vh",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
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
  marginLeft: "auto",
};

const cardsContainerStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "20px",
  marginTop: "20px",
};

const cardStyle = {
  background: "var(--accent3)",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const cardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const lowStockBadgeStyle = {
  backgroundColor: "var(--danger-light)",
  color: "var(--danger)",
  padding: "4px 8px",
  borderRadius: "4px",
  fontSize: "12px",
};

const cardInfoStyle = {
  marginTop: "16px",
  fontSize: "14px",
  color: "var(--text-dark)",
};

const actionsContainerStyle = {
  marginTop: "20px",
  display: "flex",
  gap: "12px",
  justifyContent: "space-between",
};

const actionBtnStyle = {
  background: "var(--primary)", // Keep it consistent for all buttons
  color: "#fff",
  border: "none",
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px", // This will add spacing between the icon and the text
  transition: "background-color 0.3s ease",
  width: "100%",
};

// Modal Backdrop Styles
const modalBackdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "var(--accent3)", // Light background
  padding: "24px",
  borderRadius: "8px",
  width: "400px", // Increased width for better spacing
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "16px",
};

const modalHeaderStyle = {
  textAlign: "center", // Center the text
  fontSize: "20px",
  fontWeight: "500",
  width: "100%", // Ensures the header takes full width
};

const buttonsContainerStyle = {
  display: "flex",
  gap: "12px",
  justifyContent: "center",
  width: "100%", // Ensures buttons are evenly spaced
};

const confirmBtnStyle = {
  background: "var(--danger, #a00808ff)", // Use fallback color in case var(--danger) is not defined
  color: "#fff",
  border: "none",
  padding: "10px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  textAlign: "center",
  width: "100%",
};

const cancelBtnStyle = {
  background: "var(--primary)", // Keep the cancel button consistent
  color: "#fff",
  border: "none",
  padding: "10px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  textAlign: "center", // Center the text within the button
  width: "100%", // Make the button full-width
};
