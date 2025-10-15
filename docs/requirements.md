# Phase 1 Requirements

## Functional requirements
- Products: create, read, update, delete (archive preferred).
- Products fields: name, category, costPrice, sellingPrice, stock, lowStockThreshold, dateAdded, archived.
- Sales: manual sales entry (product, qty, discount, date). Auto compute grossAmount, cogs, netAmount; decrement stock.
- Restock: add stock quantity via restock API.
- Expenses: create/read/update/delete expense records (name, amount, category, date).
- Dashboard: compute grossSales, discounts, netSales, totalCOGS, grossProfit, operatingExpenses, netProfit.
- Low-stock alert if stock < lowStockThreshold.
- Authentication: admin login with JWT for protected endpoints.

## Non-functional requirements
- Persist data in MongoDB Atlas M0.
- Protect admin routes with JWT; use bcrypt for password hashing.
- Host frontend on Vercel, backend on Render; use HTTPS in production.
- Responsive UI for desktop and tablet.
- Keep secrets out of repo (.env ignored).
