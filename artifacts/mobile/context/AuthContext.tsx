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
  role: "restaurant" | "driver" | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "@offerlek:token";
const ROLE_KEY = "@offerlek:role";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    role: null,
    isLoading: true,
  });

  useEffect(() => {
    async function loadToken() {
      try {
        const [token, role] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(ROLE_KEY),
        ]);
        if (token) {
          setApiToken(token);
          setState({
            token,
            role: (role as "restaurant" | "driver") || null,
            isLoading: false,
          });
        } else {
          setState({ token: null, role: null, isLoading: false });
        }
      } catch {
        setState({ token: null, role: null, isLoading: false });
      }
    }
    loadToken();
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const response: LoginResponse = await api.auth.login(phone, password);
    const token = response.data?.token;
    const user = response.data?.user;

    if (!token) throw new Error("لم يُستلم token من الخادم");

    const role =
      ((user?.role || decodeJWTRole(token)) as "restaurant" | "driver") || null;

    setApiToken(token);
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, token),
      role
        ? AsyncStorage.setItem(ROLE_KEY, role)
        : AsyncStorage.removeItem(ROLE_KEY),
    ]);
    setState({ token, role, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    setApiToken(null);
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(ROLE_KEY),
    ]);
    setState({ token: null, role: null, isLoading: false });
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
