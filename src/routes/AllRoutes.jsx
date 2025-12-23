import { createBrowserRouter, RouterProvider } from "react-router";
import HomePage from "../pages/Home/HomePage";
import RootLayout from "../layouts/RootLayout";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import DashboardLayout from "../layouts/DashboardLayout";
import CustomerDashboard from "../pages/Dashboard/Customer/CustomerDashboard";
import BookParcel from "../pages/Dashboard/Customer/BookParcel";

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
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default AllRoutes;
