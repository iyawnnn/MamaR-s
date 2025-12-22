import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import dayjs from 'dayjs';

export default function StockHistoryPage() {
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/stock-logs');
        setLogs(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLogs();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = logs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="stock-history-page">
      <h2 className="page-title">Stock History</h2>

      <table className="sales-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Change</th>
            <th>Reason</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {currentLogs.map((l) => (
            <tr key={l._id}>
              <td>{l.productId?.name || '—'}</td>
              <td>{l.change}</td>
              <td>{l.reason}</td>
              <td>{dayjs(l.date).format('YYYY-MM-DD HH:mm')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
