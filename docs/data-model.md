# Data Model (MongoDB Collections)

## products
- _id: ObjectId
- name: string — required, unique per bakery
- category: string — enum: ["Bread","Pastry","Cake","Drink","Other"]
- costPrice: number — required, >= 0
- sellingPrice: number — required, >= 0
- stock: number — integer, >= 0
- lowStockThreshold: number — integer, default 5
- dateAdded: Date
- archived: boolean — default false

### Example
{
  "_id": ObjectId("..."),
  "name": "Chocolate Cake",
  "category": "Cake",
  "costPrice": 200,
  "sellingPrice": 300,
  "stock": 15,
  "lowStockThreshold": 5,
  "dateAdded": ISODate("2025-10-15T..."),
  "archived": false
}

## sales
- _id: ObjectId
- productId: ObjectId (ref products)
- quantity: number (integer > 0)
- discount: number (>= 0)
- grossAmount: number (quantity * sellingPrice) — computed at write time
- netAmount: number (grossAmount - discount) — computed
- cogs: number (quantity * costPrice) — computed
- soldBy: string (user id or email)
- date: Date

### Example
{
  "_id": ObjectId("..."),
  "productId": ObjectId("..."),
  "quantity": 3,
  "discount": 50,
  "grossAmount": 900,
  "netAmount": 850,
  "cogs": 600,
  "soldBy": "cashier@diofanys.ph",
  "date": ISODate("2025-10-15T...")
}

## expenses
- _id: ObjectId
- name: string
- amount: number (> 0)
- category: string (Ingredients, Rent, Utilities, Packaging, Salaries, Other)
- date: Date

### Example
{
  "_id": ObjectId("..."),
  "name": "Flour Purchase",
  "amount": 1200,
  "category": "Ingredients",
  "date": ISODate("2025-10-14T...")
}

## users
- _id: ObjectId
- email: string (unique, required)
- passwordHash: string (bcrypt)
- role: string (enum: ['admin','cashier'])
- createdAt: Date

### Indexes & Notes
- Index `products.name` (text or normal) for fast lookup.
- Index `sales.date` and `expenses.date` for range queries (reports).
- Optional: index `products.stock` for low-stock queries.
- Keep computed fields (grossAmount, cogs, netAmount) stored to preserve historical pricing.
