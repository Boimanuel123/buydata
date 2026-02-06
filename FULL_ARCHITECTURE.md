# BuyData.Shop - Complete Architecture & Blueprint

## 🎯 Project Overview

**BuyData.Shop** is a full-stack data reselling platform built with Next.js 15, PostgreSQL, and Paystack.

### Key Concept
- **Agents** (resellers) register and pay GH₵20 to activate their account
- Each agent gets a **unique short link** (e.g., `buydata.shop/great-data-17687`)
- Agents share link with customers who buy data packages
- Customers buy via **Paystack**, data fulfilled by **DataMart API**
- Agents earn **10% commission** on each sale

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BUYDATA.SHOP PLATFORM                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │  PUBLIC PAGES    │  │  AGENT PAGES     │  │ API ROUTES │ │
│  ├──────────────────┤  ├──────────────────┤  ├────────────┤ │
│  │ • Homepage       │  │ • Dashboard      │  │ • Auth     │ │
│  │ • Register       │  │ • Profile        │  │ • Checkout │ │
│  │ • Login          │  │ • Orders         │  │ • Orders   │ │
│  │ • Pending        │  │ • Earnings       │  │ • Verify   │ │
│  │ • [slug]         │  │ • Settings       │  │ • Webhooks │ │
│  │   (agent store)  │  │                  │  │            │ │
│  └──────────────────┘  └──────────────────┘  └────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              NEXTAUTH AUTHENTICATION                    │ │
│  │  • Sessions • JWT Tokens • Credentials Provider         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │            DATABASE (POSTGRESQL/PRISMA)                 │ │
│  │  • Agents • Transactions • Orders • Products • Sessions │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         │                          │                    │
         v                          v                    v
    ┌─────────────┐         ┌──────────────┐    ┌──────────────┐
    │ PAYSTACK    │         │ DATAMART     │    │ DATASELL     │
    │ PAYMENT     │         │ API          │    │ (OPTIONAL)   │
    │ GATEWAY     │         │ FULFILLMENT  │    │ INTEGRATION  │
    └─────────────┘         └──────────────┘    └──────────────┘
```

---

## 📋 Database Schema

### Agent Table
```
id (UUID)
email (UNIQUE)
password (hashed with bcryptjs, salt=12)
name, phone, businessName, description
status: PENDING | ACTIVATED | SUSPENDED | DELETED
slug (UNIQUE) - e.g., "great-data-17687" (9 chars max for short URLs)
totalEarned, totalWithdrawn, balance
commissionRate (default 0.10)
logo, coverImage
createdAt, updatedAt, activatedAt
```

### Transaction Table
```
id (UUID)
agentId (foreign key)
type: ACTIVATION | ORDER
reference (UNIQUE) - Paystack reference
amount (GHS), amountKobo
status: PENDING | INITIALIZED | COMPLETED | FAILED
paystackTransactionId, accessCode, authorizationUrl
orderId (for ORDER type)
verifiedAt, createdAt
```

### Order Table
```
id (UUID)
agentId (foreign key)
customerEmail, customerPhone
productId, productName, network, capacity, price
commission (calculated), agentEarning
status: PENDING | PAID | PROCESSING | COMPLETED | FAILED
datamartOrderId (response)
datamartStatus
createdAt, completedAt
```

### AgentProduct Table
```
id (UUID)
agentId (foreign key)
productId (DataMart ID)
name, network, capacity, price, description, image
createdAt, updatedAt
```

---

## 🔐 Authentication & Session Flow

### Flow Diagram
```
┌────────────┐
│  Register  │ → POST /api/auth/register
└────────────┘    • Hash password (bcryptjs)
      │           • Create agent (status: PENDING)
      │           • Generate unique slug
      v
┌────────────┐
│   Pending  │ → /pending?agentId=XXX
└────────────┘    • Shows activation fee
      │           • "Proceed to Payment" button
      │
      v
┌────────────┐
│ Activation │ → POST /api/activation/init
└────────────┘    • Dev mode: mock response
      │           • Prod: calls Paystack API
      │
      v
┌────────────┐
│  Paystack  │ → GET /api/activation/verify
└────────────┘    • Dev mode: auto-complete
      │           • Prod: calls Paystack to verify
      │
      v
┌────────────┐
│  Success   │    • Agent status: ACTIVATED
└────────────┘    • Receives unique link
      │           • Receive activation email
      │
      v
┌────────────┐
│   Login    │ → NextAuth Credentials Provider
└────────────┘    • Email + password verification
      │           • Session token created (JWT)
      │           • httpOnly cookie stored
      │
      v
