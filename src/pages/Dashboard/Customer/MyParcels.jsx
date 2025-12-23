import { useEffect, useState } from "react";
import { useParcel } from "../../../contexts/ParcelContext";

const MyParcels = () => {
  const { fetchMyParcels, parcels, loading, error } = useParcel();
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMyParcels();
  }, [fetchMyParcels]);

  // Filter and sort parcels
  const filteredParcels = parcels
    .filter((parcel) => {
      // Filter by status
      if (filterStatus !== "all" && parcel.status !== filterStatus)
        return false;

      // Search by tracking number or address
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          parcel.trackingNumber.toLowerCase().includes(query) ||
          parcel.pickupAddress.toLowerCase().includes(query) ||
          parcel.deliveryAddress.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "status":
          return a.status.localeCompare(b.status);
        case "amount":
          return b.amount - a.amount;
        default:
          return 0;
      }
    });

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "picked-up":
        return "bg-purple-100 text-purple-800";
      case "in-transit":
        return "bg-indigo-100 text-indigo-800";
      case "out-for-delivery":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "assigned":
        return "👤";
      case "picked-up":
        return "📦";
      case "in-transit":
        return "🚚";
      case "out-for-delivery":
        return "🏍️";
      case "delivered":
        return "✅";
      case "failed":
        return "❌";
      case "cancelled":
        return "🚫";
      default:
        return "📦";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your parcels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium">Error: {error}</p>
        <button
          onClick={fetchMyParcels}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Parcels</h1>
        <p className="text-gray-600">
          Track and manage all your shipments in one place
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">
            {parcels.length}
          </div>
          <div className="text-sm text-gray-500">Total Parcels</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {parcels.filter((p) => p.status === "delivered").length}
          </div>
          <div className="text-sm text-gray-500">Delivered</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-orange-600">
            {
              parcels.filter((p) =>
                ["in-transit", "out-for-delivery"].includes(p.status)
              ).length
            }
          </div>
          <div className="text-sm text-gray-500">In Transit</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600">
            {parcels.filter((p) => p.status === "failed").length}
          </div>
          <div className="text-sm text-gray-500">Failed</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by tracking number or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="picked-up">Picked Up</option>
              <option value="in-transit">In Transit</option>
              <option value="out-for-delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="status">By Status</option>
              <option value="amount">By Amount</option>
            </select>

            {/* Refresh */}
            <button
              onClick={fetchMyParcels}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <span>🔄</span>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Parcel Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing{" "}
          <span className="font-semibold">{filteredParcels.length}</span> of{" "}
          <span className="font-semibold">{parcels.length}</span> parcels
        </p>
      </div>

      {/* Parcels Grid */}
      {filteredParcels.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No parcels found
          </h3>
          <p className="text-gray-500">
            {searchQuery || filterStatus !== "all"
              ? "Try changing your search or filter criteria"
              : "You haven't booked any parcels yet"}
          </p>
          {!searchQuery && filterStatus === "all" && (
            <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Book Your First Parcel
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParcels.map((parcel) => (
            <div
              key={parcel.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100"
            >
              {/* Status Header */}
              <div className={`px-6 py-4 ${getStatusColor(parcel.status)}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getStatusIcon(parcel.status)}
                    </span>
                    <span className="font-semibold uppercase text-sm">
                      {parcel.status.replace("-", " ")}
                    </span>
                  </div>
                  <div className="text-xs font-medium bg-white/30 px-2 py-1 rounded">
                    {formatDate(parcel.createdAt)}
                  </div>
                </div>
              </div>

              {/* Parcel Details */}
              <div className="p-6">
                {/* Tracking Number */}
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm text-gray-500">Tracking Number</p>
                      <p className="text-lg font-mono font-bold text-gray-800">
                        {parcel.trackingNumber}
                      </p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {parcel.parcelType}
                    </span>
                  </div>
                </div>

                {/* Route */}
                <div className="mb-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                    <div>
                      <p className="text-xs text-gray-500">From</p>
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {parcel.pickupAddress}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                    <div>
                      <p className="text-xs text-gray-500">To</p>
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {parcel.deliveryAddress}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Parcel Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500">Weight</p>
                    <p className="text-sm font-medium">{parcel.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Size</p>
                    <p className="text-sm font-medium capitalize">
                      {parcel.parcelSize}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Payment</p>
                    <p className="text-sm font-medium capitalize">
                      {parcel.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-sm font-medium">
                      {formatCurrency(parcel.amount)}
                    </p>
                  </div>
                </div>

                {/* Agent Info (if assigned) */}
                {parcel.agent && (
                  <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">Assigned Agent</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600">👤</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {parcel.agent.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {parcel.agent.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delivery Date */}
                {parcel.estimatedDeliveryDate && (
                  <div className="mb-6">
                    <p className="text-xs text-gray-500 mb-1">
                      Estimated Delivery
                    </p>
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <p className="text-sm font-medium">
                        {formatDate(parcel.estimatedDeliveryDate)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium">
                    Track
                  </button>
                  <button className="flex-1 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 text-sm font-medium">
                    Details
                  </button>
                  {parcel.status === "pending" && (
                    <button className="flex-1 px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 text-sm font-medium">
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State for No Parcels at all */}
      {parcels.length === 0 && !loading && !error && (
        <div className="text-center py-16">
          <div className="text-7xl mb-6">📭</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-3">
            No parcels yet
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            You haven't booked any parcels yet. Start shipping by booking your
            first parcel!
          </p>
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg">
            Book Your First Parcel
          </button>
        </div>
      )}
    </div>
  );
};

export default MyParcels;
