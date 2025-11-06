import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import "./ExpensesPage.css";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Other");
  const [notes, setNotes] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadExpenses = async () => {
    console.log("🔄 Loading expenses...");
    try {
      const { data } = await axios.get("/expenses");
      console.log("✅ Expenses loaded:", data);
      setExpenses(data);
    } catch (err) {
      console.error("❌ Failed to load expenses", err);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🟦 Form submitted");

    if (!name || !amount) {
      alert("Please enter valid name and amount.");
      console.warn("⚠️ Missing name or amount");
      return;
    }

    const newExpense = { 
      name, 
      amount: Number(amount), 
      category, 
      notes 
    };

    console.log("📦 Expense data to send:", newExpense);

    try {
      const response = await axios.post("/expenses", newExpense);
      console.log("✅ Expense added:", response.data);

      // Reset form
      setName("");
      setAmount("");
      setCategory("Other");
      setNotes("");

      await loadExpenses();
      alert("✅ Expense recorded!");
    } catch (err) {
      console.error("❌ Failed to add expense:", err.response || err.message || err);
      alert("❌ Failed to add expense. Check console for details.");
    }
  };

  const totalPages = Math.ceil(expenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentExpenses = expenses.slice(startIndex, startIndex + itemsPerPage);

  const inputStyle = {
    width: "100%",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  };

  return (
    <div style={{ width: "100%" }}>
      <h2>Expenses</h2>

      {/* === Expense Form === */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginBottom: "20px",
          position: "relative",
          zIndex: 5, // ensure clickable
        }}
      >
        {/* Name + Amount (same line) */}
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "4px" }}>Name</label>
            <input
              placeholder="Enter expense name"
              value={name}
              onChange={(e) => {
                console.log("✏️ Name changed:", e.target.value);
                setName(e.target.value);
              }}
              style={inputStyle}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "4px" }}>Amount (₱)</label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => {
                console.log("💰 Amount changed:", e.target.value);
                setAmount(e.target.value);
              }}
              style={inputStyle}
              required
            />
          </div>
        </div>

        {/* Category + Notes (same line) */}
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "4px" }}>Category</label>
            <select
              value={category}
              onChange={(e) => {
                console.log("📂 Category changed:", e.target.value);
                setCategory(e.target.value);
              }}
              style={inputStyle}
            >
              <option>Supplies</option>
              <option>Utilities</option>
              <option>Rent</option>
              <option>Wages</option>
              <option>Other</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "4px" }}>Notes</label>
            <textarea
              placeholder="Optional notes"
              value={notes}
              onChange={(e) => {
                console.log("📝 Notes changed:", e.target.value);
                setNotes(e.target.value);
              }}
              style={{
                ...inputStyle,
                resize: "none",
                height: "38px",
              }}
            />
          </div>
        </div>

        {/* Button full width */}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "8px 14px",
            background: "var(--accent1)",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => console.log("🖱️ Button clicked")}
        >
          Add Expense
        </button>
      </form>

      {/* === Expense Records Table === */}
      <h3>Expense Records</h3>
      {expenses.length === 0 ? (
        <p>No expenses recorded yet.</p>
      ) : (
        <>
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {currentExpenses.map((e) => (
                <tr key={e._id}>
                  <td>{e.name}</td>
                  <td>₱{Number(e.amount).toFixed(2)}</td>
                  <td>{e.category}</td>
                  <td>{e.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => {
                console.log("⬅️ Prev page clicked");
                setCurrentPage((p) => p - 1);
              }}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => {
                console.log("➡️ Next page clicked");
                setCurrentPage((p) => p + 1);
              }}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
