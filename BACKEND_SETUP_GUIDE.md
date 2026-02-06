# BuyData.Shop Backend Setup Guide

## 🎯 Architecture Overview

BuyData.Shop is now a complete backend-powered platform with:
- **Agent Platform**: Register, activate (GH₵20), and earn commissions
- **Authentication**: Secure login/registration with NextAuth + Prisma
- **Unique Agent Links**: Short custom URLs (e.g., buydata.shop/great-data-17687)
- **Customer Shop**: Beautiful product pages powered by DataMart API
- **Payment Gateway**: Paystack for both activation and product purchases

---

## 📋 Prerequisites

Ensure you have:
- Node.js 18+ 
- PostgreSQL database (local or cloud)
- Paystack account (Live keys configured)
- Git

---

## 🚀 Step-by-Step Setup

### 1. Database Setup

#### Option A: PostgreSQL Local (Recommended for Development)

```bash
# Install PostgreSQL if needed
# https://www.postgresql.org/download/

# Create database
createdb buydata_shop

# Update .env.local with your database URL
# DATABASE_URL="postgresql://user:password@localhost:5432/buydata_shop"
```

#### Option B: PostgreSQL Cloud (Recommended for Production)

- Use [Vercel Postgres](https://vercel.com/storage/postgres)
- Use [Supabase](https://supabase.com)
- Use [Railway](https://railway.app)

Update `DATABASE_URL` in `.env.local` with your cloud database URL.

---

### 2. Environment Variables

Edit `.env.local` and ensure these are configured:

```env
# ===== DATABASE =====
DATABASE_URL="postgresql://user:password@localhost:5432/buydata_shop"

# ===== NEXTAUTH =====
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# ===== PAYSTACK =====
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key_here
PAYSTACK_SECRET_KEY=your_paystack_secret_key_here

# ===== DATAMART API =====
NEXT_PUBLIC_DATAMART_API_BASE=https://api.datamartgh.shop/api/developer
DATAMART_API_KEY=your_datamart_api_key_here

# ===== DEVELOPMENT =====
NEXT_PUBLIC_DEV_MODE=true
NODE_ENV=development
```

**To generate a secure NEXTAUTH_SECRET:**
```powershell
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString())) + (Get-Random -Minimum 10000 -Maximum 99999)
```

---

### 3. Prisma Database Initialization

```bash
# Generate Prisma client
npm run prisma:generate

# Create migrations
npm run prisma:migrate

# (Optional) Seed test data
npm run prisma:seed
```

This will:
- Create all database tables (Agent, Transaction, Order, etc.)
- Create indexes for performance
- Setup enum types for statuses

---

### 4. Run Development Server

```bash
# Start dev server on port 3000
$env:PORT=3000; npm run dev

# Or use the startup script
.\dev.ps1         # PowerShell
.\dev.bat         # Command Prompt
```

---

## 📱 Testing the Platform

### 1. **Homepage** (Public)
- Visit: `http://localhost:3000`
- See: Features, pricing (GH₵20), and call-to-action buttons

### 2. **Registration** (Agent Signup)
- URL: `http://localhost:3000/register`
- Fill: Name, email, phone, business name, password
- Note: Generates unique slug automatically

### 3. **Pending Activation** (Post-Signup)
- URL: `http://localhost:3000/pending?agentId=XXX`
- Shows: Activation fee (GH₵20) and payment button
- Dev Mode: Redirects to mock payment success page
- Production Mode: Redirects to Paystack checkout

### 4. **Activation Payment** (Paystack Integration)
- Powered by: Paystack Payment Gateway
- Amount: 20 GHS (kobo = 2000)
- Test Card (dev mode): Any valid test card
- Success: Agent account activated, receives unique link

### 5. **Agent Dashboard** (Protected)
- URL: `http://localhost:3000/dashboard` (requires login)
- Shows: Agent link, earnings, profile info
- Features: Copy shop link, view orders, edit profile

### 6. **Agent Shop Page** (Public)
- URL: `http://localhost:3000/{agent-slug}`
- Example: `http://localhost:3000/great-data-17687`
- Shows: Agent branding, product catalog, "Buy Now" buttons

### 7. **Customer Checkout** (Product Purchase)
- Customer clicks "Buy Now" on product
- Enters: Email, phone, selects network
- Pays via: Paystack
- Auto-fulfilled by: DataMart API

---

## 🎨 Design Features

### Color Scheme
- **Primary**: #090560 (Dark Purple)
- **White**: #ffffff
- **Accent**: #6366f1 (Indigo)
- **Success**: #10b981 (Green)

### UI Components
- Gradient headers with icon badges
- Card-based layouts with hover effects
- Smooth transitions and animations
- Mobile-responsive design
- Beautiful form inputs with focus states

---

## 📊 Database Schema

### Agent Table
```sql
- id (UUID)
- email (UNIQUE)
- password (hashed)
- name, phone, businessName
- status: PENDING | ACTIVATED | SUSPENDED | DELETED
- slug (UNIQUE, short URL)
- totalEarned, totalWithdrawn, balance
- commissionRate (default 0.10 = 10%)
- logo, coverImage
- createdAt, activatedAt
```

### Transaction Table
```sql
- id (UUID)
- agentId (foreign key)
- type: ACTIVATION | ORDER
- reference (UNIQUE, for Paystack)
- amount (GHS), amountKobo
- status: PENDING | INITIALIZED | COMPLETED | FAILED
- paystackTransactionId
- accessCode, authorizationUrl
```

### Order Table
```sql
- id (UUID)
- agentId (foreign key)
- customerEmail, customerPhone
- productId, productName, network, capacity, price
- commission (calculated)
- agentEarning (calculated)
- status: PENDING | PAID | PROCESSING | COMPLETED | FAILED
- datamartOrderId (response from DataMart)
- datamartStatus
```

### AgentProduct Table
```sql
- id (UUID)
- agentId (foreign key)
- productId (DataMart ID)
- name, network, capacity, price, description, image
```

---

## 🔐 Authentication Flow

### Signup (Unauthenticated)
1. User visits `/register`
2. Fills form → POST `/api/auth/register`
3. Password hashed with bcryptjs (salt=12)
4. Agent created with status=PENDING
5. Unique slug generated
6. Redirected to `/pending?agentId=XXX`

### Activation (Pending)
1. Agent visits `/pending`
2. Clicks "Proceed to Payment"
3. POST `/api/activation/init`:
   - Dev mode: Returns mock Paystack response
   - Production: Calls real Paystack API
4. Redirected to Paystack payment portal
5. After payment → GET `/api/activation/verify`
6. Agent status Updated to ACTIVATED
7. Redirected to `/activation-success`

### Login (Returning Agent)
1. Agent visits `/login`
2. Enters email + password
3. NextAuth `/api/auth/callback/credentials`:
   - Finds agent by email
   - Compares password hash
   - Creates session
4. Redirected to `/dashboard`

### Dashboard (Protected)
- All routes require NextAuth session
- Unauthorized → Redirected to `/login`
- Session token stored in httpOnly cookie
- Auto-logout after 30 days

---

## 🔗 API Routes

### Auth Routes
- **POST** `/api/auth/register` - Create agent account
- **POST** `/api/auth/[...nextauth]` - NextAuth handlers

### Activation Routes
- **POST** `/api/activation/init` - Initialize GH₵20 payment
- **GET** `/api/activation/verify` - Verify payment from Paystack
- **POST** `/api/activation/verify` - Webhook from Paystack

### Agent Routes
- **GET** `/api/agent/profile` - Get logged-in agent details  
- **PUT** `/api/agent/profile` - Update agent profile

### Payment Routes (To be added)
- **POST** `/api/orders/checkout` - Initialize product purchase
- **GET** `/api/orders/verify` - Verify product payment
- **POST** `/api/orders/verify` - Paystack webhook for orders

### DataMart Integration (To be added)
- **POST** `/api/datamart/order` - Send confirmed order to DataMart
- **GET** `/api/datamart/products` - Fetch available packages

---

## 🚨 Error Handling

### Common Issues

**1. "address already in use :::3000"**
```powershell
# Use startup script
.\dev.ps1
```

**2. "Cannot find module prisma"**
```bash
npm install @prisma/client prisma
npm run prisma:generate
```

**3. "DATABASE_URL is not set"**
- Check `.env.local` file
- Ensure database URL is correct
- Test connection: `npm run prisma:studio`

**4. "session is null in dashboard"**
- Agent not logged in
- Check browser cookies for `next-auth.session-token`
- Try signing in again

---

## 📝 Remaining Tasks

These features are ready for completion:

### Phase 1: Complete Integration ✅
- [x] Backend setup (Prisma + NextAuth + PostgreSQL)
- [x] Agent registration flow
- [x] Activation payment (GH₵20)
- [x] Agent dashboard
- [x] Agent shop pages
- [ ] **Product checkout API route** (Similar to `/api/checkout`)
- [ ] **DataMart order creation** (When payment confirmed)
- [ ] **Webhook verification** (Handle Paystack callbacks)

### Phase 2: Analytics & Features 📊
- [ ] Agent order history API
- [ ] Agent analytics (sales, revenue, top products)
- [ ] Customer order tracking
- [ ] Email notifications (order confirmations)
- [ ] Withdrawal/payout management

### Phase 3: Admin Dashboard 👨‍💼
- [ ] Admin panel to manage agents
- [ ] Admin analytics (total revenue, agents, orders)
- [ ] Dispute resolution
- [ ] Agent verification and approval

### Phase 4: Mobile App
- [ ] React Native or Flutter app
- [ ] Push notifications
- [ ] Offline mode

---

## 🎯 Next Steps

1. **Setup Database**
   ```bash
   npm run prisma:migrate
   ```

2. **Test Local**
   ```bash
   npm run dev
   # Visit http://localhost:3000
   ```

3. **Register Test Agent**
   - Email: test@example.com
   - Password: Test1234
   - Business: Test Business

4. **Activate Account**
   - Pay GH₵20 (dev mode will mock it)
   - Receive activation confirmation

5. **Customize Dashboard** (Next: `/dashboard/settings`)
   - Upload business logo
   - Add business description
   - Set profile info

6. **Share Agent Link**
   - Copy unique link from dashboard
   - Share on WhatsApp, Instagram, etc.
   - Customers can buy data 24/7

---

## 📞 Support

For issues:
1. Check error messages in terminal
2. Review Prisma schema and migrations
3. Test database connection: `npm run prisma:studio`
4. Check `.env.local` configuration
5. Review NextAuth logs: `NEXTAUTH_DEBUG=1 npm run dev`

---

## 🎉 Success Indicators

You'll know it's working when:

✅ Homepage loads at `http://localhost:3000`
✅ Can register at `/register`
✅ Can login at `/login`
✅ Dashboard shows at `/dashboard` when authenticated
✅ Agent shop page loads at `/{slug}`
✅ Products display on agent shop
✅ Checkout form appears on product click

---

**Happy coding! 🚀**
