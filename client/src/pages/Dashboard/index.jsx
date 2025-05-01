import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
function Dashboard() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default Dashboard;
