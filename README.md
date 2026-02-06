# BuyData Shop - Agent Storefront Platform

A secure, headless storefront platform for data reselling agents. Agents receive a unique store slug that links directly to their personalized storefront with their own branding, pricing markups, and direct checkout experience.

## System Architecture

**Three-System Integration:**

```
┌─────────────────────────────────────────┐
│       datasell.store                    │
│  • Agent registration & management      │
│  • Product catalog                      │
│  • Analytics & commission tracking      │
└──────────────┬────────────────────────┘
               │ API: GET /agents/{slug}
               │ API: GET /products
               ↓
┌──────────────────────────────────────────┐
│         buydata.shop (THIS PROJECT)      │
│  • Agent storefronts                     │
│  • ONE shared Paystack account           │
│  • Order routing                         │
└──────────────┬────────────────────────┘
               │ POST /agent-checkout
               ↓
┌──────────────────────────────────────────┐
│       datamartgh.shop                    │
│  • Data delivery fulfillment             │
│  • Commission calculation                │
│  • Order webhooks to datasell.store      │
└──────────────────────────────────────────┘
```

## How It Works

### Agent Registration
1. Agent signs up on **datasell.store**
2. **datasell.store** generates unique `store_slug` (e.g., `great-data-1768715470857`)
3. Agent can share **buydata.shop/shop/{slug}** with customers

### Customer Purchase Flow
1. Customer visits **buydata.shop/shop/{agent-slug}**
2. Views agent branding + products (from **datasell.store**)
3. Clicks "Buy Now" → enters phone/email
4. Redirected to Paystack checkout (ONE account)
5. After payment → **datamartgh.shop** delivers data
6. **datamartgh.shop** sends webhook to **datasell.store** with order details
7. Agent sees commission in **datasell.store** dashboard

## Layer 1: Routing Constraint
- Only accessible via `/shop/:storeSlug`
- Public homepage returns 404 (no SEO, no direct access)
- Example: `buydata.shop/shop/great-data-1768715470857`

## Layer 2: Server-Side Validation
- Store slug validated against **datasell.store** API
- Backend returns store data only if active
- Non-existent slugs return error

## Layer 3: Signed Store Token
- JWT token issued after validation
- Required for all API requests
- Short-lived, cannot be forged

## Features

✅ **Multi-tenant Storefronts** - Each agent has isolated space  
✅ **Agent Branding** - Custom logos, colors, contact info  
✅ **Dynamic Products** - Pulled from datasell.store catalog  
✅ **Unified Checkout** - One Paystack account, instant redirects  
✅ **Order Routing** - Seamless handoff to datamartgh.shop  
✅ **Beautiful UI** - Tailwind CSS responsive design  
✅ **Form Validation** - React Hook Form + Zod  

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Form Validation**: React Hook Form + Zod
- **HTTP**: Axios
- **Payment**: Paystack
- **APIs**: datasell.store + datamartgh.shop

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── globals.css         # Global styles
│   ├── page.tsx            # 404 page (no public homepage)
│   └── shop/
│       └── [slug]/
│           └── page.tsx    # Agent storefront page
├── components/
│   ├── StoreHeader.tsx     # Agent info + branding
│   ├── ProductGrid.tsx     # Product listing
│   ├── ProductCard.tsx     # Individual product card
│   ├── CheckoutModal.tsx   # Checkout form
│   └── NoStoreError.tsx    # Error page
└── lib/
    ├── storeApi.ts         # API integration (datasell.store + datamartgh.shop)
    └── mockData.ts         # Mock data for local testing
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local`:

```env
# Agent platform API
NEXT_PUBLIC_API_BASE=https://api.datasell.store

# Enable mock data for local testing
NEXT_PUBLIC_USE_MOCK=true

# Paystack public key (shared across all agents)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# Environment
NODE_ENV=development
```

### 3. Run Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000/shop/great-data-1768715470857`

### 4. Build for Production

```bash
npm run build
npm start
```

## API Integration Points

### datasell.store (Agent Data)
```
GET /agents/store/{slug}
GET /agents/store/{slug}/data
```

### datamartgh.shop (Checkout & Fulfillment)
```
POST /agent-checkout          # Initialize Paystack
POST /verify-payment          # Verify order completion
```

## Mock Data for Testing

Three pre-configured stores available:

1. **great-data-1768715470857** - Full store with products
2. **test-agent-xyz** - Minimal store
3. **demo-store-2024** - Demo with bundles

Mock data is automatically used when datasell.store API is unavailable.

## Security

✅ **No public homepage** - Prevents unauthorized access  
✅ **Slug validation** - Every request verified  
✅ **Token-based auth** - JWT prevents API abuse  
✅ **Price recalculation** - Backend, not frontend  
✅ **Agent isolation** - Each agent is sandboxed  
✅ **No indexing** - X-Robots-Tag headers set  

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Docker
```bash
docker build -t buydata-shop .
docker run -p 3000:3000 buydata-shop
```

### Environment Variables
Set in deployment platform:
- `NEXT_PUBLIC_API_BASE`
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- `NEXT_PUBLIC_USE_MOCK`

## Payment Flow

```
Customer Visit
    ↓
Store Validation (datasell.store)
    ↓
Product Selection
    ↓
Checkout Form / Phone Entry
    ↓
Paystack Payment Redirect
    ↓
Payment Processing (Paystack)
    ↓
datamartgh.shop Receives Order
    ↓
Data Delivered to Recipient
    ↓
Webhook → datasell.store (commission recorded)
    ↓
Success Confirmation
```

## Future Enhancements

- [ ] Agent dashboard on datasell.store
- [ ] Real-time order tracking
- [ ] Customer receipts via email/SMS
- [ ] Bulk agent setup
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Mobile app

## Support

**Platform Issues** → datasell.store team  
**Payment Issues** → Paystack support  
**Fulfillment Issues** → datamartgh.shop team

## License

Proprietary - Data Reselling Platform

