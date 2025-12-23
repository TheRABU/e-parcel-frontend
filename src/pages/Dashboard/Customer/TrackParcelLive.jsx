import { useState, useEffect, useRef } from "react";
import { useParcel } from "../../../contexts/ParcelContext";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons
const pickupIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const deliveryIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const agentIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const TrackParcelLive = () => {
  const { trackParcel, trackingData, loading, error, clearTrackingData } =
    useParcel();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [submittedTrackingNumber, setSubmittedTrackingNumber] = useState("");
  const [mapCenter, setMapCenter] = useState([23.8103, 90.4125]); // Default: Dhaka
  const mapRef = useRef(null);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    clearTrackingData();
    setSubmittedTrackingNumber(trackingNumber);
    await trackParcel(trackingNumber);
  };

  // Update map when tracking data arrives
  useEffect(() => {
    if (trackingData && mapRef.current) {
      // Try to get current location first, then pickup location
      let centerLat, centerLng;

      if (trackingData.currentLocation?.coordinates) {
        centerLat = trackingData.currentLocation.coordinates.lat;
        centerLng = trackingData.currentLocation.coordinates.lng;
      } else if (trackingData.route?.pickup?.coordinates) {
        centerLat = trackingData.route.pickup.coordinates.lat;
        centerLng = trackingData.route.pickup.coordinates.lng;
      }

      if (centerLat && centerLng) {
        setMapCenter([centerLat, centerLng]);
        mapRef.current.setView([centerLat, centerLng], 13);
      }
    }
  }, [trackingData]);

  // Get current location coordinates
  const getCurrentLocation = () => {
    return trackingData?.currentLocation?.coordinates;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: "badge-warning",
      assigned: "badge-info",
      "picked-up": "badge-primary",
      "in-transit": "badge-secondary",
      "out-for-delivery": "badge-accent",
      delivered: "badge-success",
      failed: "badge-error",
      cancelled: "badge-neutral",
    };
    return colors[status] || "badge-neutral";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-gray-600">Tracking parcel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error max-w-md mx-auto mt-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Tracking Input Form */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6">Track Your Parcel</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Enter Tracking Number</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g., TRK123456789"
                  className="input input-bordered flex-1"
                  required
                />
                <button type="submit" className="btn btn-primary">
                  Track
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Show when tracking number is entered but no data yet */}
      {submittedTrackingNumber && !trackingData && !loading && !error && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No Parcel Found</h3>
          <p className="text-gray-500">
            No parcel found with tracking number:{" "}
            <strong>{submittedTrackingNumber}</strong>
          </p>
        </div>
      )}

      {/* Map and Tracking Details */}
      {trackingData && (
        <>
          {/* Parcel Info Header */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">Tracking Details</h3>
                    <div
                      className={`badge ${getStatusColor(
                        trackingData.status
                      )} text-sm`}
                    >
                      {trackingData.status?.replace("-", " ")}
                    </div>
                  </div>
                  <p className="font-mono text-lg">
                    {trackingData.trackingNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">
                    {trackingData.lastUpdated
                      ? new Date(trackingData.lastUpdated).toLocaleTimeString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Route Info */}
              {trackingData.route && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-base-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Pickup</span>
                    </div>
                    <p className="text-sm">
                      {trackingData.route.pickup?.address}
                    </p>
                  </div>
                  <div className="bg-base-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-medium">Delivery</span>
                    </div>
                    <p className="text-sm">
                      {trackingData.route.delivery?.address}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map Container */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h4 className="card-title mb-4">Live Location Map</h4>

              <div className="h-96 rounded-lg overflow-hidden border border-base-300">
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  ref={mapRef}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />

                  {/* Pickup Marker */}
                  {trackingData.route?.pickup?.coordinates && (
                    <Marker
                      position={[
                        trackingData.route.pickup.coordinates.lat,
                        trackingData.route.pickup.coordinates.lng,
                      ]}
                      icon={pickupIcon}
                    >
                      <Popup>
                        <div className="font-bold">Pickup Location</div>
                        <div className="text-sm">
                          {trackingData.route.pickup.address}
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Delivery Marker */}
                  {trackingData.route?.delivery?.coordinates && (
                    <Marker
                      position={[
                        trackingData.route.delivery.coordinates.lat,
                        trackingData.route.delivery.coordinates.lng,
                      ]}
                      icon={deliveryIcon}
                    >
                      <Popup>
                        <div className="font-bold">Delivery Location</div>
                        <div className="text-sm">
                          {trackingData.route.delivery.address}
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Current Location Marker */}
                  {getCurrentLocation() && (
                    <Marker
                      position={[
                        getCurrentLocation().lat,
                        getCurrentLocation().lng,
                      ]}
                      icon={agentIcon}
                    >
                      <Popup>
                        <div className="font-bold">Current Location</div>
                        <div className="text-sm">
                          {trackingData.agent?.name
                            ? `Agent: ${trackingData.agent.name}`
                            : "Parcel Location"}
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Route Line */}
                  {trackingData.route?.pickup?.coordinates &&
                    trackingData.route?.delivery?.coordinates && (
                      <Polyline
                        positions={[
                          [
                            trackingData.route.pickup.coordinates.lat,
                            trackingData.route.pickup.coordinates.lng,
                          ],
                          [
                            trackingData.route.delivery.coordinates.lat,
                            trackingData.route.delivery.coordinates.lng,
                          ],
                        ]}
                        color="#3B82F6"
                        weight={2}
                        dashArray="10, 10"
                      />
                    )}
                </MapContainer>
              </div>

              {/* Map Legend */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>Pickup Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span>Delivery Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span>Current Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-blue-500 border-dashed border"></div>
                  <span>Delivery Route</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {trackingData.agent && (
            <div className="card bg-base-100 shadow-xl mb-6">
              <div className="card-body">
                <h4 className="card-title mb-4">Delivery Agent</h4>
                <div className="flex items-center gap-4">
                  <div className="avatar placeholder">
                    <div className="bg-neutral text-neutral-content w-12 rounded-full">
                      <span className="text-xl">👤</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">{trackingData.agent.name}</p>
                    <p className="text-sm text-gray-500">
                      {trackingData.agent.phone}
                    </p>
                    {trackingData.agent.vehicleType && (
                      <p className="text-sm">
                        Vehicle:{" "}
                        <span className="badge badge-outline">
                          {trackingData.agent.vehicleType}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Timeline */}
          {trackingData.statusHistory?.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h4 className="card-title mb-4">Status Timeline</h4>
                <div className="space-y-4">
                  {trackingData.statusHistory.map((status, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        {index < trackingData.statusHistory.length - 1 && (
                          <div className="w-0.5 h-full bg-base-300"></div>
                        )}
                      </div>
                      <div className="pb-4">
                        <div className="flex justify-between">
                          <span className="font-medium capitalize">
                            {status.status.replace("-", " ")}
                          </span>
                          <span className="text-sm text-gray-500">
                            {status.timestamp
                              ? new Date(status.timestamp).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                        {status.remarks && (
                          <p className="text-sm text-gray-600 mt-1">
                            {status.remarks}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TrackParcelLive;
