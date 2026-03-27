import React from "react";
import { Outlet } from "react-router";

export function AdminLayout() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#0A0A14]">
      <Outlet />
    </div>
  );
}