┌────────────┐
│ Dashboard  │    • Protected route (requires session)
└────────────┘    • Shows earnings, profile, orders
```

### Session Cookie Structure
```
Secure httpOnly Cookie: next-auth.session-token
├── Payload:
│   ├── sub (agent ID)
│   ├── email
│   ├── status (PENDING/ACTIVATED)
│   └── slug
├── Expires: 30 days
└── HttpOnly: true (not accessible from JavaScript)
```

---

## 🛒 Customer Purchase Flow

```
Customer visits: buydata.shop/great-data-17687
         │
         v
┌─────────────────────────────────┐
│ Agent Shop Page (Public)        │
│ • Show agent branding           │
│ • Display products              │
│ • "Buy Now" button              │
└─────────────────────────────────┘
         │
         v
┌─────────────────────────────────┐
│ Checkout Modal                  │
│ • Phone number (required)       │
│ • Email (optional)              │
│ • Product details               │
└─────────────────────────────────┘
         │
         v
POST /api/orders/checkout
    ├── Create order record
    ├── Create transaction record
    ├── Calculate commission
    └── Initialize Paystack
         │
         v
┌─────────────────────────────────┐
│ Paystack Payment Gateway        │
│ • Collect payment               │
│ • Secure checkout page          │
└─────────────────────────────────┘
         │
         v
GET /api/orders/verify
    ├── Verify with Paystack
    ├── Update order status
    ├── Update agent balance
    └── Send to DataMart
         │
         v
┌─────────────────────────────────┐
│ Order Success Page              │
│ • Confirmation message          │
│ • Transaction reference         │
│ • Delivery status               │
└─────────────────────────────────┘
         │
         v
┌─────────────────────────────────┐
│ DataMart (Fulfillment)          │
│ • Receive order                 │
│ • Send data to phone            │
│ • SMS notification              │
└─────────────────────────────────┘
```

---

##  Color Scheme & UI Design

### Primary Colors
- **#090560** (Dark Purple) - Primary buttons, headings, accents
- **#ffffff** (White) - Background, cards
- **#6366f1** (Indigo) - Secondary accents, badges
- **#10b981** (Green) - Success states
- **#f59e0b** (Amber) - Warnings
- **#ef4444** (Red) - Errors
- **#f3f0ff** (Light Purple) - Backgrounds, card backgrounds

### Design Patterns
- **Rounded corners**: 2xl for major containers, lg for inputs
- **Shadows**: xl for cards, lg for buttons on hover
- **Spacing**: 4 (16px) base unit for padding/margins
- **Transitions**: All transitions 200-300ms smooth
- **Icons**: lucide-react for consistency

---

## 🔌 API Endpoints Summary

### Auth Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/api/auth/register` | Create new agent account | No |
| POST | `/api/auth/[...nextauth]` | NextAuth handlers (login, session, etc.) | No |

### Activation Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/api/activation/init` | Create GH₵20 payment | Yes |
| GET | `/api/activation/verify` | Verify Paystack payment | No |
| POST | `/api/activation/verify` | Webhook from Paystack | No |

### Agent Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/api/agent/profile` | Get logged-in agent details | Yes |
| PUT | `/api/agent/profile` | Update agent profile | Yes |

### Order Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/api/orders/checkout` | Initialize product purchase | No |
| GET | `/api/orders/verify` | Verify order payment | No |
| POST | `/api/orders/verify` | Webhook from Paystack | No |

---

## 🎨 Pages & Routes

### Public Pages (No Auth Required)
```
/                          → Homepage with features, pricing
/register                  → Agent registration form
/login                     → Agent login form
/pending?agentId=XXX       → Pending activation page
/[slug]                    → Agent shop page (customer view)
/order-success             → Order confirmation
/activation-success        → Activation confirmation
/activation-failed         → Activation error page
```

### Protected Pages (Auth Required)
```
/dashboard                 → Agent dashboard (main)
/dashboard/orders          → Agent order history
/dashboard/settings        → Agent profile edit
/dashboard/analytics       → Sales analytics (future)
/dashboard/wallet          → Wallet & withdrawals (future)
```

---

## 🚀 Key Features Built

### ✅ Completed
1. **Agent Registration**
   - Full form validation (name, email, phone, business name)
   - Unique slug auto-generation
   - Password hashing with bcryptjs
   - Account status tracking

2. **Authentication**
   - NextAuth with Credentials Provider
   - Secure password hashing
   - JWT session tokens
   - Protected routes

3. **Agent Activation**
   - GH₵20 payment via Paystack
   - Dev mode for testing (mock responses)
   - Status update after payment verification
   - Success confirmation page

4. **Agent Dashboard**
   - View unique shop link
   - Copy link functionality
   - See earnings and statistics
   - Profile information display
   - Edit profile (planned)

