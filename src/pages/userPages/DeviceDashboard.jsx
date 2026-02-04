import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/connection";
import { on, off, join, leave } from "../../api/websocket"; 

export default function DeviceDashboard() {
  const { deviceId } = useParams();
  const navigate = useNavigate();

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);

  // ===============================
  // 1. INITIAL DEVICE LOAD
  // ===============================
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/user/device/list");
        const found = res.data.devices.find(
          (d) => String(d.deviceId) === String(deviceId)
        );
        setDevice(found || null);
      } catch (err) {
        console.error("Initial load error:", err);
      }
      setLoading(false);
    }
    load();
  }, [deviceId]);

  // ===============================
  // 2. WEBSOCKET LIVE UPDATES (USING SHARED SOCKET)
  // ===============================
  useEffect(() => {
    function handleDeviceUpdate(update) {
      if (String(update.deviceId) !== String(deviceId)) return;
      setDevice((prev) => ({ ...prev, ...update }));
    }

    // join device-specific room (recommended)
    join(`device:${deviceId}`);

    // listen for updates
    on("device_update", handleDeviceUpdate);

    return () => {
      off("device_update", handleDeviceUpdate);
      leave(`device:${deviceId}`);
    };
  }, [deviceId]);

  // ===============================
  // Remove Device
  // ===============================
  async function handleRemove() {
  if (!window.confirm("Are you sure you want to remove this device?")) return;

  setRemoving(true);
  try {
    await api.delete(`/user/device/${deviceId}`);
    alert("Device removed successfully.");

    // 🔄 Refresh page to update sidebar device list
    window.location.href = "/dashboard";
  } catch (err) {
    alert(err.response?.data?.error || "Failed to remove device.");
  }
  setRemoving(false);
}

  // ===============================
  // UI
  // ===============================
  if (loading) return <div className="p-6">Loading device...</div>;
  if (!device)
    return (
      <div className="p-6 text-red-600 dark:text-red-400 font-semibold">
        Device not found.
      </div>
    );

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">

      {/* ================= HEADER ================= */}
      <div className="space-y-1">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          {device.meterName || `Meter ${device.deviceId}`}
        </h2>

        <p className="text-gray-600 dark:text-gray-400">
          Device ID: {device.deviceId}
        </p>
      </div>

      {/* ================= INFO GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* ONLINE STATUS CARD */}
        <div className="rounded-xl shadow-md p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Online Status
          </h3>
          <div
            className={`text-2xl font-bold ${
              device.isOnline ? "text-green-500" : "text-red-500"
            }`}
          >
            {device.isOnline ? "Online" : "Offline"}
          </div>
        </div>

        {/* POWER USAGE CARD */}
        <div className="rounded-xl shadow-md p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Latest Power Usage
          </h3>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {device.lastEnergyReading != null
              ? `${device.lastEnergyReading} W`
              : "No data"}
          </div>
        </div>
      </div>

      {/* ================= ADDITIONAL INFO TABLE ================= */}
      <div className="rounded-xl shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full text-sm">
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">

            <tr>
              <td className="p-4 font-semibold text-gray-700 dark:text-gray-300">
                Location
              </td>
              <td className="p-4 text-gray-900 dark:text-white">
                {device.location || "—"}
              </td>
            </tr>

            <tr>
              <td className="p-4 font-semibold text-gray-700 dark:text-gray-300">
                Serial Number
              </td>
              <td className="p-4 text-gray-900 dark:text-white">
                {device.meterSerialNumber || "—"}
              </td>
            </tr>

            <tr>
              <td className="p-4 font-semibold text-gray-700 dark:text-gray-300">
                Remarks
              </td>
              <td className="p-4 text-gray-900 dark:text-white">
                {device.remarks || "None"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ================= REMOVE BUTTON ================= */}
      <div className="flex justify-end">
        <button
          onClick={handleRemove}
          disabled={removing}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition disabled:bg-red-300"
        >
          {removing ? "Removing..." : "Remove Device"}
        </button>
      </div>
    </div>
  );
}
