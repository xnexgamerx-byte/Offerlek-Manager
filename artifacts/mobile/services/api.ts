const BASE_URL = "https://TalabatOfferlek.replit.app";

let _token: string | null = null;

export function setApiToken(token: string | null) {
  _token = token;
}

export function getApiToken() {
  return _token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (_token) {
    headers["Authorization"] = `Bearer ${_token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...((options.headers as Record<string, string>) || {}),
    },
  });
  if (!res.ok) {
    let errorMessage = `خطأ ${res.status}`;
    try {
      const error = await res.json();
      errorMessage = error.message || error.error || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text);
}

// ─── Types (matching actual API) ────────────────────────────────────────────

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  driverId: string | null;
  status: "pending" | "accepted" | "rejected" | "ready" | "picked_up" | "delivered";
  totalAmount: number;
  deliveryFee: number;
  deliveryAddress: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // Only present in GET /api/orders/:id detail
  items?: OrderItem[];
  restaurant?: {
    id: string;
    name: string;
    address?: string;
  };
}

export interface MenuCategoryItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  items: MenuCategoryItem[];
}

export interface Restaurant {
  id: string;
  userId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  address?: string;
  phone?: string;
  isOpen: boolean;
  rating?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    role: string;
    name?: string;
    phone?: string;
    isActive?: boolean;
  };
}

// ─── API ────────────────────────────────────────────────────────────────────

export const api = {
  auth: {
    login: (phone: string, password: string) =>
      request<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ phone, password }),
      }),
  },

  restaurants: {
    list: () => request<Restaurant[]>("/api/restaurants"),
    menu: (restaurantId: string) =>
      request<MenuCategory[]>(`/api/restaurants/${restaurantId}/menu`),
  },

  orders: {
    list: () => request<Order[]>("/api/orders"),
    detail: (id: string) => request<Order>(`/api/orders/${id}`),
    updateStatus: (id: string, status: string) =>
      request<Order>(`/api/orders/${id}/status`, {
        method: "POST",
        body: JSON.stringify({ status }),
      }),
  },
};
