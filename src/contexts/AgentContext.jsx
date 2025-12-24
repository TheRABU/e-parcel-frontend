// contexts/AgentContext.jsx
import { createContext, useCallback, useContext, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { useAuth } from "./AuthContext";

const AgentContext = createContext();

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error("useAgent must be used within AgentProvider");
  }
  return context;
};

export const AgentProvider = ({ children }) => {
  const [assignedParcels, setAssignedParcels] = useState([]);
  const [agentStats, setAgentStats] = useState(null);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Customer applies to become agent
  const applyForAgent = async (applicationData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post(
        "/agent/apply",
        applicationData
      );
      return { success: true, data: response.data };
    } catch (error) {
      setError(error.response?.data?.message || "Application failed");
      return { success: false, error: error.response?.data };
    } finally {
      setLoading(false);
    }
  };

  // Agent: Get assigned parcels
  const fetchAssignedParcels = useCallback(async (status = "") => {
    setLoading(true);
    try {
      const url = status
        ? `/agent/assigned-parcels?status=${status}`
        : "/agent/assigned-parcels";
      const response = await axiosInstance.get(url);

      // Match backend response structure
      const data = response.data.data;
      setAssignedParcels(data.parcels || []);
      setAgentStats(data.statistics || null);

      return { success: true, data: response.data };
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch assigned parcels"
      );
      return { success: false, error: error.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  // Agent: Update parcel status
  const updateParcelStatus = async (parcelId, statusData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(
        `/agent/assigned-update?parcelId=${parcelId}`,
        statusData
      );

      // Update in local state if successful
      if (response.data.success) {
        setAssignedParcels((prev) =>
          prev.map((parcel) =>
            parcel.id === parcelId
              ? { ...parcel, status: statusData.status }
              : parcel
          )
        );
      }

      return { success: true, data: response.data };
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update parcel status"
      );
      return { success: false, error: error.response?.data };
    } finally {
      setLoading(false);
    }
  };

  // Agent: Update location
  const updateAgentLocation = async (locationData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(
        "/agent/assigned-location",
        locationData
      );
      return { success: true, data: response.data };
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update location");
      return { success: false, error: error.response?.data };
    } finally {
      setLoading(false);
    }
  };

  // Agent: Toggle availability
  const toggleAvailability = async (availabilityData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(
        "/agent/availability",
        availabilityData
      );
      return { success: true, data: response.data };
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update availability"
      );
      return { success: false, error: error.response?.data };
    } finally {
      setLoading(false);
    }
  };

  // Admin: Get pending applications
  const fetchPendingApplications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/agent/pending");
      const data = response.data.data;
      setPendingApplications(data.applications || []);

      return { success: true, data: response.data };
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch pending applications"
      );
      return { success: false, error: error.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin
  const approveAgentApplication = async (userId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(`/agent/approve/${userId}`);
      if (response.data.success) {
        setPendingApplications((prev) =>
          prev.filter((app) => app.userId !== userId)
        );
      }

      return { success: true, data: response.data };
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to approve application"
      );
      return { success: false, error: error.response?.data };
    } finally {
      setLoading(false);
    }
  };

  // Get current agent info from user context
  const getAgentInfo = () => {
    if (!user || user.role !== "agent") return null;

    return {
      name: user.name,
      email: user.email,
      phone: user.phone,
      vehicleType: user.agentDetails?.vehicleType,
      vehicleNumber: user.agentDetails?.vehicleNumber,
      totalDeliveries: user.agentDetails?.totalDeliveries || 0,
      rating: user.agentDetails?.rating || 0,
      isAvailable: user.agentDetails?.isAvailable || false,
    };
  };

  const value = {
    // State
    assignedParcels,
    agentStats,
    pendingApplications,
    loading,
    error,

    // Agent functions
    applyForAgent,
    fetchAssignedParcels,
    updateParcelStatus,
    updateAgentLocation,
    toggleAvailability,

    // Admin functions
    fetchPendingApplications,
    approveAgentApplication,

    // Helper functions
    getAgentInfo,
    clearError: () => setError(null),
    clearParcels: () => setAssignedParcels([]),
    clearApplications: () => setPendingApplications([]),

    // Computed properties
    isAgent: user?.role === "agent",
    isAdmin: user?.role === "admin",
    agentInfo: getAgentInfo(),
  };

  return (
    <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
  );
};
