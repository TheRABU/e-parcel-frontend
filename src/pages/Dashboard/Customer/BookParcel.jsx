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
import { useParcel } from "../../../contexts/ParcelContext";

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
  const [formErrors, setFormErrors] = useState({});

  const { bookParcel } = useParcel();

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

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Trigger search for address fields
    if (name === "pickupAddress") {
      searchLocation(value, "pickup");
    } else if (name === "deliveryAddress") {
      searchLocation(value, "delivery");
    }

    // Handle COD amount visibility
    if (name === "paymentMethod") {
      if (value === "cod") {
        setFormData((prev) => ({ ...prev, codAmount: "" }));
      } else {
        setFormData((prev) => ({ ...prev, codAmount: "" }));
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.pickupAddress || !formData.pickupLat || !formData.pickupLng) {
      errors.pickupAddress = "Pickup location is required";
    }

    if (
      !formData.deliveryAddress ||
      !formData.deliveryLat ||
      !formData.deliveryLng ||
      !formData.deliveryContactPerson ||
      !formData.deliveryContactPhone
    ) {
      if (!formData.deliveryAddress)
        errors.deliveryAddress = "Delivery address is required";
      if (!formData.deliveryContactPerson)
        errors.deliveryContactPerson = "Contact person is required";
      if (!formData.deliveryContactPhone)
        errors.deliveryContactPhone = "Contact phone is required";
    }

    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      errors.weight = "Valid weight is required";
    }

    if (!formData.size) {
      errors.size = "Size is required";
    }

    if (!formData.type) {
      errors.type = "Type is required";
    }

    if (!formData.paymentMethod) {
      errors.paymentMethod = "Payment method is required";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = "Valid amount is required";
    }

    if (
      formData.paymentMethod === "cod" &&
      (!formData.codAmount || parseFloat(formData.codAmount) <= 0)
    ) {
      errors.codAmount = "COD amount is required for COD payments";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fix the errors in the form before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const parcelData = {
        pickupAddress: formData.pickupAddress,
        pickupLat: formData.pickupLat,
        pickupLng: formData.pickupLng,
        pickupContactPerson: formData.pickupContactPerson || "",
        pickupContactPhone: formData.pickupContactPhone || "",
        deliveryAddress: formData.deliveryAddress,
        deliveryLat: formData.deliveryLat,
        deliveryLng: formData.deliveryLng,
        deliveryContactPerson: formData.deliveryContactPerson,
        deliveryContactPhone: formData.deliveryContactPhone,
        weight: formData.weight,
        size: formData.size,
        type: formData.type,
        description: formData.description || "",
        quantity: formData.quantity || "1",
        paymentMethod: formData.paymentMethod,
        amount: formData.amount,
        codAmount: formData.paymentMethod === "cod" ? formData.codAmount : "0",
        estimatedDeliveryDate: formData.estimatedDeliveryDate || "",
      };

      console.log("Sending parcel data:", parcelData);
      const response = await bookParcel(parcelData);
      console.log("Parcel booking response from BookParcel page", response);
      if (response.success) {
        alert(`Parcel booked! Tracking: ${response.data.data.trackingNumber}`);

        window.location.reload();
      } else {
        alert(`Error: ${response.error.message}`);
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
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
            <span className="mr-2">📍</span> Pickup Location
          </h2>
          {/* Pickup Address Autocomplete */}
          <div className="space-y-4">
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
              {formErrors.pickupAddress && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.pickupAddress}
                </p>
              )}
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
            {formData.pickupLat && formData.pickupLng ? (
              <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                📌 Lat: {formData.pickupLat.toFixed(4)}, Lng:{" "}
                {formData.pickupLng.toFixed(4)}
              </div>
            ) : (
              <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                ⚠️ Please select a pickup location from search or map
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
                  placeholder="Optional"
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
                  placeholder="Optional"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Location Section */}
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h2 className="text-xl font-semibold text-red-800 mb-4 flex items-center">
            <span className="mr-2">📍</span> Destination Location
          </h2>
          <div className="space-y-4">
            {/* Delivery Address Autocomplete */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Address *
              </label>
              <input
                type="text"
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleChange}
                placeholder="Type to search (e.g., Dhaka, Gulshan)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
              {formErrors.deliveryAddress && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.deliveryAddress}
                </p>
              )}
              {loadingDelivery && (
                <div className="absolute right-3 top-9 text-gray-400">
                  Searching...
                </div>
              )}

              {/* Suggestions Dropdown */}
              {deliverySuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {deliverySuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      onClick={() => selectLocation(suggestion, "delivery")}
                      className="px-4 py-2 hover:bg-red-100 cursor-pointer border-b last:border-b-0"
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
            {formData.deliveryLat && formData.deliveryLng ? (
              <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                📌 Lat: {formData.deliveryLat.toFixed(4)}, Lng:{" "}
                {formData.deliveryLng.toFixed(4)}
              </div>
            ) : (
              <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                ⚠️ Please select a delivery location from search or map
              </div>
            )}

            {/* Map Toggle */}
            <button
              type="button"
              onClick={() => setShowDeliveryMap(!showDeliveryMap)}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              {showDeliveryMap ? "🗺️ Hide Map" : "🗺️ Select on Map"}
            </button>

            {/* Map */}
            {showDeliveryMap && (
              <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
                <MapContainer
                  center={deliveryMarker || [23.8103, 90.4125]} // Dhaka coordinates
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <LocationSelector
                    onLocationSelect={(latlng) =>
                      handleMapClick(latlng, "delivery")
                    }
                    markerPosition={deliveryMarker}
                  />
                  {deliveryMarker && (
                    <Marker position={deliveryMarker} icon={deliveryIcon}>
                      <Popup>Delivery Location</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            )}

            {/* Delivery Contact Details (REQUIRED) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person *
                </label>
                <input
                  type="text"
                  name="deliveryContactPerson"
                  value={formData.deliveryContactPerson}
                  onChange={handleChange}
                  placeholder="Recipient name"
                  className={`w-full px-4 py-2 border rounded-md ${
                    formErrors.deliveryContactPerson
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  required
                />
                {formErrors.deliveryContactPerson && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.deliveryContactPerson}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  name="deliveryContactPhone"
                  value={formData.deliveryContactPhone}
                  onChange={handleChange}
                  placeholder="Recipient phone number"
                  className={`w-full px-4 py-2 border rounded-md ${
                    formErrors.deliveryContactPhone
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  required
                />
                {formErrors.deliveryContactPhone && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.deliveryContactPhone}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Parcel Details Section */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
            <span className="mr-2">📦</span> Parcel Details
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  min="0.1"
                  step="0.1"
                  placeholder="e.g., 2.5"
                  className={`w-full px-4 py-2 border rounded-md ${
                    formErrors.weight ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {formErrors.weight && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.weight}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  placeholder="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size *
                </label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md ${
                    formErrors.size ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                >
                  <option value="small">Small (Under 1kg)</option>
                  <option value="medium">Medium (1-5kg)</option>
                  <option value="large">Large (5-15kg)</option>
                  <option value="extra-large">Extra Large (15+ kg)</option>
                </select>
                {formErrors.size && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.size}</p>
                )}
              </div>

              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md ${
                    formErrors.type ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                >
                  <option value="document">Document</option>
                  <option value="package">Package</option>
                  <option value="fragile">Fragile</option>
                  <option value="electronics">Electronics</option>
                  <option value="food">Food</option>
                  <option value="other">Other</option>
                </select>
                {formErrors.type && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.type}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the contents of your parcel..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Payment Details Section */}
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <h2 className="text-xl font-semibold text-purple-800 mb-4 flex items-center">
            <span className="mr-2">💳</span> Payment Details
          </h2>

          <div className="space-y-4">
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="prepaid"
                    checked={formData.paymentMethod === "prepaid"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span>Prepaid</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span>Cash on Delivery (COD)</span>
                </label>
              </div>
              {formErrors.paymentMethod && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.paymentMethod}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (BDT) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 150.00"
                  className={`w-full px-4 py-2 border rounded-md ${
                    formErrors.amount ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {formErrors.amount && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.amount}
                  </p>
                )}
              </div>

              {/* COD Amount (Conditional) */}
              {formData.paymentMethod === "cod" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    COD Amount (BDT) *
                  </label>
                  <input
                    type="number"
                    name="codAmount"
                    value={formData.codAmount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Amount to collect on delivery"
                    className={`w-full px-4 py-2 border rounded-md ${
                      formErrors.codAmount
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    required={formData.paymentMethod === "cod"}
                  />
                  {formErrors.codAmount && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.codAmount}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delivery Date Section */}
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h2 className="text-xl font-semibold text-yellow-800 mb-4 flex items-center">
            <span className="mr-2">📅</span> Delivery Information
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Estimated Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Delivery Date (Optional)
                </label>
                <input
                  type="date"
                  name="estimatedDeliveryDate"
                  value={formData.estimatedDeliveryDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for automatic calculation
                </p>
              </div>
            </div>
          </div>
        </div>

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
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Booking...
              </>
            ) : (
              "Book Parcel"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
