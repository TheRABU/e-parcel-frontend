import { Outlet } from "react-router";
import NavBar from "../components/common/NavBar";

const RootLayout = () => {
  return (
    <>
      <div>
        <NavBar />
        <Outlet />
      </div>
    </>
  );
};

export default RootLayout;
