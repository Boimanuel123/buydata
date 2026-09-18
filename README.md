# BUYDATA

BUYDATA is a public data-bundle storefront. Customers choose a network package, enter the recipient's phone number, pay through Paystack, and receive fulfillment through DataMart.

## Customer Flow

1. Open the homepage.
2. Select MTN, TELECEL, or AT (AirtelTigo).
3. Choose a package and tap **Buy Now**.
4. Enter the recipient phone number and optional email.
5. Complete payment on Paystack.
6. Paystack redirects to BUYDATA and its signed webhook confirms the order.
7. DataMart delivers the package to the recipient.

No customer login, signup, agent account, reseller dashboard, activation fee, or store slug is required.

## Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Build for production:

```bash
npm run build
npm start
```

## Environment

The server requires Firebase Admin credentials for Firestore order storage, Paystack keys for payment initialization and verification, and DataMart credentials for fulfillment. Keep all secret values in `.env.local` or the deployment provider's environment settings.

Required server values include:

- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL`
- `NEXT_PUBLIC_FIREBASE_PRIVATE_KEY`
- `PAYSTACK_SECRET_KEY`
- `NEXT_PUBLIC_BASE_URL` or `BASE_URL`
- `NEXT_PUBLIC_DATAMART_API_BASE`
- `DATAMART_API_KEY`

## Public Routes

- `/` - package catalog and network filters
- `/order-success` - payment result page
- `/api/packages` - active package catalog
- `/api/orders/checkout` - creates an order and initializes Paystack
- `/api/orders/verify` - handles Paystack redirects and signed webhooks
- `/api/health` - basic integration configuration status
- `/api/health/paystack` - Paystack mode and key status
