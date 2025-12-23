import { createContext, useContext, useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";

const AuthContext = createContext();

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // check the authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axiosInstance.get("/user/me");
      setUser(response.data.data);
      console.log("checkauth er data", response.data.data);
      // which means user is now authenticated
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      // Cookie is set automatically by backend
      await checkAuth();
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axiosInstance.post("/auth/register", userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const values = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    isAdmin: user?.role === "admin",
    isAgent: user?.role === "agent",
    isCustomer: user?.role === "customer",
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};
