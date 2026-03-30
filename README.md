# ABC Mall Smart Management System

A beautiful, full-stack MERN (MongoDB, Express, React, Node.js) application built to handle complex, role-based interaction for a shopping mall ecosystem.

## 🚀 Features

*   **Role-Based Access Control**: Securely partitions permissions manually to Admins, Shop Owners, and Customers.
*   **Immersive Login Experience**: Utilizes a highly complex, keyframe-animated 3D orbit background that intelligently converts any basic SVGs into ghostly spinning brand silhouettes. 
*   **Dynamic Interactive Rating System**: Live computation of shop-wide ratings based exclusively on real customer product reviews.
*   **Currency Localization (INR)**: Deeply formats thousands of mathematical conversions intelligently to represent ₹.

## 🛠 Tech Stack

*   **Frontend**: React.js, Vite, Tailwind CSS v4, Axios, React Router, Lucide React
*   **Backend**: Node.js, Express.js, MongoDB / Mongoose, jsonwebtoken (JWT), CORS, bcryptjs
*   **Styling**: Modern frosted-glass design logic inspired heavily by Shadcn/UI conventions.

## 💻 Local Development Setup

To run this massive project locally on your machine, you must spin up both the **Frontend** and the **Backend** development servers simultaneously.

### 1. Database & Backend Configuration
1. Navigate to the backend: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file containing the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   ```
4. Seed the database with mall items (Optional): `node seed.js`
5. Start the server: `npm run dev` (Runs constantly tracking changes on port 5000)

### 2. Frontend Application Configuration
1. Open a *new* terminal window.
2. Navigate to the frontend: `cd frontend`
3. Install dependencies: `npm install`
4. Spin up Vite: `npm run dev` (Usually attaches to port 5173 or 5174)

---

## ☁️ Deployment Guidelines (Vercel + Backend Host)

Because this is a MERN stack application, it is conceptually decoupled. 

1. **Frontend**: Simply connect your GitHub repository to **Vercel**. Important: Make sure to configure the **Root Directory** settings to exactly `frontend`. Our repository contains an active `vercel.json` SPA configuration that guarantees your live application will immediately redirect React links without throwing standard 404 errors.
2. **Backend**: Because Vercel targets React / Static pages natively, the Express backend must be hosted dynamically via **Render.com** (or Railway). 

### Linking The Live Apps
Once your backend is successfully hosted on Render (e.g. `https://mall-api.render.com`), you must rewrite the hardcoded internal URLs inside your `Login.jsx`, `CustomerView.jsx`, and `AdminDashboard.jsx` files from `http://localhost:5000/api/...` to your new active production link!
