/**
 * Global fetch interceptor to add ngrok-skip-browser-warning header
 * Run this early in the app initialization
 */
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  
  window.fetch = function(...args: Parameters<typeof fetch>) {
    const [resource, config] = args;
    const finalConfig: RequestInit = {
      ...config,
      headers: {
        ...(config && 'headers' in config ? config.headers : {}),
        'ngrok-skip-browser-warning': 'true',
        'user-agent': 'BuyDataApp/1.0',
      },
    };
    
    return originalFetch(resource, finalConfig);
  };
}
