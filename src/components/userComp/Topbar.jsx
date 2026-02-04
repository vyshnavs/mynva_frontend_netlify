import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState, useRef } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import {
  Bars3Icon,
  SunIcon,
  MoonIcon,
  BellIcon,
  ChevronDownIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";

import { getToken, decodeToken } from "../../utils/auth";
import { disconnectSocket } from "../../api/websocket";
import { AuthContext } from "../../contexts/AuthContext.jsx";

export default function Topbar({ toggleSidebar, collapsed, activeDeviceId, setActiveDeviceId, devices = [] }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const { user, loadUser } = useContext(AuthContext);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const profileRef = useRef();
  const deviceRef = useRef();


  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (deviceRef.current && !deviceRef.current.contains(e.target)) {
        setShowDeviceMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pageTitle =
    {
      "/dashboard": "Overview",
      "/dashboard/profile": "My Profile",
      "/dashboard/about": "About",
      "/dashboard/contact": "Contact",
      "/dashboard/support": "Support",
    }[pathname] || "Dashboard";

  const desktopLeft = collapsed ? "md:left-20" : "md:left-72";

  const getInitials = () => {
    if (!user) return "U";
    const name = user.name || user.email || "User";
    const parts = name.split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const handleDeviceChange = (deviceId) => {
    console.log("Changing device to:", deviceId);
    setActiveDeviceId(deviceId);
    setShowDeviceMenu(false);
    
    // If currently on a device-specific page, redirect to the same page type for the new device
    const devicePageMatch = pathname.match(/\/dashboard\/device\/[^/]+\/(.+)/);
    if (devicePageMatch) {
      const pageType = devicePageMatch[1];
      navigate(`/dashboard/device/${deviceId}/${pageType}`);
    }
  };

  // Find active device from devices array
  const activeDevice = devices.find(d => String(d.deviceId) === String(activeDeviceId));

  const handleLogout = () => {
    disconnectSocket();
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("activeDeviceId");
    loadUser();
    navigate("/");
  };

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 ${desktopLeft} h-16 z-40
        transition-all duration-300 border-b shadow-sm
        ${
          isDark
            ? "bg-gray-900/95 backdrop-blur-xl border-gray-800/50"
            : "bg-white/95 backdrop-blur-xl border-gray-200"
        }
      `}
    >
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className={`
              md:hidden p-2 rounded-xl transition
              ${
                isDark
                  ? "hover:bg-gray-800 text-gray-300"
                  : "hover:bg-gray-100 text-gray-700"
              }
            `}
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <h1
              className={`text-lg sm:text-xl font-bold ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* DEVICE SELECTOR */}
          {devices.length > 0 && (
            <div className="relative" ref={deviceRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeviceMenu((prev) => !prev);
                }}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-xl transition
                  ${
                    isDark
                      ? "hover:bg-gray-800 text-gray-300 border border-gray-700"
                      : "hover:bg-gray-100 text-gray-700 border border-gray-300"
                  }
                `}
              >
                <CpuChipIcon className="w-5 h-5" />
                {activeDevice ? (
                  <div className="hidden sm:block text-left">
                    <div className="font-medium text-sm">smat meter</div>
                    <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      ID: {activeDevice.deviceId}
                    </div>
                  </div>
                ) : (
                  <span className="hidden sm:block font-medium text-sm">
                    Select Device
                  </span>
                )}
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform ${
                    showDeviceMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showDeviceMenu && (
                <div
                  className={`
                    absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border overflow-hidden max-h-96 overflow-y-auto
                    ${
                      isDark
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }
                  `}
                  style={{ zIndex: 9999 }}
                >
                  {devices.map((device) => (
                    <button
                      type="button"
                      key={device.deviceId}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeviceChange(device.deviceId);
                      }}
                      className={`
                        w-full px-4 py-3 text-left transition cursor-pointer
                        ${
                          String(device.deviceId) === String(activeDeviceId)
                            ? isDark
                              ? "bg-green-600/30 text-green-300 border-l-4 border-green-500"
                              : "bg-green-100 text-green-800 border-l-4 border-green-600"
                            : isDark
                            ? "text-gray-200 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">smart meter</div>
                          <div className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            {device.deviceId}
                          </div>
                        </div>
                        {/* Status indicator in dropdown */}
                        <span className={`flex h-2 w-2 rounded-full ${device.isOnline ? "bg-green-500" : "bg-red-500"}`} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            className={`
              relative p-2 rounded-xl transition
              ${
                isDark
                  ? "hover:bg-gray-800 text-gray-400 hover:text-gray-200"
                  : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              }
            `}
          >
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
          </button>

          <button
            onClick={toggleTheme}
            className={`
              p-2 rounded-xl transition-all duration-200
              ${
                isDark
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                  : "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
              }
              hover:scale-105 shadow-lg
            `}
          >
            {isDark ? (
              <MoonIcon className="w-5 h-5" />
            ) : (
              <SunIcon className="w-5 h-5" />
            )}
          </button>

          {/* USER */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu((s) => !s)}
              className={`
                flex items-center gap-2 sm:gap-3 p-1 sm:pl-3 sm:pr-2 rounded-xl transition
                ${
                  isDark
                    ? "hover:bg-gray-800 text-gray-300"
                    : "hover:bg-gray-100 text-gray-700"
                }
              `}
            >
              <span className="hidden sm:block font-semibold">
                {user?.name || user?.email || "User"}
              </span>

              <div
                className={`
                  w-9 h-9 rounded-xl flex items-center justify-center font-semibold text-sm
                  ${
                    isDark
                      ? "bg-gradient-to-br from-green-600 to-emerald-600 text-white"
                      : "bg-gradient-to-br from-green-500 to-emerald-500 text-white"
                  }
                `}
              >
                {getInitials()}
              </div>

              <ChevronDownIcon
                className={`w-4 h-4 transition-transform ${
                  showProfileMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {showProfileMenu && (
              <div
                className={`
                  absolute right-0 mt-2 w-40 rounded-xl shadow-xl border overflow-hidden
                  ${
                    isDark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }
                `}
                style={{ zIndex: 9999 }}
              >
                <button
                  className="
                    w-full px-4 py-2 text-left text-sm
                    text-gray-700 dark:text-gray-200
                    hover:bg-gray-100 dark:hover:bg-gray-700
                  "
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/dashboard/profile");
                  }}
                >
                  Profile
                </button>

                <button
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}