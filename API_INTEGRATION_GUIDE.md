/**
 * API INTEGRATION GUIDE
 * 
 * This document outlines the API contract between:
 * - datasell.store (Agent & Product Management)
 * - buydata.shop (Frontend - THIS PROJECT)
 * - datamartgh.shop (Payment & Fulfillment)
 */

// ============================================
// DATASELL.STORE APIs (Agent Data)
// ============================================

/**
 * GET /agents/store/{slug}
 * 
 * Validates agent store and returns basic info
 * 
 * Request:
 * GET https://api.datasell.store/agents/store/great-data-1768715470857
 * 
 * Response (200):
 * {
 *   "valid": true,
 *   "store_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "store_slug": "great-data-1768715470857",
 *   "agent_id": "42"
 * }
 * 
 * Response (404):
 * {
 *   "valid": false,
 *   "message": "Store not found"
 * }
 */

/**
 * GET /agents/store/{slug}/data
 * 
 * Returns agent branding + products
 * 
 * Request:
 * GET https://api.datasell.store/agents/store/great-data-1768715470857/data
 * 
 * Response (200):
 * {
 *   "store_slug": "great-data-1768715470857",
 *   "agent_id": "42",
 *   "store_name": "Great Data",
 *   "description": "Premium data packages",
 *   "logo": "https://cdn.datasell.store/logos/great-data.jpg",
 *   "whatsapp": "+233501234567",
 *   "email": "agent@greatdata.com",
 *   "color_theme": "#3b82f6",
 *   "products": [
 *     {
 *       "id": "mtn-1gb",
 *       "name": "MTN 1GB",
 *       "description": "1GB data",
 *       "base_price": 4.50,
 *       "agent_markup": 0.50,  // Agent's margin
 *       "final_price": 5.00,   // What customer pays
 *       "category": "MTN",
 *       "image": "https://cdn.datasell.store/products/mtn-1gb.jpg"
 *     }
 *   ]
 * }
 */

// ============================================
// DATAMARTGH.SHOP APIs (Checkout & Fulfillment)
// ============================================

/**
 * POST /agent-checkout
 * 
 * Initializes Paystack payment for agent order
 * buydata.shop calls this AFTER user submits checkout form
 * 
 * Request:
 * POST https://api.datamartgh.shop/agent-checkout
 * Headers:
 *   - Content-Type: application/json
 *   - Authorization: Bearer {store_token}
 * 
 * Body:
 * {
 *   "store_slug": "great-data-1768715470857",
 *   "agent_id": "42",
 *   "product_id": "mtn-1gb",
 *   "recipient": "0501234567",  // Phone number
 *   "quantity": 1
 * }
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "reference": "ref_abc123xyz",
 *   "authorization_url": "https://checkout.paystack.com/abc123xyz",
 *   "access_code": "abc123xyz",
 *   "amount": 50000  // In GHS cents (500 GHS)
 * }
 * 
 * Response (400):
 * {
 *   "success": false,
 *   "error": "Product not found"
 * }
 * 
 * IMPORTANT:
 * - Backend must recalculate price (don't trust frontend)
 * - Price = base_price + agent_markup
 * - Return Paystack authorization_url
 * - buydata.shop redirects user to this URL
 */

/**
 * POST /verify-payment
 * 
 * Called after Paystack payment completion
 * Verifies order and triggers fulfillment
 * 
 * Request:
 * POST https://api.datamartgh.shop/verify-payment
 * Headers:
 *   - Content-Type: application/json
 *   - Authorization: Bearer {store_token}
 * 
 * Body:
 * {
 *   "reference": "ref_abc123xyz",
 *   "store_slug": "great-data-1768715470857"
 * }
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "order_id": "order_12345",
 *   "message": "Data will be delivered within 2 minutes",
 *   "status": "processing"
 * }
 * 
 * Response (400):
 * {
 *   "success": false,
 *   "message": "Payment not found or already processed"
 * }
 */

/**
 * Webhook: POST /webhooks/order-complete
 * 
 * datamartgh.shop sends this to datasell.store
 * Notifies agent of completed order + commission
 * 
 * datamartgh.shop → datasell.store
 * 
 * Body:
 * {
 *   "order_id": "order_12345",
 *   "store_slug": "great-data-1768715470857",
 *   "agent_id": "42",
 *   "product_id": "mtn-1gb",
 *   "amount": 500,  // GHS - what customer paid
 *   "base_price": 450,
 *   "commission": 50,  // Markup
 *   "recipient": "0501234567",
 *   "timestamp": "2026-02-06T10:30:00Z",
 *   "status": "completed"
 * }
 */

// ============================================
// FLOW DIAGRAM
// ============================================

/*
1. User visits buydata.shop/shop/{slug}
   ↓
2. buydata.shop calls: GET /agents/store/{slug}/data (datasell.store)
   ↓
3. Displays products & agent info
   ↓
4. User clicks "Buy Now" → enters phone
   ↓
5. buydata.shop calls: POST /agent-checkout (datamartgh.shop)
   ↓
6. datamartgh.shop responds with Paystack URL
   ↓
7. buydata.shop redirects: window.location = authorization_url
   ↓
8. User pays on Paystack
   ↓
9. Paystack redirects to verified URL (your configured return URL)
   ↓
10. buydata.shop calls: POST /verify-payment (datamartgh.shop)
    ↓
11. datamartgh.shop processes order:
    - Validates payment with Paystack
    - Delivers data to recipient
    - Sends webhook to datasell.store
    ↓
12. datasell.store records commission in agent dashboard
    ↓
13. User gets confirmation
*/

// ============================================
// SECURITY REQUIREMENTS
// ============================================

/*
✅ Price Recalculation
   - Never trust frontend price
   - Always calculate: base_price + agent_markup
   
✅ Token Validation
   - Verify store_token is valid JWT
   - Check agent_id matches token
   - Enforce token expiration

✅ Agent Validation
   - Verify agent exists and is active
   - Check agent can sell this product
   
✅ Duplicate Prevention
   - Use reference + agent_id to prevent double-charging
   - Mark order as processed immediately

✅ Paystack Integration
   - Configuration:
     * Use separate Paystack account for buydata.shop
     * Public key: NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
     * Verify webhooks with secret key
     
✅ Webhook Security
   - Sign webhooks with HMAC
   - datasell.store should verify signature
   - Retry logic for failed deliveries
*/

// ============================================
// ENVIRONMENT VARIABLES (buydata.shop)
// ============================================

/*
NEXT_PUBLIC_API_BASE=https://api.datasell.store
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxx...
NEXT_PUBLIC_USE_MOCK=false (production)
*/

// ============================================
// ERROR HANDLING
// ============================================

/*
buydata.shop handles these errors gracefully:

1. Store not found
   - Shows: "Store not found or inactive"
   
2. Product not found
   - Shows: "Product no longer available"
   
3. Paystack redirect failed
   - Shows: "Failed to initialize payment"
   - Retry button available
   
4. Payment verification failed
   - Shows: "Payment verification failed"
   - Suggests: Contact agent or try again
   
5. Network timeout
   - Falls back to mock data (if enabled)
   - Or shows error with retry
*/

export const API_DOCS = {
  datasellStore: "https://api.datasell.store",
  datamartghShop: "https://api.datamartgh.shop",
  paystack: "https://api.paystack.co",
};
