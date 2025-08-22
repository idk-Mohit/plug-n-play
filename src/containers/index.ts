import { lazy } from "react";

// views/index.ts
export const DashboardView = lazy(
  () => import("@/containers/dashboard/Dashboard")
);
export const DatasetsView = lazy(
  () => import("@/containers/datasets/Datasets")
);
export const VisualsView = lazy(
  () => import("@/containers/visualizations/Visuals")
);
export const ActivityView = lazy(
  () => import("@/containers/activity/Activity")
);
export const HomeView = lazy(() => import("@/containers/home/Home"));
