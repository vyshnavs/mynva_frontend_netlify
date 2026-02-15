// src/routes/UserRoutes.jsx
import { Route } from "react-router-dom";
import UserRouteWrapper from "./UserRouteWrapper";
import UserLayout from "../../layouts/user/userLayout";

// Main Pages
import UserOverview from "../../pages/userPages/UserOverview";
import UserProfile from "../../pages/userPages/UserProfile";
import AboutPage from "../../pages/publicPages/AboutPage";
import ContactPage from "../../pages/userPages/ContactPage";
import SupportPage from "../../pages/userPages/SupportPage";

// Device-Specific Pages
import UsageAnalytics from "../../pages/userPages/UsageAnalytics";
import PrepaidSystem from "../../pages/userPages/PrepaidSystem";
import AISuggestions from "../../pages/userPages/AISuggestions";
import TelemetryLive from "../../pages/userPages/TelemetryLive";
import FaultManagement from "../../pages/userPages/FaultManagement";
import RelayControl from "../../pages/userPages/RelayControl";

// Device Management Pages
import AddDevicePage from "../../pages/userPages/AddDevicePage";
import DeviceDashboard from "../../pages/userPages/DeviceDashboard";
import ModuleManagementPage from "../../pages/userPages/ModuleManagementPage";
import ModuleUnitMagnagementPage from "../../pages/userPages/ModuleUnitManagementPage"


export default function UserRoutes() {
  return (
    <>
      <Route
        path="/dashboard"
        element={
          <UserRouteWrapper>
            <UserLayout />
          </UserRouteWrapper>
        }
      >
        {/* Main Dashboard */}
        <Route index element={<UserOverview />} />
        
        {/* User Profile */}
        <Route path="profile" element={<UserProfile />} />
        
        {/* Secondary Pages */}
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="support" element={<SupportPage />} />
        
        {/* Device Management */}
        <Route path="add-device" element={<AddDevicePage />} />
        <Route path="device/:deviceId" element={<DeviceDashboard />} />
        
        {/* Device-Specific Pages (with deviceId parameter) */}
        <Route path="device/:deviceId/analytics" element={<UsageAnalytics />} />
        <Route path="device/:deviceId/modules" element={<ModuleManagementPage />} />
        <Route path="device/:deviceId/module-units" element={<ModuleUnitMagnagementPage />} />
        <Route path="device/:deviceId/live-monitor" element={<TelemetryLive/>} />
        <Route path="device/:deviceId/prepaid" element={<PrepaidSystem />} />
        <Route path="device/:deviceId/faults" element={<FaultManagement />} />
        <Route path="device/:deviceId/relay-control" element={<RelayControl />} />
        <Route path="device/:deviceId/ai" element={<AISuggestions />} />
      </Route>
    </>
  );
}