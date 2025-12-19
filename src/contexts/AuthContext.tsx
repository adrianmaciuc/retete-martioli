import { createContext, useState, useEffect, ReactNode } from "react";
import { authAPI, tokenManager, User } from "../lib/auth";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCook: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    role: "user" | "cook"
  ) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenManager.getToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authAPI.me();
        setUser(userData);
      } catch (error) {
        console.error("Failed to load user:", error);
        tokenManager.removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const response = await authAPI.login({ identifier, password });
      tokenManager.setToken(response.jwt);
      setUser(response.user);
      toast.success("Welcome back!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
      throw error;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    role: "user" | "cook" = "user"
  ) => {
    try {
      const response = await authAPI.register({
        username,
        email,
        password,
        role,
      });
      tokenManager.setToken(response.jwt);
      setUser(response.user);
      toast.success("Account created successfully!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    toast.success("Logged out successfully");
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) {
      throw new Error("No user logged in");
    }

    try {
      const updatedUser = await authAPI.updateProfile(user.id, data);
      setUser(updatedUser);
      toast.success("Profile updated successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Profile update failed";
      toast.error(message);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authAPI.me();
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isCook: user?.role === "cook",
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
