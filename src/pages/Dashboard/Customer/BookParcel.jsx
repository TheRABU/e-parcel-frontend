import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icons
const pickupIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const deliveryIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Map click handler component
function LocationSelector({ onLocationSelect, markerPosition }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });

  return markerPosition ? (
    <Marker position={markerPosition}>
      <Popup>Selected Location</Popup>
    </Marker>
  ) : null;
}

export default function BookParcel() {
  const [formData, setFormData] = useState({
    pickupAddress: "",
    pickupLat: "",
    pickupLng: "",
    pickupContactPerson: "",
    pickupContactPhone: "",
    deliveryAddress: "",
    deliveryLat: "",
    deliveryLng: "",
    deliveryContactPerson: "",
    deliveryContactPhone: "",
    weight: "",
    size: "medium",
    type: "package",
    description: "",
    quantity: "1",
    paymentMethod: "prepaid",
    amount: "",
    codAmount: "",
    estimatedDeliveryDate: "",
  });

  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [deliverySuggestions, setDeliverySuggestions] = useState([]);
  const [loadingPickup, setLoadingPickup] = useState(false);
  const [loadingDelivery, setLoadingDelivery] = useState(false);
  const [showPickupMap, setShowPickupMap] = useState(false);
  const [showDeliveryMap, setShowDeliveryMap] = useState(false);
  const [pickupMarker, setPickupMarker] = useState(null);
  const [deliveryMarker, setDeliveryMarker] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search location using Nominatim (OpenStreetMap)
  const searchLocation = async (query, type) => {
    if (query.length < 3) {
      if (type === "pickup") setPickupSuggestions([]);
      else setDeliverySuggestions([]);
      return;
    }

    try {
      if (type === "pickup") setLoadingPickup(true);
      else setLoadingDelivery(true);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5&countrycodes=bd`
      );
      const data = await response.json();

      const suggestions = data.map((item) => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      }));

      if (type === "pickup") setPickupSuggestions(suggestions);
      else setDeliverySuggestions(suggestions);
    } catch (error) {
      console.error("Error searching location:", error);
    } finally {
      if (type === "pickup") setLoadingPickup(false);
      else setLoadingDelivery(false);
    }
  };

  // Select location from dropdown
  const selectLocation = (suggestion, type) => {
    if (type === "pickup") {
      setFormData((prev) => ({
        ...prev,
        pickupAddress: suggestion.display_name,
        pickupLat: suggestion.lat,
        pickupLng: suggestion.lon,
      }));
      setPickupMarker([suggestion.lat, suggestion.lon]);
      setPickupSuggestions([]);
    } else {
      setFormData((prev) => ({
        ...prev,
        deliveryAddress: suggestion.display_name,
        deliveryLat: suggestion.lat,
        deliveryLng: suggestion.lon,
      }));
      setDeliveryMarker([suggestion.lat, suggestion.lon]);
      setDeliverySuggestions([]);
    }
  };

  // Handle map click (reverse geocoding)
  const handleMapClick = async (latlng, type) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
      );
      const data = await response.json();

      if (type === "pickup") {
        setFormData((prev) => ({
          ...prev,
          pickupAddress: data.display_name,
          pickupLat: latlng.lat,
          pickupLng: latlng.lng,
        }));
        setPickupMarker([latlng.lat, latlng.lng]);
      } else {
        setFormData((prev) => ({
          ...prev,
          deliveryAddress: data.display_name,
          deliveryLat: latlng.lat,
          deliveryLng: latlng.lng,
        }));
        setDeliveryMarker([latlng.lat, latlng.lng]);
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Trigger search for address fields
    if (name === "pickupAddress") {
      searchLocation(value, "pickup");
    } else if (name === "deliveryAddress") {
      searchLocation(value, "delivery");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken"); // Adjust based on your auth

      const response = await fetch(
        "http://localhost:5000/api/v1/parcel/book-parcel",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(`✅ Parcel booked! Tracking: ${data.data.trackingNumber}`);
        // Reset form
        window.location.reload(); // Or navigate to dashboard
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error booking parcel:", error);
      alert("Failed to book parcel. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Book a Parcel</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Pickup Location Section */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
            <span className="mr-2">📍</span> Pickup Location
          </h2>

          <div className="space-y-4">
            {/* Pickup Address Autocomplete */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Address *
              </label>
              <input
                type="text"
                name="pickupAddress"
                value={formData.pickupAddress}
                onChange={handleChange}
                placeholder="Type to search (e.g., Dhaka, Mirpur)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              {loadingPickup && (
                <div className="absolute right-3 top-9 text-gray-400">
                  Searching...
                </div>
              )}

              {/* Suggestions Dropdown */}
              {pickupSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {pickupSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      onClick={() => selectLocation(suggestion, "pickup")}
                      className="px-4 py-2 hover:bg-green-100 cursor-pointer border-b last:border-b-0"
                    >
                      <p className="text-sm text-gray-800">
                        {suggestion.display_name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Show coordinates */}
            {formData.pickupLat && formData.pickupLng && (
              <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                📌 Lat: {formData.pickupLat.toFixed(4)}, Lng:{" "}
                {formData.pickupLng.toFixed(4)}
              </div>
            )}

            {/* Map Toggle */}
            <button
              type="button"
              onClick={() => setShowPickupMap(!showPickupMap)}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              {showPickupMap ? "🗺️ Hide Map" : "🗺️ Select on Map"}
            </button>

            {/* Map */}
            {showPickupMap && (
              <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
                <MapContainer
                  center={pickupMarker || [23.8103, 90.4125]} // Dhaka coordinates
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <LocationSelector
                    onLocationSelect={(latlng) =>
                      handleMapClick(latlng, "pickup")
                    }
                    markerPosition={pickupMarker}
                  />
                  {pickupMarker && (
                    <Marker position={pickupMarker} icon={pickupIcon}>
                      <Popup>Pickup Location</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            )}

            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="pickupContactPerson"
                  value={formData.pickupContactPerson}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="pickupContactPhone"
                  value={formData.pickupContactPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Location Section - Similar structure */}
        {/* ... (Continue with delivery, parcel details, payment sections) ... */}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isSubmitting ? "Booking..." : "Book Parcel"}
          </button>
        </div>
      </form>
    </div>
  );
}
