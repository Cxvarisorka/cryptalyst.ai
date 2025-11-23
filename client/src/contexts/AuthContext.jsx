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

  // Configure axios to send httpOnly cookies with requests
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || "https://cryptalyst.onrender.com/api";

  // NO interceptor needed - tokens are in httpOnly cookies, not localStorage
  // Cookies are automatically sent with every request (withCredentials: true)

  // Check if user is logged in on mount and handle OAuth callback
  useEffect(() => {
    handleOAuthCallback();
    checkAuth();
  }, []);

  const handleOAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');

    if (authStatus === 'success') {
      // Token is already set in httpOnly cookie by server
      console.log('✅ OAuth successful - cookie set by server');

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
        // Token is automatically set in httpOnly cookie by server
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
        // Token is automatically set in httpOnly cookie by server
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
      // Cookie is automatically cleared by server
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
      // Clear user even if request fails
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
  // Refresh user data (useful after settings updates)
  const refreshUser = async () => {
    try {
      const response = await axios.get("/auth/me");
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true };
      }
    } catch (err) {
      console.error("Refresh user error:", err);
      return { success: false };
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
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
