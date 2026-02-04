// router/adminRoutes/AdminRoutes.jsx
import { Route } from "react-router-dom";
import AdminRouteWrapper from "./AdminRouteWrapper";

import AdminDashboard from "../../pages/adminPages/AdminDashboard";
import DevicesPage from "../../pages/adminPages/DevicesPage";
import AlertsPage from "../../pages/adminPages/AlertsPage";
import AnalyticsPage from "../../pages/adminPages/AnalyticsPage";
import ModulesPage from "../../pages/adminPages/ModulesPage";
import ApplicationsPage from "../../pages/adminPages/ApplicationsPage";
import UsersPage from "../../pages/adminPages/AdminUsersPage";
import GadgetsPage from "../../pages/adminPages/GadgetsPage";
import BillingPolicyPage from "../../pages/adminPages/BillingPolicyPage"

export default function AdminRoutes() {
  return (
    <>
      <Route
        path="/admin/dashboard"
        element={
          <AdminRouteWrapper>
            <AdminDashboard />
          </AdminRouteWrapper>
        }
      />

      <Route
        path="/admin/dashboard/devices"
        element={
          <AdminRouteWrapper>
            <DevicesPage />
          </AdminRouteWrapper>
        }
      />

      <Route
        path="/admin/dashboard/users"
        element={
          <AdminRouteWrapper>
            <UsersPage />
          </AdminRouteWrapper>
        }
      />

      <Route
        path="/admin/dashboard/alerts"
        element={
          <AdminRouteWrapper>
            <AlertsPage />
          </AdminRouteWrapper>
        }
      />

      <Route
        path="/admin/dashboard/analytics"
        element={
          <AdminRouteWrapper>
            <AnalyticsPage />
          </AdminRouteWrapper>
        }
      />
      <Route
        path="/admin/dashboard/modules"
        element={
          <AdminRouteWrapper>
            <ModulesPage />
          </AdminRouteWrapper>
        }
      />
      <Route
        path="/admin/dashboard/gadgets"
        element={
          <AdminRouteWrapper>
            <GadgetsPage />
          </AdminRouteWrapper>
        }
      />
      <Route
        path="/admin/dashboard/applications"
        element={
          <AdminRouteWrapper>
            <ApplicationsPage />
          </AdminRouteWrapper>
        }
      />
      <Route
        path="/admin/dashboard/billing"
        element={
          <AdminRouteWrapper>
            <BillingPolicyPage/>
          </AdminRouteWrapper>
        }
      />
    </>
  );
}
