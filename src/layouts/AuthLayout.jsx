import React from "react";
import { Outlet } from "react-router";
import authSvg from "../assets/login.svg";
import NavBar from "../components/common/NavBar";

const AuthLayout = () => {
  return (
    <>
      <NavBar />
      <div className="flex justify-center items-center min-h-screen">
        <div className="left min-h-full w-full md:w-500 lg:w-600 p-8">
          <Outlet />
        </div>
        <div className="right h-full w-full md:w-500 lg:w-600 hidden md:block">
          <img className="object-cover h-full w-full" src={authSvg} alt="" />
        </div>
      </div>
    </>
  );
};

export default AuthLayout;
