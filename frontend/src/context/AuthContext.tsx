import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import type { AuthResponse, User } from "../types";

const API_BASE_URL = "http://localhost:5070";
const STORAGE_KEY = "inn-booking-auth";

interface AuthContextValue {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Restore a previous session from localStorage on first load.
    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        try {
            const stored: AuthResponse = JSON.parse(raw);
            setUser(stored.user);
            setToken(stored.token);
        } catch {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    function persist(stored: AuthResponse | null) {
        if (stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
            setUser(stored.user);
            setToken(stored.token);
        } else {
            localStorage.removeItem(STORAGE_KEY);
            setUser(null);
            setToken(null);
        }
    }

    async function submit(path: "register" | "login", body: unknown): Promise<boolean> {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/${path}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const problem = await response.json().catch(() => null);
                throw new Error(problem?.message ?? `Το αίτημα απέτυχε (${response.status}).`);
            }

            const data: AuthResponse = await response.json();
            persist(data);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Κάτι πήγε στραβά. Δοκιμάστε ξανά.");
            return false;
        } finally {
            setIsLoading(false);
        }
    }

    async function register(name: string, email: string, password: string) {
        return submit("register", { name, email, password });
    }

    async function login(email: string, password: string) {
        return submit("login", { email, password });
    }

    function logout() {
        // JWTs are stateless -- logging out just discards the local token.
        persist(null);
    }

    return (
        <AuthContext.Provider value={{ user, token, isLoading, error, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
