import { useContext, useEffect, useState, useRef } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";

import { disconnectSocket } from "../../api/websocket";
import { AuthContext } from "../../contexts/AuthContext";
import minvalogo from "../../assets/logo.png";

const HomeNavbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, loadUser } = useContext(AuthContext);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const mobileRef = useRef();
  const userDropRef = useRef();
  const navigate = useNavigate();

  // ✅ CENTRAL NAVIGATION LIST (easy to extend)
  const navLinks = [
    { label: "About", path: "/about" },
    { label: "New Connection", path: "/new-connection" },
    // add more routes here later
  ];

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
      if (userDropRef.current && !userDropRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout
  const handleLogout = () => {
    disconnectSocket();
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    loadUser();
    navigate("/");
  };

  // Dashboard redirect
  const goToDashboard = () => {
    if (!user) return;
    user.role === "admin"
      ? navigate("/admin/dashboard")
      : navigate("/dashboard");
  };

  return (
    <nav
      className={`w-full fixed top-0 left-0 z-50 backdrop-blur-md shadow-sm 
      h-16 px-6 flex items-center
      ${theme === "light" ? "bg-white/90" : "bg-gray-900/95"}`}
    >
      <div className="flex justify-between items-center w-full">
        {/* LOGO + BRAND */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src={minvalogo}
            alt="MYNVA"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover
             ring-2 ring-cyan-500/40 shadow-sm"
          />

          <h1
            className={`text-xl sm:text-2xl font-bold tracking-wide
            ${theme === "light" ? "text-gray-900" : "text-white"}`}
          >
            MYNVA
          </h1>
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-gray-800 dark:text-gray-100 hover:text-blue-500 transition"
            >
              {link.label}
            </Link>
          ))}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:scale-110 transition"
          >
            {theme === "light" ? (
              <MoonIcon className="h-5 w-5 text-gray-800" />
            ) : (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            )}
          </button>

          {/* USER DROPDOWN */}
          {user ? (
            <div className="relative" ref={userDropRef}>
              <button
                className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-400 transition"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                {user.name || user.email}
              </button>

              {userDropdownOpen && (
                <div
                  className={`absolute right-0 mt-2 rounded-lg p-3 w-44 space-y-3 shadow-lg border
                  ${
                    theme === "light"
                      ? "bg-white border-gray-200"
                      : "bg-gray-800 border-gray-700"
                  }`}
                >
                  <button
                    onClick={goToDashboard}
                    className="block w-full text-left font-medium text-gray-800 dark:text-gray-100 hover:text-blue-500"
                  >
                    {user.role === "admin" ? "Admin Dashboard" : "Dashboard"}
                  </button>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left font-medium text-red-600 dark:text-red-400 hover:opacity-80"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-green-400 
              text-white rounded-md shadow hover:opacity-90 transition"
            >
              Login
            </Link>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-gray-900 dark:text-white text-3xl"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          ☰
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {mobileOpen && (
        <div
          ref={mobileRef}
          className={`md:hidden absolute right-4 top-16 rounded-lg p-4 shadow-xl w-52 space-y-4
          ${theme === "light" ? "bg-white" : "bg-gray-800"}`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="block font-medium text-gray-800 dark:text-gray-100 hover:text-blue-500"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-full p-2 bg-gray-200 dark:bg-gray-700 rounded-md 
            flex items-center justify-center gap-2 text-gray-900 dark:text-gray-100"
          >
            {theme === "light" ? (
              <MoonIcon className="w-5 h-5 text-gray-800" />
            ) : (
              <SunIcon className="w-5 h-5 text-yellow-400" />
            )}
            <span>Toggle Theme</span>
          </button>

          {user ? (
            <>
              <button
                onClick={goToDashboard}
                className="block w-full bg-gradient-to-r from-blue-500 to-green-400 
                text-white py-2 rounded text-center"
              >
                {user.role === "admin" ? "Admin Dashboard" : "Dashboard"}
              </button>

              <button
                onClick={handleLogout}
                className="block w-full bg-red-600 text-white py-2 rounded text-center"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="block w-full bg-gradient-to-r from-blue-500 to-green-400 
              text-white py-2 rounded text-center"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default HomeNavbar;
