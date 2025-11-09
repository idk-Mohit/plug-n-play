import React from "react";
import DashboardLayout from "./DashboardLayout";

export default function Dashboard({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
