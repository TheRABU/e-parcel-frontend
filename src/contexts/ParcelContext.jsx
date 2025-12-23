import { createContext, useCallback, useContext, useState } from "react";
import { axiosInstance } from "../lib/axios";

const ParcelContext = createContext();

export const useParcel = () => {
  const context = useContext(ParcelContext);
  if (!context) {
    throw new Error("useParcel must be used within ParcelProvider");
  }
  return context;
};

export const ParcelProvider = ({ children }) => {
  const [parcels, setParcels] = useState([]);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // book parcel
  const bookParcel = async (parcelData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post(
        "/api/parcels/book",
        parcelData
      );
      setParcels((prev) => [response.data.data.parcel, ...prev]);
      return { success: true, data: response.data };
    } catch (error) {
      setError(error.response?.data?.message || "Booking failed");
      return { success: false, error: error.response?.data };
    } finally {
      setLoading(false);
    }
  };

  // get my parcel
  const fetchMyParcels = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/parcel/my-parcels");
      setParcels(response.data.data.parcels);
      return { success: true, data: response.data };
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch parcels");
      return { success: false, error: error.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  // track parcel
  const trackParcel = async (trackingNumber) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/parcel/track/${trackingNumber}`
      );
      setTrackingData(response.data.data);
      return { success: true, data: response.data };
    } catch (error) {
      setError(error.response?.data?.message || "Tracking failed");
      return { success: false, error: error.response?.data };
    } finally {
      setLoading(false);
    }
  };

  // Update parcel
  const updateParcel = async (parcelId, updateData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(
        `/api/parcels/update/${parcelId}`,
        updateData
      );

      // Update in local state
      setParcels((prev) =>
        prev.map((parcel) =>
          parcel.id === parcelId ? { ...parcel, ...response.data.data } : parcel
        )
      );

      return { success: true, data: response.data };
    } catch (error) {
      setError(error.response?.data?.message || "Update failed");
      return { success: false, error: error.response?.data };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    parcels,
    trackingData,
    loading,
    error,
    bookParcel,
    fetchMyParcels,
    trackParcel,
    updateParcel,
    clearError: () => setError(null),
    clearTrackingData: () => setTrackingData(null),
  };

  return (
    <ParcelContext.Provider value={value}>{children}</ParcelContext.Provider>
  );
};
