import { createBrowserRouter, RouterProvider } from "react-router";
import HomePage from "../pages/Home/HomePage";
import RootLayout from "../layouts/RootLayout";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import DashboardLayout from "../layouts/DashboardLayout";
import CustomerDashboard from "../pages/Dashboard/Customer/CustomerDashboard";
import BookParcel from "../pages/Dashboard/Customer/BookParcel";
import MyParcels from "../pages/Dashboard/Customer/MyParcels";
import TrackParcelLive from "../pages/Dashboard/Customer/TrackParcelLive";
import AgentDashboard from "../pages/Dashboard/Agent/AgentDashboard";
import AssignedParcels from "../pages/Dashboard/Agent/AssignedParcels";
import AdminDashboard from "../pages/Dashboard/admin/AdminDashboard";

const AllRoutes = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          path: "/",
          element: <HomePage />,
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/register",
          element: <Register />,
        },
      ],
    },
    {
      path: "/dashboard",
      element: <DashboardLayout />,
      children: [
        {
          path: "/dashboard/customer",
          element: <CustomerDashboard />,
        },
        {
          path: "/dashboard/customer/book-parcel",
          element: <BookParcel />,
        },
        {
          path: "/dashboard/customer/my-parcels",
          element: <MyParcels />,
        },
        {
          path: "/dashboard/customer/track-parcel",
          element: <TrackParcelLive />,
        },

        /// ADMIN ROUTES
        {
          path: "/dashboard/admin",
          element: <AdminDashboard />,
        },

        /// AGENT ROUTES
        {
          path: "/dashboard/agent",
          element: <AgentDashboard />,
        },
        {
          path: "/dashboard/agent/assigned-parcels",
          element: <AssignedParcels />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default AllRoutes;
