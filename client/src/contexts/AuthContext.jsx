import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configure axios to send cookies with requests
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || "https://cryptalyst.onrender.com/api";

  // Add axios interceptor to include token from localStorage
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // Check if user is logged in on mount and handle OAuth callback
  useEffect(() => {
    handleOAuthCallback();
    checkAuth();
  }, []);

  const handleOAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const authStatus = urlParams.get('auth');

    if (token && authStatus === 'success') {
      // Store token in localStorage
      localStorage.setItem('token', token);
      console.log('✅ OAuth token stored successfully');

      // Clean URL by removing query parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await axios.get("/auth/me");
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    try {
      setError(null);
      const response = await axios.post("/auth/signup", {
        name,
        email,
        password,
      });

      if (response.data.success) {
        // Store token if provided
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        setUser(response.data.user);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || "Signup failed";
      setError(message);
      return { success: false, error: message };
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post("/auth/login", {
        email,
        password,
      });

      if (response.data.success) {
        // Store token if provided
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        setUser(response.data.user);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout");
      localStorage.removeItem('token');
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const response = await axios.get("/oauth/google");
      if (response.data.url) {
        // Redirect to Google OAuth
        window.location.href = response.data.url;
      }
    } catch (err) {
      const message = err.response?.data?.message || "Google login failed";
      setError(message);
      return { success: false, error: message };
    }
  };

  const loginWithGithub = async () => {
    try {
      const response = await axios.get("/oauth/github");
      if (response.data.url) {
        // Redirect to GitHub OAuth
        window.location.href = response.data.url;
      }
    } catch (err) {
      const message = err.response?.data?.message || "GitHub login failed";
      setError(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    loginWithGoogle,
    loginWithGithub,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
