# MamaR’s — Sales and Inventory Management System

MamaR’s is a **web-based Sales and Inventory Management System** designed to help small to medium retail businesses efficiently manage products, sales, and performance insights — all in one place.

This project is built with the **MERN stack (MongoDB, Express, React, Node.js)** and features a responsive, modern UI for real-world shop management.

---

## Features

### Product Management
- Add, edit, and delete products
- Manage categories and stock quantities
- Automatic product archiving when deleted

### Sales Management
- Record daily sales transactions
- Calculate gross, net, and cost of goods sold (COGS)
- Apply discounts dynamically
- View all sales history in a searchable and filterable table

### Dashboard & Reports
- KPI summary cards (Total Sales, Gross, Net, Profit)
- Date range filter with quick presets (7d / 30d)
- Interactive charts:
  - **Sales Over Time (Line Chart)**
  - **Gross vs Net Comparison (Bar Chart)**
  - **Sales by Category (Pie Chart)**
- Auto-fetches data for the selected date range

### User Authentication
- Secure login with JWT authentication
- Role-based access (admin / staff)
- Persistent user sessions

### Backend API
- RESTful API with Express
- MongoDB for storage (hosted on Atlas)
- CORS-enabled for frontend access

---

## Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React + Vite |
| **Backend** | Node.js + Express |
| **Database** | MongoDB (via Mongoose) |
| **Styling** | Custom CSS + Bootstrap Icons |
| **Deployment** | Render (Backend) + Netlify (Frontend) |

---
