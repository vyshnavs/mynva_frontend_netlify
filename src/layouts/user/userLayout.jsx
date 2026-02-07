// src/layouts/user/UserLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/userComp/Sidebar";
import Topbar from "../../components/userComp/Topbar";
import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import api from "../../api/connection";
import { initSocket, on, off } from "../../api/websocket";

export default function UserLayout() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Desktop collapsed state - persisted
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const raw = localStorage.getItem("sidebarCollapsed");
      return raw === "true";
    } catch {
      return false;
    }
  });

  // Active device state - persisted
  const [activeDeviceId, setActiveDeviceId] = useState(() => {
    try {
      return localStorage.getItem("activeDeviceId") || null;
    } catch {
      return null;
    }
  });

  // Centralized devices state
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(true);

  // ===============================
  // LOAD DEVICES (INITIAL)
  // ===============================
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await api.get("/user/device/list");
        if (mounted) {
          const deviceList = res.data.devices || [];
          setDevices(deviceList);

          const storedDeviceId = localStorage.getItem("activeDeviceId");
          if (storedDeviceId) {
            const exists = deviceList.some(
              (d) => String(d.deviceId) === String(storedDeviceId)
            );
            if (!exists && deviceList.length > 0) {
              setActiveDeviceId(deviceList[0].deviceId);
            }
          } else if (deviceList.length > 0 && !activeDeviceId) {
            setActiveDeviceId(deviceList[0].deviceId);
          }
        }
      } catch (err) {
        console.error("Failed to load devices", err);
      } finally {
        if (mounted) setDevicesLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ===============================
  // LIVE SOCKET UPDATES (STATUS + DATA)
  // ===============================
  useEffect(() => {
    const socket = initSocket();
    if (!socket) return;

    const handleDeviceUpdate = (update) => {
      setDevices((prev) =>
        prev.map((d) =>
          String(d.deviceId) === String(update.deviceId)
            ? {
                ...d,

                // 🔴 LIVE STATUS
                isOnline:
                  typeof update.isOnline === "boolean"
                    ? update.isOnline
                    : d.isOnline,
                lastSeenAt: update.lastSeenAt ?? d.lastSeenAt,

                // ⚡ LIVE DATA (energy, etc.)
                lastEnergyReading:
                  update.lastEnergyReading ?? d.lastEnergyReading,
              }
            : d
        )
      );
    };

    // New standard event
    on("device:status", handleDeviceUpdate);

    // Backward compatibility (current backend)
    on("device_update", handleDeviceUpdate);

    return () => {
      off("device:status", handleDeviceUpdate);
      off("device_update", handleDeviceUpdate);
    };
  }, []);

  // Persist collapsed state
  useEffect(() => {
    try {
      localStorage.setItem("sidebarCollapsed", collapsed ? "true" : "false");
    } catch {}
  }, [collapsed]);

  // Persist active device ID
  useEffect(() => {
    try {
      if (activeDeviceId) {
        localStorage.setItem("activeDeviceId", activeDeviceId);
      } else {
        localStorage.removeItem("activeDeviceId");
      }
    } catch {}
  }, [activeDeviceId]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  return (
    <div
      className={`flex h-screen ${
        isDark ? "bg-gray-950" : "bg-gray-50"
      } overflow-hidden`}
    >
      {/* Mobile overlay */}
      <div
        className={`
          fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden
          transition-opacity duration-300
          ${
            sidebarOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        sidebarOpen={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
        activeDeviceId={activeDeviceId}
        setActiveDeviceId={setActiveDeviceId}
        devices={devices}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          toggleSidebar={() => setSidebarOpen(true)}
          collapsed={collapsed}
          activeDeviceId={activeDeviceId}
          setActiveDeviceId={setActiveDeviceId}
          devices={devices}
        />

        {/* Mobile: Reduced top margin, Desktop: Standard */}
        <main className="mt-14 sm:mt-16 flex-1 overflow-auto transition-all duration-300">
          {/* Mobile: Reduced padding, Desktop: Standard */}
          <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
            <div
              className={`
                rounded-xl sm:rounded-2xl 
                p-4 sm:p-5 md:p-6 
                min-h-[calc(100vh-7rem)] sm:min-h-[calc(100vh-8rem)]
                ${
                  isDark
                    ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950"
                    : "bg-white"
                }
                shadow-lg sm:shadow-xl
              `}
            >
              <Outlet context={{ devices, setDevices, devicesLoading }} />
            </div>
          </div>
        </main>
      </div>

      {/* Global scrollbar styles */}
      <style>{`
        * {
          scrollbar-width: thin;
          scrollbar-color: ${
            isDark ? "#374151 transparent" : "#d1d5db transparent"
          };
        }

        *::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        /* Mobile: Thinner scrollbar */
        @media (max-width: 640px) {
          *::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
        }

        *::-webkit-scrollbar-track {
          background: transparent;
        }

        *::-webkit-scrollbar-thumb {
          background: ${isDark ? "#374151" : "#d1d5db"};
          border-radius: 4px;
        }

        *::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? "#4b5563" : "#9ca3af"};
        }

        /* Smooth scrolling on mobile */
        @media (max-width: 768px) {
          * {
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </div>
  );
}