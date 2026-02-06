# DataSell.Store API Integration Spec

## Overview
buydata.shop needs these endpoints from datasell.store to:
- Validate and fetch agent profiles
- Get available data packages per agent
- Track agent analytics and sales
- Support agent authentication for dashboards

---

## 1. GET /api/agents/store/{slug}
**Purpose:** Fetch agent profile and branding

**Parameters:**
- `slug` (string, path) - Agent store slug (e.g., "great-data-1768715470857")

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "agentId": "agent_123abc",
    "slug": "great-data-1768715470857",
    "name": "Great Data Ghana",
    "description": "Fastest data bundles in Ghana",
    "logo": "https://datasell.store/agents/agent_123abc/logo.png",
    "coverImage": "https://datasell.store/agents/agent_123abc/cover.png",
    "phone": "+233501234567",
    "email": "contact@greatdata.com",
    "commissionRate": 0.10,
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z",
    "country": "GH"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Agent store not found",
  "code": "STORE_NOT_FOUND"
}
```

---

## 2. GET /api/agents/store/{slug}/products
**Purpose:** Fetch data packages available for this agent

**Parameters:**
- `slug` (string, path) - Agent store slug
- `network` (string, optional query) - Filter by network (TELECEL, YELLO, AT_PREMIUM)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "agentId": "agent_123abc",
    "products": [
      {
        "id": "telecel-1gb",
        "name": "Vodafone 1GB",
        "network": "TELECEL",
        "capacity": "1",
        "price": 3.5,
        "description": "1GB valid for 30 days",
        "category": "data",
        "status": "active",
        "image": "https://datasell.store/products/telecel-1gb.png"
      },
      {
        "id": "mtn-5gb",
        "name": "MTN 5GB",
        "network": "YELLO",
        "capacity": "5",
        "price": 15.0,
        "description": "5GB valid for 30 days",
        "category": "data",
        "status": "active",
        "image": "https://datasell.store/products/mtn-5gb.png"
      }
    ]
  }
}
```

---

## 3. GET /api/agents/{agentId}/analytics
**Purpose:** Get agent sales and performance metrics

**Parameters:**
- `agentId` (string, path)
- `period` (string, query, optional) - "day", "week", "month", "all" (default: "month")
- `startDate` (string, query, optional) - ISO date format
- `endDate` (string, query, optional) - ISO date format

**Headers:**
- `Authorization: Bearer {agent_token}` - Agent JWT token (optional, required to see full data)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "agentId": "agent_123abc",
    "period": "month",
    "stats": {
      "totalOrders": 245,
      "totalRevenue": 2450.50,
      "totalCommission": 245.05,
      "conversionRate": 0.18,
      "avgOrderValue": 10.0,
      "uniqueCustomers": 180
    },
    "topProducts": [
      {
        "productId": "telecel-1gb",
        "name": "Vodafone 1GB",
        "quantitySold": 120,
        "revenue": 420.0
      },
      {
        "productId": "mtn-5gb",
        "name": "MTN 5GB",
        "quantitySold": 85,
        "revenue": 1275.0
      }
    ],
    "dailyRevenue": [
      { "date": "2026-02-01", "revenue": 78.50 },
      { "date": "2026-02-02", "revenue": 92.00 }
    ]
  }
}
```

---

## 4. GET /api/agents/{agentId}/orders
**Purpose:** Fetch agent's recent orders

**Parameters:**
- `agentId` (string, path)
- `limit` (number, query, default: 50)
- `offset` (number, query, default: 0)
- `status` (string, query, optional) - "pending", "completed", "failed"

**Headers:**
- `Authorization: Bearer {agent_token}` - Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "orderId": "order_abc123",
        "productId": "telecel-1gb",
        "productName": "Vodafone 1GB",
        "customerPhone": "+233501234567",
        "network": "TELECEL",
        "amount": 3.5,
        "commission": 0.35,
        "status": "completed",
        "reference": "ref_paystack_123",
        "createdAt": "2026-02-05T14:30:00Z",
        "completedAt": "2026-02-05T14:35:00Z"
      }
    ],
    "total": 245,
    "limit": 50,
    "offset": 0
  }
}
```

---

## 5. GET /api/agents/{agentId}/wallet
**Purpose:** Get agent wallet balance and payout history

**Parameters:**
- `agentId` (string, path)