5. **Agent Shop Pages**
   - Beautiful product listings
   - Agent branding display
   - Network/capacity badges
   - Product images
   - "Buy Now" buttons

6. **Customer Checkout**
   - Phone number validation
   - Email collection (optional)
   - Paystack integration
   - Dev mode testing
   - Smooth order flow

7. **UI/Styling**
   - Consistent #090560 + white color scheme
   - Beautiful components with Tailwind CSS
   - Responsive mobile design
   - Smooth animations and transitions
   - Professional icons with lucide-react

### ⏳ To Be Completed
1. **Order Management**
   - Store orders in database
   - Calculate commission automatically
   - Update agent balance

2. **DataMart Integration**
   - Send confirmed orders to DataMart API
   - Handle fulfillment status updates
   - Track delivery status

3. **Analytics**
   - Sales reports
   - Revenue tracking
   - Top products
   - Customer demographics

4. **Email Notifications**
   - Order confirmation emails
   - Payment receipts
   - Delivery notifications

5. **Agent Withdrawals**
   - Payout requests
   - Mobile money transfers
   - Transaction history

6. **Admin Dashboard**
   - Manage agents
   - View platform analytics
   - Dispute resolution

---

## 🔧 Environment Variables Needed

```env
# PostgreSQL Database
DATABASE_URL="postgresql://user:password@host:5432/buydata_shop"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secure-random-string-here

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxx
PAYSTACK_SECRET_KEY=sk_live_xxx

# DataMart API
NEXT_PUBLIC_DATAMART_API_BASE=https://api.datamartgh.shop/api/developer
DATAMART_API_KEY=your-api-key

# Development
NEXT_PUBLIC_DEV_MODE=true
NODE_ENV=development
```

---

## 📦 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS 3.4** - Utility CSS
- **React Hook Form** - Form validation
- **Zod** - Schema validation
- **lucide-react** - Icons
- **NextAuth.js** - Authentication

### Backend
- **Node.js** - JavaScript runtime
- **PostgreSQL** - Database
- **Prisma** - ORM
- **bcryptjs** - Password hashing
- **Axios** - HTTP client

### Payment & APIs
- **Paystack** - Payment gateway
- **DataMart** - Data fulfillment API

### Development
- **TypeScript** - Type safety
- **ESLint** - Code linting
- **npm** - Package manager

---

## 🎯 Success Criteria

Your platform is working when:

✅ Public homepage loads at `/`
✅ Can register new agent at `/register`
✅ Agent sent to `/pending` after registration
✅ Can activate account with GH₵20 payment
✅ Agent redirected to `/dashboard` after activation
✅ Can login with credentials
✅ Dashboard shows unique agent link
✅ Customer can visit agent link at `/[slug]`
✅ Products display on agent shop
✅ Customer can checkout with phone
✅ Paystack payment works (dev or real)
✅ Order success page shows confirmation
✅ Agent balance updates (pending)
✅ DataMart sends data to phone (pending)

---

## 🔄 Workflow Summary

### For Agents
1. Visit `buydata.shop` → Click "Join as Agent"
2. Fill registration form → Submit
3. Get redirected to `/pending`
4. Click "Proceed to Payment"
5. Pay GH₵20 via Paystack
6. Account activated, get unique link
7. Share link: `buydata.shop/great-data-17687`
8. Each sale = 10% commission earned

### For Customers
1. Receive agent link from friend/social media
2. Visit `buydata.shop/great-data-17687`
3. See products and prices
4. Click "Buy Now" on product
5. Enter phone number
6. Pay via Paystack
7. Data delivered to phone within 5 minutes
8. Can buy more products

---

## 📞 Support & Troubleshooting

### Common Issues

**Q: "Address already in use :::3000"**
A: Run `.\dev.ps1` or `.\dev.bat` to automatically kill and restart

**Q: Database connection error**
A: Check `DATABASE_URL` in `.env.local`, test with `npm run prisma:studio`

**Q: Paystack payment not working**
A: Verify API keys in `.env.local`, check `NEXT_PUBLIC_DEV_MODE` setting

**Q: Can't login after registration**
A: Ensure database migrations ran: `npm run prisma:migrate`

**Q: Agent slug not unique**
A: The system auto-generates from timestamp, should be unique but delete duplicates if needed

---

## 🎉 Next Steps

1. **Setup Database**
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

2. **Start Development**
   ```bash
   npm run dev
   ```

3. **Test The Platform**
   - Visit http://localhost:3000
   - Register a test agent
   - Activate with GH₵20 (dev mode)
   - Share agent link

4. **Deploy**
   - Push to GitHub
   - Deploy to Vercel
   - Update domain DNS
   - Configure production database
   - Update Paystack production keys

---

**Happy Building! 🚀**
