import { Outlet } from "react-router";
import NavBar from "../components/common/NavBar";
import SideBar from "../components/SideBar";

const DashboardLayout = () => {
  return (
    <>
      <div>
        <NavBar />
        <div className="md:flex justify-center items-start h-full">
          <div className="w-2/6 h-auto">
            <SideBar />
          </div>
          <div className="w-4/6">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