**Headers:**
- `Authorization: Bearer {agent_token}` - Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "agentId": "agent_123abc",
    "balance": 2450.05,
    "totalEarned": 5000.00,
    "totalWithdrawn": 2549.95,
    "payoutHistory": [
      {
        "id": "payout_xyz789",
        "amount": 500.00,
        "status": "completed",
        "method": "momo_wallet",
        "reference": "ref_momo_123",
        "requestedAt": "2026-02-01T10:00:00Z",
        "completedAt": "2026-02-01T11:30:00Z"
      }
    ]
  }
}
```

---

## 6. POST /api/agents/auth/login
**Purpose:** Authenticate agent and get JWT token

**Request Body:**
```json
{
  "email": "contact@greatdata.com",
  "password": "secure_password_here"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "agentId": "agent_123abc",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "agent": {
      "name": "Great Data Ghana",
      "email": "contact@greatdata.com",
      "slug": "great-data-1768715470857"
    }
  }
}
```

---

## 7. POST /api/agents/register
**Purpose:** Create new agent account

**Request Body:**
```json
{
  "name": "New Agent Ghana",
  "email": "newagent@example.com",
  "password": "secure_password",
  "phone": "+233501234567",
  "description": "Quality data provider",
  "country": "GH"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "agentId": "agent_new123",
    "slug": "new-agent-ghana-1707214800",
    "name": "New Agent Ghana",
    "email": "newagent@example.com",
    "createdAt": "2026-02-06T10:00:00Z"
  }
}
```

---

## 8. PUT /api/agents/{agentId}/profile
**Purpose:** Update agent profile and settings

**Parameters:**
- `agentId` (string, path)

**Headers:**
- `Authorization: Bearer {agent_token}` - Required

**Request Body:**
```json
{
  "name": "Great Data Ghana Updated",
  "description": "Best data bundles in Ghana",
  "phone": "+233501234567",
  "commissionRate": 0.15,
  "logo": "base64_or_url",
  "coverImage": "base64_or_url"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "agentId": "agent_123abc",
    "slug": "great-data-1768715470857",
    "updatedAt": "2026-02-06T10:00:00Z"
  }
}
```

---

## 9. GET /api/agents/{agentId}/webhook-config
**Purpose:** Get webhook settings (for order confirmations)

**Parameters:**
- `agentId` (string, path)

**Headers:**
- `Authorization: Bearer {agent_token}` - Required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "webhookUrl": "https://agent-dashboard.com/webhooks/orders",
    "webhookSecret": "whsec_123456789",
    "events": ["order.completed", "order.failed", "payout.completed"],
    "isActive": true
  }
}
```

---

## Error Handling

All endpoints should return errors in this format:

```json
{
  "success": false,
  "error": "Descriptive error message",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

**Common Error Codes:**
- `STORE_NOT_FOUND` - 404
- `UNAUTHORIZED` - 401
- `INVALID_TOKEN` - 401
- `FORBIDDEN` - 403
- `INVALID_PARAMS` - 400
- `SERVER_ERROR` - 500

---

## Authentication

- JWT token should be included in `Authorization: Bearer {token}` header
- Token should expire in reasonable time (e.g., 24 hours)
- Support token refresh endpoint (optional): POST `/api/agents/auth/refresh`

---

## Rate Limiting (Recommended)

- Suggest: 1000 requests per hour per agent
- Return `X-RateLimit-Remaining` and `X-RateLimit-Reset` headers

---

## CORS Headers (Recommended)

```
Access-Control-Allow-Origin: https://buydata.shop
Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## What buydata.shop Will Do With This

1. **Agent Store Page** - Call endpoint #1 to validate store exists and display branding
2. **Product Listing** - Call endpoint #2 to show available packages
3. **Agent Dashboard** - Call endpoints #3, #4, #5 to show analytics (requires agent login)
4. **Agent Login** - Call endpoint #6 to authenticate
5. **Agent Registration** - Call endpoint #7 to create new agent
6. **Profile Management** - Call endpoint #8 to let agents update their store

---

## Provide These:

When datasell.store is ready, please provide:

1. ✅ **Base URL** (e.g., `https://api.datasell.store`)
2. ✅ **All endpoint paths** (confirm the exact URLs above)
3. ✅ **Response formats** (match the JSON structures above)
4. ✅ **JWT signing key** (if using custom tokens, or OAuth config)
5. ✅ **CORS configuration** (ensure buydata.shop domain is allowed)
6. ✅ **Rate limit details** (if any)
7. ✅ **Test credentials** (for development/testing)
8. ✅ **Webhook events and payload format** (for order notifications)
