import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, LoginResponse, setApiToken } from "@/services/api";

function decodeJWTRole(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = payload.length % 4;
    if (pad) payload += "=".repeat(4 - pad);
    const decoded = atob(payload);
    const parsed = JSON.parse(decoded);
    return parsed.role || null;
  } catch {
    return null;
  }
}

interface AuthState {
  token: string | null;
  userId: string | null;
  role: "restaurant" | "driver" | null;
  restaurantId: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "@offerlek:token";
const ROLE_KEY = "@offerlek:role";
const USER_ID_KEY = "@offerlek:userId";
const RESTAURANT_ID_KEY = "@offerlek:restaurantId";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    userId: null,
    role: null,
    restaurantId: null,
    isLoading: true,
  });

  useEffect(() => {
    async function loadToken() {
      try {
        const [token, role, userId, restaurantId] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(ROLE_KEY),
          AsyncStorage.getItem(USER_ID_KEY),
          AsyncStorage.getItem(RESTAURANT_ID_KEY),
        ]);
        if (token) {
          setApiToken(token);
          setState({
            token,
            userId,
            role: (role as "restaurant" | "driver") || null,
            restaurantId,
            isLoading: false,
          });
        } else {
          setState({ token: null, userId: null, role: null, restaurantId: null, isLoading: false });
        }
      } catch {
        setState({ token: null, userId: null, role: null, restaurantId: null, isLoading: false });
      }
    }
    loadToken();
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const response: LoginResponse = await api.auth.login(phone, password);
    const token = response.token;
    const user = response.user;

    if (!token) throw new Error("لم يُستلم token من الخادم");

    const role =
      ((user?.role || decodeJWTRole(token)) as "restaurant" | "driver") || null;
    const userId = user?.id || null;

    setApiToken(token);

    // For restaurant role: find the restaurant ID linked to this user
    let restaurantId: string | null = null;
    if (role === "restaurant" && userId) {
      try {
        const restaurants = await api.restaurants.list();
        const mine = restaurants.find((r) => r.userId === userId);
        restaurantId = mine?.id || null;
      } catch {
        // non-fatal — screens will handle null restaurantId gracefully
      }
    }

    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, token),
      role ? AsyncStorage.setItem(ROLE_KEY, role) : AsyncStorage.removeItem(ROLE_KEY),
      userId ? AsyncStorage.setItem(USER_ID_KEY, userId) : AsyncStorage.removeItem(USER_ID_KEY),
      restaurantId
        ? AsyncStorage.setItem(RESTAURANT_ID_KEY, restaurantId)
        : AsyncStorage.removeItem(RESTAURANT_ID_KEY),
    ]);

    setState({ token, userId, role, restaurantId, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    setApiToken(null);
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(ROLE_KEY),
      AsyncStorage.removeItem(USER_ID_KEY),
      AsyncStorage.removeItem(RESTAURANT_ID_KEY),
    ]);
    setState({ token: null, userId: null, role: null, restaurantId: null, isLoading: false });
  }, []);

  const value = useMemo(
    () => ({ ...state, login, logout }),
    [state, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
