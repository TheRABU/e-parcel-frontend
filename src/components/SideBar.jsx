import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";

const SideBar = () => {
  const { user } = useAuth();

  const isCustomer = user?.role === "customer";
  const isAdmin = user?.role === "admin";
  const isAgent = user?.role === "agent";

  const customerLinks = [
    { name: "Book Parcel", path: "/dashboard/customer/book-parcel" },
    { name: "My Parcels", path: "/dashboard/customer/my-parcels" },
    { name: "Track Parcel", path: "/dashboard/customer/track-parcel" },
  ];

  const agentLinks = [
    { name: "Assigned Parcels", path: "/assigned-parcels" },
    { name: "Update Parcel Status", path: "/update-parcel-status" },
  ];
  const adminLinks = [
    { name: "User Management", path: "/user-management" },
    { name: "Parcel Overview", path: "/parcel-overview" },
    { name: "Agent Management", path: "/agent-management" },
  ];
  return (
    <>
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-center justify-center">
          {/* Page content here */}
          <label htmlFor="my-drawer-3" className="btn drawer-button lg:hidden">
            Open
          </label>
        </div>
        <div className="drawer-side">
          <label
            htmlFor="my-drawer-3"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <ul className="menu bg-base-200 min-h-full w-80 p-4">
            {/* Sidebar content here */}
            {isCustomer &&
              customerLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>{link.name}</Link>
                </li>
              ))}
            {isAgent &&
              agentLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>{link.name}</Link>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default SideBar;
