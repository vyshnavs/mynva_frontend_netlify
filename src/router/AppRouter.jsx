// router/AppRouter.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import PublicLayout from "../layouts/publicLayout";

import HomePage from "../pages/publicPages/HomePage";
import UserLoginPage from "../pages/publicPages/userLoginPage";
import UserForgotPasswordPage from "../pages/publicPages/userForgotPasswordPage";
import AdminLoginPage from "../pages/publicPages/adminLoginPage";
import NewConnectionApplication from "../pages/publicPages/NewConnectionApplication";
import AboutPage from "../pages/publicPages/AboutPage";

import UserRoutes from "./userRoutes/UserRoutes";
import AdminRoutes from "./adminRoutes/AdminRoutes";

export default function AppRouter() {
  return (
    <Router>
      <Routes>

        {/* ✅ Public Layout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<UserLoginPage />} />
          <Route path="/forgot-password" element={<UserForgotPasswordPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/new-connection" element={<NewConnectionApplication />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        {/* User Dashboard Routes */}
        {UserRoutes()}

        {/* Admin Dashboard Routes */}
        {AdminRoutes()}

      </Routes>
    </Router>
  );
}
