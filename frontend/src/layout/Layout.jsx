import React from "react";
import Navbar from "../components/Navbar"; 
import Footer from "../components/Footer"
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div>
      <Navbar />
      <main className={`pt-10 white mb-0`}>
        <Outlet />
      </main>
      <Footer classNames={'lg:block hidden mt-20'}/>
    </div>
  );
};

export default Layout;
