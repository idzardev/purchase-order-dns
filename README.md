# Retail Distribution POS System

## 📋 Project Overview

A web-based Point of Sales (POS) system designed for retail distribution management with flexible order processing and pricing mechanisms.

## 🎯 Key Features

- **Multi-role Access Control**: ADMIN, MANAGER, SALES, BASIC
- **Flexible Pricing System**: GROSIR, SEMI GROSIR, RETAIL, MODERN, CUSTOM
- **Order Management**: Draft → Approved → Delivered workflow
- **Store Management**: Store creation and verification system
- **Visit Tracking**: Sales visit logging with optional orders
- **Purchase Order Generation**: Automated PO creation and printing

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **UI Framework**: Shadcn UI + Tailwind CSS
- **Backend**: Prisma ORM + PostgreSQL (Vercel Prisma Postgres)
- **Authentication**: Auth Js
- **File Storage**: UploadThing
- **Deployment**: Vercel
- **Development Tools**: Pinggy

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (Vercel Prisma Postgres)
- Auth Js for authentication
- UploadThing account for image storage

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/idzardev/purchase-order-dns.git
   cd purchase-order-dns
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env.staging .env.production
   ```

   Fill in your environment variables:

   ```env
   # Database
   DATABASE_URL="postgresql://..."

   # Auth Js Authentication
   AUTH_SECRET=
   AUTH_GOOGLE_ID={CLIENT_ID}
   AUTH_GOOGLE_SECRET={CLIENT_SECRET}

   # UploadThing
   UPLOADTHING_TOKEN=""
   UPLOADTHING_SECRET=""
   UPLOADTHING_APP_ID=""


   # Region's API
   NEXT_PUBLIC_REGION_API_URL=""
   ```

4. **Database Setup**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

## 📊 System Requirements

- **Users**: 10-20 active users
- **Weekly Operations**:
  - ~100 store visits
  - ~50 orders
  - ~400 total stores

## 🔐 User Roles & Permissions

### ADMIN

- Full system control
- Product, Order, Store CRUD operations
- User management
- Purchase Order generation
- Complete visit history access

### MANAGER

- Read-only access to all modules
- Reporting and analytics

### SALES

- Create orders and visits
- Create new stores (auto-status: BARU)
- View own history only
- Limited edit capabilities

### BASIC

- Dashboard access only (limited)

## 📝 Order Flow

### Sales Process

1. **Login** → Google OAuth only
2. **Select/Create Store** → Status: BARU (for SALES)
3. **Create Visit** → Required step
4. **Add Orders** → Optional, flexible pricing
5. **Submit as DRAFT** → Editable until approved

### Admin Review

1. **Review DRAFT orders**
2. **Edit if necessary**
3. **Change status** → DISETUJUI
4. **Generate PO** → Print for processing

## 🏗 Project Structure

```
src/
├── app/                   # Next.js App Router
│   ├── (auth)/             # Authentication pages
│   ├── dashboard/          # Main application
│   └── api/                # API routes
├── components/            # Reusable components
│   ├── ui/                 # Shadcn UI components
│   └── shared/             # Shared components
├── lib/                   # Utilities
│   ├── auth/               # Auth
│   ├── prisma/             # Prisma client
│   └── utils/              # Helper functions
└── types/                 # TypeScript definitions
```

## 🎨 Pricing Mechanism

- **4 Fixed Prices** per product: GROSIR, SEMI GROSIR, RETAIL, MODERN
- **Custom Pricing** available with reason (SALES only)
- **Mixed pricing** within single order
- **Flexible discounts**: Per product, per order, or both

## 📱 Order ID Format

Auto-generated: `PO-YYYYMMDD-000`

Example: `PO-20241225-001`

## 🔒 Security Features

- Server-side access control
- Input validation
- Role-based permissions
- Secure authentication (Auth Js)
- SQL injection prevention (Prisma)

## 📈 Future Enhancements

- Advanced reporting
- Notification system
- Basic e-commerce integration
- Advanced inventory management

## 🤝 Contributing

1. Follow clean code principles
2. Use TypeScript strictly
3. Implement proper error handling
4. Write maintainable, simple code
5. Follow established patterns

## 📞 Support

- Development Timeline: 1 week
- Developer Level: Junior Full-stack
- Budget: Free tier services only

## 📄 License

Purchase Order Duta Niaga Sejalan 2025
