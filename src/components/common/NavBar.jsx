import { Link } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

const NavBar = () => {
  const { logout, loading, isAuthenticated, user } = useAuth();
  const isCustomer = user?.role === "customer";
  const isAdmin = user?.role === "admin";
  const isAgent = user?.role === "agent";

  if (loading) {
    return (
      <>
        <span className="loading loading-bars loading-xl text-4xl text-blue-600"></span>
      </>
    );
  }

  const handleLogout = async () => {
    const logOut = await logout();
    console.log("user logged out", logOut);
  };

  return (
    <>
      <div className="navbar bg-base-100 shadow-sm">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />{" "}
              </svg>
            </div>
            <ul
              tabIndex="-1"
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
            >
              <li>
                <a>Item 1</a>
              </li>
              <li>
                <a>Parent</a>
                <ul className="p-2">
                  <li>
                    <a>Submenu 1</a>
                  </li>
                  <li>
                    <a>Submenu 2</a>
                  </li>
                </ul>
              </li>
              <li>
                <a>Item 3</a>
              </li>
            </ul>
          </div>
          <Link to={"/"} className="text-xl font-bold">
            <span className="text-red-500">E-</span>Parcel
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link to={"/"}>Home</Link>
            </li>
            <li>
              <Link to={"/send-parcel"}>Send Parcel</Link>
            </li>
          </ul>
        </div>
        <div className="navbar-end">
          {!isAuthenticated && (
            <Link
              to={"/login"}
              className="btn py-1.5 px-6 bg-red-500 text-white rounded-4xl"
            >
              Login
            </Link>
          )}
          {isAuthenticated && (
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-10 rounded-full">
                  <img
                    alt="Tailwind CSS Navbar component"
                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  />
                </div>
              </div>
              <ul
                tabIndex="-1"
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
              >
                <li>
                  <a className="justify-between">
                    Profile
                    <span className="badge">New</span>
                  </a>
                </li>
                {isCustomer && (
                  <li>
                    <Link to={"/dashboard/customer"}>Dashboard</Link>
                  </li>
                )}
                {isAdmin && (
                  <li>
                    <Link to={"/dashboard/admin"}>Admin Dashboard</Link>
                  </li>
                )}
                {isAgent && (
                  <li>
                    <Link to={"/dashboard/agent"}>Agent Dashboard</Link>
                  </li>
                )}
                <li>
                  <a onClick={handleLogout}>Logout</a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NavBar;
