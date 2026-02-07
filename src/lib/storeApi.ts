import axios from "axios";
import { getMockStore } from "./mockData";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.datasell.store";
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK === "true" || API_BASE === "https://api.datasell.store";

interface StoreValidation {
  valid: boolean;
  store_token?: string;
  message?: string;
}

interface StoreData {
  store_slug: string;
  agent_id: string;
  store_name: string;
  description?: string;
  logo?: string;
  whatsapp?: string;
  email?: string;
  color_theme?: string;
  products?: any[];
}

/**
 * Layer 2: Server-side validation
 * Checks if store slug exists and is active
 */
export async function validateStore(slug: string): Promise<StoreValidation> {
  // Try real API first
  try {
    const response = await axios.get(`${API_BASE}/agents/store/${slug}`, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 5000,
    });

    return {
      valid: response.data?.valid || false,
      store_token: response.data?.store_token,
    };
  } catch (error: any) {
    console.log("API unavailable, checking mock data...");

    // Fall back to mock data for local development
    if (USE_MOCK_DATA) {
      const mockStore = getMockStore(slug);
      if (mockStore) {
        return {
          valid: true,
          store_token: mockStore.store_token,
        };
      }
    }

    console.error("Store validation failed:", error.message);
    return { valid: false };
  }
}

/**
 * Fetch complete store data and products
 */
export async function fetchStoreData(slug: string): Promise<StoreData> {
  try {
    // First, try to fetch from our local Firestore API
    const response = await fetch(`/api/shops/${slug}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.store) {
        return {
          store_slug: data.store.store_slug,
          agent_id: data.store.agent_id,
          store_name: data.store.store_name,
          description: data.store.description,
          logo: data.store.logo,
          email: data.store.email,
          color_theme: data.store.color_theme,
          products: data.store.products,
        };
      }
    }

    // Fall back to external API if local endpoint fails
    const externalResponse = await axios.get(`${API_BASE}/agents/store/${slug}/data`, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 5000,
    });

    return externalResponse.data;
  } catch (error: any) {
    console.log("External API unavailable, checking mock data...");

    // Fall back to mock data for local development
    if (USE_MOCK_DATA) {
      const mockStore = getMockStore(slug);
      if (mockStore) {
        return {
          store_slug: slug,
          agent_id: mockStore.agent_id || "mock",
          store_name: mockStore.store_name,
          description: mockStore.description,
          logo: mockStore.logo,
          whatsapp: mockStore.whatsapp,
          email: mockStore.email,
          color_theme: mockStore.color_theme,
          products: mockStore.products,
        };
      }
    }

    console.error("Failed to fetch store data:", error.message);
    throw new Error("Unable to load store data");
  }
}

/**
 * Initialize Paystack checkout
 * User is redirected to Paystack to complete payment
 */
export async function initializePaystackCheckout(
  product: any,
  recipientPhone: string,
  email: string
): Promise<{
  authorization_url: string;
  access_code: string;
  reference: string;
}> {
  try {
    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

    if (!PAYSTACK_SECRET) {
      throw new Error("Paystack secret key not configured");
    }

    // Convert price to kobo (Paystack uses smallest currency unit)
    const amountInKobo = Math.round(product.price * 100);

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: email || "customer@buydata.shop",
        amount: amountInKobo,
        metadata: {
          product_id: product.id,
          product_name: product.name,
          recipient_phone: recipientPhone.replace(/\D/g, ""),
          network: product.network || "N/A",
          capacity: product.capacity || "N/A",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    if (!response.data.status) {
      throw new Error(response.data.message || "Failed to initialize payment");
    }

    return {
      authorization_url: response.data.data.authorization_url,
      access_code: response.data.data.access_code,
      reference: response.data.data.reference,
    };
  } catch (error: any) {
    console.error("Paystack initialization failed:", error.message);
    throw new Error(
      error.response?.data?.message || "Failed to initialize payment"
    );
  }
}

/**
 * Verify Paystack payment and send order to DataMart
 * Called on payment completion
 */
export async function verifyPaymentAndCreateOrder(
  reference: string,
  storeSlug: string,
  agentId: string
): Promise<{
  success: boolean;
  message: string;
  datamartOrderId?: string;
}> {
  try {
    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
    const DATAMART_API_KEY = process.env.DATAMART_API_KEY;

    if (!PAYSTACK_SECRET) {
      throw new Error("Paystack secret key not configured");
    }

    if (!DATAMART_API_KEY) {
      throw new Error("DataMart API key not configured");
    }

    // Step 1: Verify payment with Paystack
    const paymentResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
        timeout: 10000,
      }
    );

    if (!paymentResponse.data.status || paymentResponse.data.data.status !== "success") {
      throw new Error("Payment verification failed");
    }

    const paymentData = paymentResponse.data.data;
    const metadata = paymentData.metadata;

    // Step 2: Create order in DataMart after successful payment
    const datamartResponse = await axios.post(
      `https://api.datamartgh.shop/api/developer/order`,
      {
        agentId: agentId,
        storeSlug: storeSlug,
        productId: metadata.product_id,
        productName: metadata.product_name,
        recipientPhone: metadata.recipient_phone,
        network: metadata.network,
        capacity: metadata.capacity,
        amount: paymentData.amount / 100, // Convert back from kobo
        paystackReference: reference,
        customerEmail: paymentData.customer.email,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": DATAMART_API_KEY,
        },
        timeout: 15000,
      }
    );

    if (datamartResponse.data.status === "success") {
      return {
        success: true,
        message: "Payment verified and order created successfully",
        datamartOrderId: datamartResponse.data.data.orderId,
      };
    } else {
      throw new Error(
        datamartResponse.data.message || "Failed to create order in DataMart"
      );
    }
  } catch (error: any) {
    console.error("Payment verification failed:", error.message);
    throw new Error(
      error.response?.data?.message || "Failed to verify payment"
    );
  }
}
