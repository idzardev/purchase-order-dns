# Retail Distribution Point of Sales (POS) System

## Purchase Order - CV. Duta Niaga Sejalan

## 📋 Project Overview

Web-based Point of Sales application for managing retail distributor orders with streamlined sales and purchase order management.

## 🚀 Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL (Neon DB)
- Shadcn UI + Tailwind CSS
- Auth.js
- Zod
- Uploadthing
- Vercel Deployment

## 🔧 Prerequisites

- Node.js (v18 or later)
- npm/yarn
- PostgreSQL Database
- Google OAuth Credentials
- Neon DB Account
- Uploadthing Account

## 📦 Installation

### 1. Clone Repository

```bash
git clone https://github.com/idzardev/purchase-order-dns.git
cd purchase-order-dns
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create `.env` file with following variables:

```
DATABASE_URL=
```

### 4. Database Setup

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
```

## 🔐 Authentication

- Login via Google OAuth
- Role-based access control

## 📊 Key Features

- Store Management
- Product Tracking
- Purchase Order Creation
- Flexible Pricing (Grosir, Semi Grosir, Retail, Modern, Custom)
- Purchase Order Generation

## Business Process

1. Sales Create Order

   - Select/Create Store
   - Add Products
   - Save as Draft
   - Edit before Admin Review

2. Admin Review

   - Review Order Details
   - Modify if necessary
   - Change Status to SETUJU
   - Generate Purchase Order

3. Purchase Order
   - Digital PO Generation
   - PDF Export
   - Printed by Admin

## 🚧 Development Roadmap

- MVP: Core POS Functionality
- Future: E-commerce Integration
- Future: Advanced Reporting

## 👥 Team

- Developer 1 (idzardev@gmail.com as owner)
- Developer 2 (azizsyam503@gmail.com as developer)

## 📜 License

[Specify License]

## 📞 Support

[Contact Information]

## 📚 Other Documentations
