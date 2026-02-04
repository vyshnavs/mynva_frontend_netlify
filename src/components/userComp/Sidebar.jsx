import { useContext, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { ThemeContext } from "../../contexts/ThemeContext";

import {
  HomeIcon,
  ChartBarIcon,
  CpuChipIcon,
  CreditCardIcon,
  LightBulbIcon,
  InformationCircleIcon,
  PhoneIcon,
  LifebuoyIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar({
  collapsed,
  setCollapsed,
  sidebarOpen,
  closeSidebar,
  activeDeviceId,
  devices = [], // Receive devices from UserLayout
}) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  // ===============================
  // GET ACTIVE DEVICE STATUS FROM CENTRALIZED DATA
  // ===============================
  const activeDevice = useMemo(() => {
    return devices.find((d) => String(d.deviceId) === String(activeDeviceId));
  }, [devices, activeDeviceId]);

  const deviceStatus = activeDevice?.isOnline ? "online" : "offline";

  // ===============================
  // MENUS
  // ===============================
  const devicePages = [
    { name: "Usage Analytics", path: "analytics", icon: ChartBarIcon },
    { name: "Module Management", path: "modules", icon: CpuChipIcon },
    { name: "Live monitoring", path: "live-monitor", icon: CpuChipIcon },
    { name: "Prepaid System", path: "prepaid", icon: CreditCardIcon },
    { name: "AI Suggestions", path: "ai", icon: LightBulbIcon },
    { name: "Fault Management", path: "faults", icon: HomeIcon },
  ];

  const secondaryMenu = [
    { name: "About", path: "/dashboard/about", icon: InformationCircleIcon },
    { name: "Contact", path: "/dashboard/contact", icon: PhoneIcon },
    { name: "Support", path: "/dashboard/support", icon: LifebuoyIcon },
  ];

  // ===============================
  // THEME CLASSES
  // ===============================
  const sidebarBg = isDark
    ? "bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950"
    : "bg-gradient-to-b from-white via-gray-50 to-gray-100";

  const borderColor = isDark ? "border-gray-800/60" : "border-gray-200";
  const textPrimary = isDark ? "text-gray-100" : "text-gray-900";
  const textMuted = isDark ? "text-gray-400" : "text-gray-600";
  const hoverBg = isDark ? "hover:bg-gray-800" : "hover:bg-gray-200";
  const activeBg = "bg-gradient-to-r from-green-600 to-emerald-600 text-white";

  // ===============================
  // UI
  // ===============================
  return (
    <aside
      className={`
        fixed md:static z-50 top-0 left-0 h-screen md:h-full
        transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${collapsed ? "w-20" : "w-72"}
        ${sidebarBg} ${borderColor} border-r
        flex flex-col shadow-2xl md:shadow-none
        ${!sidebarOpen ? "pointer-events-none md:pointer-events-auto" : ""}
      `}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ================= HEADER ================= */}
      <div
        className={`${borderColor} border-b px-4 py-5 flex items-center justify-between`}
      >
        {!collapsed ? (
          <div>
            <div className={`text-lg font-bold ${textPrimary}`}>MYNVA</div>
            <div className={`text-xs ${textMuted}`}>Smart Monitoring</div>
          </div>
        ) : (
          <div
            className={`
              w-10 h-10 mx-auto rounded-xl
              bg-gradient-to-br from-green-500 to-emerald-600
              flex items-center justify-center
            `}
          >
            <span className="text-white font-bold text-lg">M</span>
          </div>
        )}

        <button
          onClick={() => setCollapsed((s) => !s)}
          className={`
            hidden md:flex items-center justify-center
            w-8 h-8 rounded-lg transition-colors
            ${
              isDark
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }
            ${collapsed ? "absolute -right-4 top-6" : ""}
          `}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        {/* ACTIVE DEVICE INFO */}
        {activeDeviceId && activeDevice && !collapsed && (
          <div
            className={`
            px-4 py-3 rounded-xl border
            ${
              isDark
                ? "bg-green-600/10 border-green-600/30 text-green-400"
                : "bg-green-50 border-green-200 text-green-700"
            }
          `}
          >
            <div className="flex items-center gap-2 mb-1">
              <CpuChipIcon className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Active Device
              </span>

              {/* STATUS DOT */}
              <div className="ml-auto flex items-center gap-1.5">
                <span className={`relative flex h-2.5 w-2.5`}>
                  {deviceStatus === "online" && (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </>
                  )}
                  {deviceStatus === "offline" && (
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  )}
                </span>
                <span
                  className={`text-xs font-medium ${
                    deviceStatus === "online"
                      ? isDark
                        ? "text-green-400"
                        : "text-green-600"
                      : isDark
                      ? "text-red-400"
                      : "text-red-600"
                  }`}
                >
                  {deviceStatus === "online"
                    ? "Online"
                    : activeDevice?.lastSeenAt
                    ? `Last seen ${new Date(
                        activeDevice.lastSeenAt
                      ).toLocaleString()}`
                    : "Offline"}
                </span>
              </div>
            </div>
            <div
              className={`text-sm font-medium ${
                isDark ? "text-green-300" : "text-green-800"
              }`}
            >
              ID: {activeDeviceId}
            </div>
          </div>
        )}

        {/* COLLAPSED STATUS INDICATOR */}
        {activeDeviceId && activeDevice && collapsed && (
          <div className="flex justify-center">
            <div
              title={
                deviceStatus === "offline" && activeDevice?.lastSeenAt
                  ? `Last seen: ${new Date(
                      activeDevice.lastSeenAt
                    ).toLocaleString()}`
                  : deviceStatus === "online"
                  ? "Online"
                  : "Offline"
              }
              className={`relative flex h-3 w-3`}
            >
              {deviceStatus === "online" && (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </>
              )}
              {deviceStatus === "offline" && (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              )}
            </div>
          </div>
        )}

        {/* HOME */}
        <NavLink
          to="/"
          onClick={() => closeSidebar?.()}
          className={({ isActive }) =>
            `
      flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
      ${isActive ? activeBg : `${textPrimary} ${hoverBg}`}
    `
          }
        >
          <HomeIcon className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Home</span>}
        </NavLink>

        {/* OVERVIEW */}
        <NavLink
          to="/dashboard"
          end
          onClick={() => closeSidebar?.()}
          className={({ isActive }) =>
            `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
              ${isActive ? activeBg : `${textPrimary} ${hoverBg}`}
            `
          }
        >
          <HomeIcon className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Overview</span>}
        </NavLink>

        {/* DEVICE-DEPENDENT PAGES */}
        <nav className="space-y-1">
          {devicePages.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={name}
              to={
                activeDeviceId
                  ? `/dashboard/device/${activeDeviceId}/${path}`
                  : "#"
              }
              onClick={(e) => {
                if (!activeDeviceId) {
                  e.preventDefault();
                  return;
                }
                closeSidebar?.();
              }}
              className={({ isActive }) =>
                `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                  ${isActive ? activeBg : `${textPrimary} ${hoverBg}`}
                  ${!activeDeviceId ? "opacity-50 cursor-not-allowed" : ""}
                `
              }
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span className="font-medium">{name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* SECONDARY */}
        <nav className="space-y-1 pt-4 border-t border-dashed border-gray-300/30 dark:border-gray-700/50">
          {secondaryMenu.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={name}
              to={path}
              onClick={() => closeSidebar?.()}
              className={({ isActive }) =>
                `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                  ${isActive ? activeBg : `${textPrimary} ${hoverBg}`}
                `
              }
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span className="font-medium">{name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* ================= SCROLLBAR ================= */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDark ? "#4b5563" : "#9ca3af"};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? "#6b7280" : "#6b7280"};
        }
      `}</style>
    </aside>
  );
}
