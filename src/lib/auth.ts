const STRAPI_URL = import.meta.env.VITE_STRAPI_URL as string | undefined;

export interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "cook";
  avatar?: string;
  newsletterSubscribed?: boolean;
  bio?: string;
  createdAt?: string;
}

export interface AuthResponse {
  jwt: string;
  user: User;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: "user" | "cook";
}

export interface LoginData {
  identifier: string; // email or username
  password: string;
}

// JWT Token Management
export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem("jwt");
  },

  setToken: (token: string): void => {
    localStorage.setItem("jwt", token);
  },

  removeToken: (): void => {
    localStorage.removeItem("jwt");
  },

  hasToken: (): boolean => {
    return !!localStorage.getItem("jwt");
  },
};

// Auth API Client
export const authAPI = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    if (!STRAPI_URL) {
      throw new Error("VITE_STRAPI_URL is not configured");
    }

    const response = await fetch(
      `${STRAPI_URL.replace(/\/$/, "")}/api/auth/local/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
          role: data.role || "user",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Registration failed");
    }

    return response.json();
  },

  /**
   * Login with email/username and password
   */
  login: async (data: LoginData): Promise<AuthResponse> => {
    if (!STRAPI_URL) {
      throw new Error("VITE_STRAPI_URL is not configured");
    }

    const response = await fetch(
      `${STRAPI_URL.replace(/\/$/, "")}/api/auth/local`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: data.identifier,
          password: data.password,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Login failed");
    }

    return response.json();
  },

  /**
   * Get current user data (requires JWT)
   */
  me: async (): Promise<User> => {
    if (!STRAPI_URL) {
      throw new Error("VITE_STRAPI_URL is not configured");
    }

    const token = tokenManager.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `${STRAPI_URL.replace(/\/$/, "")}/api/users/me`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        tokenManager.removeToken();
        throw new Error("Token expired or invalid");
      }
      throw new Error("Failed to fetch user data");
    }

    return response.json();
  },

  /**
   * Update user profile (requires JWT)
   */
  updateProfile: async (userId: number, data: Partial<User>): Promise<User> => {
    if (!STRAPI_URL) {
      throw new Error("VITE_STRAPI_URL is not configured");
    }

    const token = tokenManager.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `${STRAPI_URL.replace(/\/$/, "")}/api/users/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Profile update failed");
    }

    return response.json();
  },

  /**
   * Logout (just clears token)
   */
  logout: (): void => {
    tokenManager.removeToken();
  },
};

/**
 * Helper to make authenticated API calls
 */
export const authenticatedFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  if (!STRAPI_URL) {
    throw new Error("VITE_STRAPI_URL is not configured");
  }

  const token = tokenManager.getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${STRAPI_URL.replace(/\/$/, "")}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 - token expired
  if (response.status === 401) {
    tokenManager.removeToken();
    window.location.href = "/login";
  }

  return response;
};
