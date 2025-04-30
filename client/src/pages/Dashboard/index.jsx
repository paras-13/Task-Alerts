import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/sidebar";

function Dashboard() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default Dashboard;
