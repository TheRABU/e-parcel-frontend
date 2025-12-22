import { createBrowserRouter, RouterProvider } from "react-router";
import HomePage from "../pages/Home/HomePage";
import RootLayout from "../layouts/RootLayout";

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
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default AllRoutes;
