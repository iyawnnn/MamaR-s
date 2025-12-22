import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import SalesForm from "../components/SalesForm";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Limit per page

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/sales");
      setSales(res.data);
    } catch (err) {
      console.error("Failed to fetch sales", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(sales.length / itemsPerPage);
  const currentPageData = sales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <h2>Sales</h2>

      {/* Sale Form */}
      <SalesForm onSaleRecorded={fetchSales} />

      <hr style={{ margin: "20px 0" }} />

      <h3>Sales Records</h3>
      {loading ? (
        <p>Loading sales...</p>
      ) : sales.length === 0 ? (
        <p>No sales recorded yet.</p>
      ) : (
        <div>
          <table className="sales-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {currentPageData.map((s) => (
                <tr key={s._id}>
                  <td>
                    {new Date(s.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td>{s.customerName}</td>
                  <td>{s.productId?.name || "—"}</td>
                  <td>{s.quantity}</td>
                  <td>₱{Number(s.totalPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
