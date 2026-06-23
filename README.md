# Renterty Backend Server

> [!IMPORTANT]
> **Deployment & Repository Information**
> - **API Live Server**: [Renterty API Server](https://renterty-server.vercel.app)
> - **Client Repository**: [Client GitHub Repository](https://github.com/tayabunn/renterty-client)
> - **Server Repository**: [Server GitHub Repository](https://github.com/tayabunn/renterty-server)

Renterty is a transparent, secure, and modern property rental marketplace connecting tenants, property owners, and administrators. This repository hosts the full Node.js, Express, and Mongoose backend server powering the platform.

## Purpose
The backend API server facilitates roles management, secure property listing verification pipelines, payment verification with Stripe, database operations with MongoDB Atlas, and PDF generation for booking reports. It utilizes Better Auth as a secure OAuth and email auth platform.

## Key Features
- **Serverless DB Connection Cache**: Cached connection-assurance middleware guaranteeing reliable Mongoose calls for every cold start in serverless Vercel function instances.
- **Better Auth Integration**: Multi-provider email and social login handlers integrated alongside custom Mongoose verification middlewares.
- **Automated PDF Compilation**: Dynamic server-side compiled transaction receipts and analytics spreadsheets built on-the-fly using PDFKit.
- **Secure Reservation Checkout**: Stripe API payment intent creation with server-side validation.
- **RESTful Role Authorization**: Secure role-checking gates (`Tenant`, `Owner`, `Admin`) restricting critical routes to their corresponding accounts.

## Technologies and Packages Used
- **Runtime**: `Node.js`
- **Web Framework**: `Express.js (v5)`
- **Database ORM**: `Mongoose (v9)`
- **Authentication**: `Better Auth (v1)` & `jsonwebtoken (v9)`
- **Stripe Payments**: `stripe (v22)`
- **PDF Generation**: `pdfkit (v0.19)`
- **CORS Handling**: `cors`
- **Environment Variables**: `dotenv`

---

## Getting Started

### 1. Prerequisites
- **Node.js**: `v18+`
- **MongoDB**: Access to a MongoDB Atlas cluster or local database instance.

### 2. Configuration Settings
Create a `.env` file in the root directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
BETTER_AUTH_SECRET=your_better_auth_secret_key
BETTER_AUTH_URL=http://localhost:5000
```

### 3. Installation
```bash
npm install
```

### 4. Running Database Seed Script
Populate your database with the default system users (Admin, Owner, Tenant) and sample listings:
```bash
node seed.js
```

### 5. Running the Dev Server
```bash
npm run dev
```
The server will start running locally at [https://renterty-server.vercel.app](https://renterty-server.vercel.app).
