import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/connection";
import { ThemeContext } from "../../contexts/ThemeContext";

export default function AddDevicePage() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const [deviceId, setDeviceId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // ----------------------------------------------------
  // Pair Device
  // ----------------------------------------------------
  const pairDevice = async () => {
    setMessage(null);

    // Basic validation
    if (!deviceId.trim() || !secretKey.trim()) {
      setMessage({
        type: "error",
        text: "Please enter both Device ID and Secret Key.",
      });
      return;
    }

    // Device ID must be numeric
    if (!/^\d+$/.test(deviceId)) {
      setMessage({
        type: "error",
        text: "Device ID must contain only numbers.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/user/device/pair", {
        deviceId: deviceId.trim(),
        secretKey: secretKey.trim(),
      });

      setMessage({
        type: "success",
        text: res.data.message || "Device paired successfully.",
      });

      // Force full page reload to refresh device list
      setTimeout(() => {
        window.location.replace("/dashboard");
      }, 900);

      // Redirect after short delay
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 900);
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.error ||
          "Failed to pair device. Please check the credentials.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <div
        className={`p-6 rounded-xl shadow-lg border transition-colors
          ${
            isDark
              ? "bg-gray-900 border-gray-800 text-gray-100"
              : "bg-white border-gray-200 text-gray-900"
          }`}
      >
        <h2 className="text-2xl font-bold mb-6">Pair New Device</h2>

        {/* Device ID */}
        <label className="block text-sm mb-1">Device ID</label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className={`w-full mb-4 px-4 py-2 rounded-lg border focus:outline-none focus:ring
            ${
              isDark
                ? "bg-gray-800 border-gray-700 focus:ring-green-600"
                : "bg-white border-gray-300 focus:ring-green-500"
            }`}
          placeholder="e.g. 34819244"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
        />

        {/* Secret Key */}
        <label className="block text-sm mb-1">Secret Key</label>
        <input
          type="password"
          autoComplete="off"
          className={`w-full mb-4 px-4 py-2 rounded-lg border focus:outline-none focus:ring
            ${
              isDark
                ? "bg-gray-800 border-gray-700 focus:ring-green-600"
                : "bg-white border-gray-300 focus:ring-green-500"
            }`}
          placeholder="Enter secret key"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
        />

        {/* Submit */}
        <button
          onClick={pairDevice}
          disabled={loading}
          className={`w-full py-2 rounded-lg font-semibold transition
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
        >
          {loading ? "Pairing..." : "Pair Device"}
        </button>

        {/* Message */}
        {message && (
          <p
            className={`mt-4 text-center text-sm font-medium
              ${message.type === "error" ? "text-red-500" : "text-green-500"}`}
          >
            {message.text}
          </p>
        )}

        {/* Info */}
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          Pairing requires the Device ID and Secret Key provided by the admin.
          If the key was regenerated, use the latest one.
        </p>
      </div>
    </div>
  );
}
