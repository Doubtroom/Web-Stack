import React from "react";
import Navbar from "../components/Navbar"; 
import Footer from "../components/Footer"
import { Outlet } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 pt-10 pb-20">
        <Outlet />
      </main>
      <Footer classNames={'lg:block hidden'}/>
    </div>
  );
};

export default Layout;
