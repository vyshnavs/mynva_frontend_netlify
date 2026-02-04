import { useContext, useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ThemeContext } from "../../contexts/ThemeContext";
import { AuthContext } from "../../contexts/AuthContext";
import {
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import minvalogo from "../../assets/logo.png";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);
   const {loadUser } = useContext(AuthContext);

  const adminName = "Admin";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    loadUser();
    navigate("/admin/login");
  };

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setProfileOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target)
      ) {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = (
    <>
      <Link to="/" className="hover:text-blue-400">Home</Link>
      <Link to="/admin/dashboard" className="hover:text-blue-400">Dashboard</Link>
      <Link to="/admin/dashboard/devices" className="hover:text-blue-400">Devices</Link>
      <Link to="/admin/dashboard/modules" className="hover:text-blue-400">Modules</Link>
      <Link to="/admin/dashboard/users" className="hover:text-blue-400">Users</Link>
      <Link to="/admin/dashboard/analytics" className="hover:text-blue-400">Analytics</Link>
      <Link to="/admin/dashboard/alerts" className="hover:text-blue-400">Alerts</Link>
      <Link to="/admin/dashboard/applications" className="hover:text-blue-400">Applications</Link>
      <Link to="/admin/dashboard/gadgets" className="hover:text-blue-400">Gadgets</Link>
      <Link to="/admin/dashboard/billing" className="hover:text-blue-400">BillingPolicy</Link>
    </>
  );

  return (
    <nav
      className={`
        w-full px-6 py-4 flex justify-between items-center border-b shadow-md backdrop-blur
        ${theme === "light"
          ? "bg-white text-gray-900 border-gray-200"
          : "bg-gray-900 text-gray-100 border-gray-800"}
      `}
    >
      {/* LEFT — BRAND */}
      <div className="flex items-center gap-3">
        <img
          src={minvalogo}
          alt="MYNVA"
          className="w-10 h-10 rounded-md cursor-pointer"
          onClick={() => navigate("/admin/dashboard")}
        />

        <h1
          onClick={() => navigate("/admin/dashboard")}
          className="text-lg sm:text-xl font-bold cursor-pointer bg-gradient-to-r from-blue-500 to-green-400 text-transparent bg-clip-text"
        >
          MYNVA Admin
        </h1>
      </div>

      {/* CENTER — DESKTOP LINKS */}
      <div className="hidden md:flex items-center gap-6 text-sm font-medium">
        {navLinks}
      </div>

      {/* RIGHT — ACTIONS */}
      <div className="flex items-center gap-3 relative">
        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="md:hidden p-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>

        {/* THEME TOGGLE */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 border hover:scale-105 transition"
        >
          {theme === "light" ? (
            <MoonIcon className="h-5 w-5 text-gray-800" />
          ) : (
            <SunIcon className="h-5 w-5 text-yellow-400" />
          )}
        </button>

        {/* PROFILE */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <UserCircleIcon className="h-6 w-6" />
            <span className="hidden sm:block font-medium">{adminName}</span>
          </button>

          {profileOpen && (
            <div
              className={`
                absolute right-0 top-12 w-44 rounded-xl shadow-lg border p-2
                ${theme === "light"
                  ? "bg-white border-gray-200"
                  : "bg-gray-800 border-gray-700"}
              `}
            >
              <button
                onClick={logout}
                className={`
                  w-full px-4 py-2 text-left rounded-lg font-medium transition
                  ${theme === "light"
                    ? "text-red-600 hover:bg-red-50"
                    : "text-red-400 hover:bg-gray-700"}
                `}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className={`
            absolute top-full left-0 w-full z-40 md:hidden border-b shadow-lg
            ${theme === "light"
              ? "bg-white border-gray-200"
              : "bg-gray-900 border-gray-800"}
          `}
        >
          <div className="flex flex-col gap-3 px-6 py-4 text-sm font-medium">
            {navLinks}
          </div>
        </div>
      )}
    </nav>
  );
}
