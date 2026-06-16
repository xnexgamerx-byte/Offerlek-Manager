const BASE_URL = "https://TalabatOfferlek.replit.app";

let _token: string | null = null;

export function setApiToken(token: string | null) {
  _token = token;
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

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  deliveryAddress: string;
  status: "pending" | "accepted" | "rejected" | "ready" | "picked_up" | "delivered";
  restaurantName?: string;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  available: boolean;
}

export interface RestaurantStats {
  ordersCount: number;
  totalSales: number;
  averageOrder: number;
}

export interface LoginResponse {
  token: string;
  role?: string;
  user?: {
    id: string;
    role: string;
    name?: string;
    phone?: string;
  };
}

export const api = {
  auth: {
    login: (phone: string, password: string) =>
      request<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ phone, password }),
      }),
  },

  restaurant: {
    orders: {
      list: (status?: string) =>
        request<Order[]>(
          `/api/orders${status ? `?status=${status}` : ""}`
        ),
      updateStatus: (id: string, status: string) =>
        request<Order>(`/api/orders/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }),
    },
    menu: {
      list: () => request<MenuItem[]>("/api/menu"),
      create: (data: Omit<MenuItem, "id">) =>
        request<MenuItem>("/api/menu", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      update: (id: string, data: Partial<MenuItem>) =>
        request<MenuItem>(`/api/menu/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        request<void>(`/api/menu/${id}`, { method: "DELETE" }),
    },
    stats: () => request<RestaurantStats>("/api/restaurant/stats"),
  },

  driver: {
    available: () => request<Order[]>("/api/driver/orders/available"),
    current: () => request<Order | null>("/api/driver/current"),
    pickup: (orderId: string) =>
      request<Order>(`/api/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "picked_up" }),
      }),
    deliver: (orderId: string) =>
      request<Order>(`/api/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "delivered" }),
      }),
    history: () => request<Order[]>("/api/driver/history"),
  },
};
