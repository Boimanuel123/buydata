/**
 * Mock data for local testing
 * Replace with real API calls in production
 * Networks: TELECEL (Vodafone), YELLO (MTN), AT_PREMIUM (AirtelTigo)
 */

export const mockStores: Record<string, any> = {
  "great-data-1768715470857": {
    valid: true,
    store_token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdG9yZV9zbHVnIjoiZ3JlYXQtZGF0YS0xNzY4NzE1NDcwODU3IiwiYWdlbnRfaWQiOiI0MiIsImV4cCI6OTk5OTk5OTk5OX0.mock",
    store_name: "Great Data",
    description: "Premium data packages at unbeatable prices",
    logo: "https://via.placeholder.com/80?text=Great+Data",
    whatsapp: "+233501234567",
    email: "agent@greatdata.com",
    color_theme: "#3b82f6",
    products: [
      {
        id: "telecel-1gb",
        name: "Vodafone 1GB",
        description: "1GB data for Vodafone (Telecel)",
        price: 3.5,
        capacity: "1",
        network: "TELECEL",
        category: "Vodafone",
        image: "https://via.placeholder.com/300?text=Vodafone+1GB",
      },
      {
        id: "telecel-5gb",
        name: "Vodafone 5GB",
        description: "5GB data for Vodafone (Telecel)",
        price: 15.0,
        capacity: "5",
        network: "TELECEL",
        category: "Vodafone",
        image: "https://via.placeholder.com/300?text=Vodafone+5GB",
      },
      {
        id: "yello-1gb",
        name: "MTN 1GB",
        description: "1GB data for MTN (Yello)",
        price: 3.3,
        capacity: "1",
        network: "YELLO",
        category: "MTN",
        image: "https://via.placeholder.com/300?text=MTN+1GB",
      },
      {
        id: "yello-10gb",
        name: "MTN 10GB",
        description: "10GB data for MTN (Yello)",
        price: 28.0,
        capacity: "10",
        network: "YELLO",
        category: "MTN",
        image: "https://via.placeholder.com/300?text=MTN+10GB",
      },
      {
        id: "at-2gb",
        name: "AirtelTigo 2GB",
        description: "2GB data for AirtelTigo",
        price: 6.5,
        capacity: "2",
        network: "AT_PREMIUM",
        category: "AirtelTigo",
        image: "https://via.placeholder.com/300?text=AirtelTigo+2GB",
      },
    ],
  },
  "test-agent-xyz": {
    valid: true,
    store_token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdG9yZV9zbHVnIjoidGVzdC1hZ2VudC14eXoiLCJhZ2VudF9pZCI6IjEyMyIsImV4cCI6OTk5OTk5OTk5OX0.mock",
    store_name: "Test Agent",
    description: "Test storefront for development",
    logo: null,
    whatsapp: "+233551234567",
    email: "test@example.com",
    color_theme: "#8b5cf6",
    products: [
      {
        id: "test-1",
        name: "Telecel 1GB",
        description: "1GB Vodafone data",
        price: 3.5,
        capacity: "1",
        network: "TELECEL",
        category: "Vodafone",
      },
      {
        id: "test-2",
        name: "MTN 5GB",
        description: "5GB MTN data",
        price: 15.0,
        capacity: "5",
        network: "YELLO",
        category: "MTN",
      },
    ],
  },
  "demo-store-2024": {
    valid: true,
    store_token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdG9yZV9zbHVnIjoiZGVtby1zdG9yZS0yMDI0IiwiYWdlbnRfaWQiOiI5OTkiLCJleHAiOjk5OTk5OTk5OTl9.mock",
    store_name: "Demo Store",
    description: "Demo data reselling platform",
    logo: "https://via.placeholder.com/80?text=Demo",
    whatsapp: "+233541234567",
    email: "demo@buydata.shop",
    color_theme: "#ec4899",
    products: [
      {
        id: "demo-telecel-1",
        name: "Vodafone 1GB",
        description: "1GB Vodafone Bundle",
        price: 3.5,
        capacity: "1",
        network: "TELECEL",
        category: "Vodafone",
      },
      {
        id: "demo-yello-5",
        name: "MTN 5GB",
        description: "5GB MTN Bundle",
        price: 14.5,
        capacity: "5",
        network: "YELLO",
        category: "MTN",
      },
      {
        id: "demo-at-10",
        name: "AirtelTigo 10GB",
        description: "10GB AirtelTigo Bundle",
        price: 26.0,
        capacity: "10",
        network: "AT_PREMIUM",
        category: "AirtelTigo",
      },
      {
        id: "demo-telecel-20",
        name: "Vodafone 20GB",
        description: "20GB Vodafone Bundle",
        price: 45.0,
        capacity: "20",
        network: "TELECEL",
        category: "Vodafone",
      },
    ],
  },
};

export function getMockStore(slug: string) {
  return mockStores[slug] || null;
}
