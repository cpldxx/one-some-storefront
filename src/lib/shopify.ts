// Shopify Storefront API Configuration
const SHOPIFY_STORE_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_API_VERSION = import.meta.env.VITE_SHOPIFY_API_VERSION;
const SHOPIFY_STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

// Validate environment variables
if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_API_VERSION || !SHOPIFY_STOREFRONT_TOKEN) {
  console.error('[Shopify] Missing required environment variables', {
    hasDomain: !!SHOPIFY_STORE_DOMAIN,
    hasVersion: !!SHOPIFY_API_VERSION,
    hasToken: !!SHOPIFY_STOREFRONT_TOKEN
  });
}

const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

// Types
export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          availableForSale: boolean;
          selectedOptions: Array<{
            name: string;
            value: string;
          }>;
        };
      }>;
    };
    options: Array<{
      name: string;
      values: string[];
    }>;
  };
}

// GraphQL Queries
const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          description
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            name
            values
          }
        }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      description
      handle
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
          }
        }
      }
      options {
        name
        values
      }
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// API Helper - Storefront API 요청
export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  try {
    console.log('[Shopify] Requesting Storefront API...');
    
    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    // 모든 HTTP 에러는 Mock 데이터로 처리되므로 throw하지 않음
    if (response.status === 401) {
      console.warn('[Shopify] 401 Unauthorized - API token invalid or expired. Using mock data.');
      throw new Error('API_ERROR');
    }

    if (response.status === 402) {
      console.warn('[Shopify] 402 Payment required. Using mock data.');
      throw new Error('API_ERROR');
    }

    if (!response.ok) {
      console.warn(`[Shopify] HTTP error ${response.status}. Using mock data.`);
      throw new Error('API_ERROR');
    }

    const data = await response.json();
    
    if (data.errors) {
      console.warn('[Shopify] GraphQL error. Using mock data.');
      throw new Error('API_ERROR');
    }

    console.log('[Shopify] API request successful');
    return data;
  } catch (error) {
    // 모든 에러를 API_ERROR로 통일 (catch 블록에서 처리)
    throw new Error('API_ERROR');
  }
}

// API Functions
export async function fetchProducts(first: number = 50): Promise<ShopifyProduct[]> {
  try {
    console.log('[Shopify] Fetching products...');
    const data = await storefrontApiRequest(PRODUCTS_QUERY, { first });
    const products = data?.data?.products?.edges || [];
    
    if (products.length > 0) {
      console.log(`[Shopify] Successfully fetched ${products.length} products from Shopify`);
      return products;
    }
    
    console.log('[Shopify] No products from API, returning empty array');
    return [];
  } catch (error) {
    // API 에러 발생 시 빈 배열 반환 (Coming Soon 표시)
    console.log('[Shopify] API request failed, returning empty array');
    return [];
  }
}

export async function fetchProductByHandle(handle: string) {
  const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
  return data?.data?.productByHandle || null;
}

export interface CartItem {
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  quantity: number;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
}

export async function createStorefrontCheckout(items: CartItem[]): Promise<string> {
  const lines = items.map(item => ({
    quantity: item.quantity,
    merchandiseId: item.variantId,
  }));

  const cartData = await storefrontApiRequest(CART_CREATE_MUTATION, {
    input: { lines },
  });

  if (cartData?.data?.cartCreate?.userErrors?.length > 0) {
    throw new Error(`Cart creation failed: ${cartData.data.cartCreate.userErrors.map((e: { message: string }) => e.message).join(', ')}`);
  }

  const cart = cartData?.data?.cartCreate?.cart;
  
  if (!cart?.checkoutUrl) {
    throw new Error('No checkout URL returned from Shopify');
  }

  const url = new URL(cart.checkoutUrl);
  url.searchParams.set('channel', 'online_store');
  return url.toString();
}

// Format price helper
export function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount));
}
