import { Outlet } from "react-router";
import NavBar from "../components/common/NavBar";
import SideBar from "../components/SideBar";

const DashboardLayout = () => {
  return (
    <>
      <div>
        <NavBar />
        <div className="md:flex justify-center items-center">
          <div className="w-2/6">
            <SideBar />
          </div>
          <div className="w-4/6 min-h-screen">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
