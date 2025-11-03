import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const CATEGORIES = ["Ingredients", "Rent", "Utilities", "Packaging", "Salaries", "Other"];

export default function ExpenseForm({ expense = null, onClose }) {
  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: "Other",
    date: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (expense) {
      setForm({
        name: expense.name,
        amount: expense.amount,
        category: expense.category || "Other",
        date: expense.date ? new Date(expense.date).toISOString().slice(0, 10) : "",
        notes: expense.notes || "",
      });
    }
  }, [expense]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || form.amount === "" || Number(form.amount) < 0)
      return alert("Please enter valid name and amount");

    setSaving(true);
    try {
      if (expense) {
        await axios.put(`/expenses/${expense._id}`, form);
      } else {
        await axios.post("/expenses", form);
      }
      onClose();
    } catch (err) {
      alert(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const labelStyle = { display: "block", marginBottom: "4px", fontWeight: 500 };
  const inputStyle = {
    width: "100%",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    marginBottom: "12px",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.2)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--bg)",
          padding: "20px",
          width: "90%",
          maxWidth: "500px",
          borderRadius: "8px",
        }}
      >
        <h3 style={{ marginBottom: "12px" }}>{expense ? "Edit" : "Add"} Expense</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={labelStyle}>Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Amount (₱)</label>
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={labelStyle}>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={inputStyle}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginTop: "12px" }}>
          <label style={labelStyle}>Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            style={{ ...inputStyle, resize: "none" }}
          />
        </div>

        <div style={{ marginTop: "16px", textAlign: "right" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 14px",
              background: "#ccc",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginRight: "8px",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "8px 14px",
              background: "var(--accent1)",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
