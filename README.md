# Mama R's Bakery Admin | Order & Inventory Management System

This system is a specialized administrative suite designed to centralize bakery operations. The primary objective of the platform is to provide a dedicated environment for tracking sales orders, managing inventory levels, and generating performance results. It is built to eliminate operational noise by focusing exclusively on order fulfillment and stock movement.


## Technical Solution

The application addresses the synchronization gap between storefront sales and warehouse stock. By automating the data flow from the Point of Sale to the Inventory Terminal, the system provides a real-time overview of business health without the need for manual bookkeeping.

### Key Functional Areas

* **Order Management (POS):** A high-speed interface for recording customer transactions. The system includes a responsive transaction history with server-side pagination and horizontal scrolling to maintain data integrity on mobile devices.
* **Inventory Terminal:** A centralized hub for monitoring stock levels. It includes automated "Low Stock" visual cues and a comprehensive audit trail through stock history logs.
* **Intelligence Reporting:** An analytics module that aggregates raw sales data into actionable metrics. Users can toggle performance views across 24-hour, 7-day, and 30-day windows and export data to CSV for external auditing.


## Tech Stack

The platform is built using the **MERN Stack**, ensuring a unified JavaScript environment for both client and server operations.


### Frontend
* **React:** Used for building a component-based interface with optimized hooks for state management and real-time calculations.
* **Tailwind CSS:** Implementation of a fluid layout system that scales from mobile devices to ultra-wide desktop monitors (1600px+).
* **Lucide React:** A consistent vector icon library for intuitive navigation.
* **Axios:** Manages asynchronous API communication with the backend service.

### Backend
* **Node.js & Express:** Handles the server-side logic, middleware, and RESTful API routing.
* **MongoDB:** A NoSQL database used for flexible storage of product schemas, sales records, and administrative logs.


## Deployment & Infrastructure

The system is architected for high availability using a decoupled deployment strategy:

* **Frontend Hosting:** Deployed on **Netlify**, utilizing continuous deployment from the GitHub main branch and optimized CDN delivery.
* **Backend Hosting:** The Express API and Node server are hosted on **Render**, providing a scalable environment for the application logic.
* **Database:** Hosted via **MongoDB Atlas**, ensuring secure, cloud-based data persistence.


## Operational Features

* **Fluid Padding Engine:** The workspace utilizes dynamic spacing logic that calculates margins based on screen resolution, providing a premium experience on large displays.
* **Responsive Data Tables:** Implementation of internal overflow containers. This allows users to swipe through columns on small screens while the rest of the application remains fixed.

* **Handheld Reachability:** Asymmetrical layout adjustments for devices under 768px, specifically aligning financial totals to the right side of the interface for easier thumb-access during high-traffic periods.