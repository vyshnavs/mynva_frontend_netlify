import { useEffect, useState, useContext } from "react";
import AdminLayout from "../../layouts/admin/AdminLayout";
import AddDeviceModal from "../../components/adminComp/deviceComp/AddDeviceModal";
import EditDeviceModal from "../../components/adminComp/deviceComp/EditDeviceModal";
import DeviceTable from "../../components/adminComp/deviceComp/DeviceTable";
import api from "../../api/connection";
import { ThemeContext } from "../../contexts/ThemeContext";

/**
 * DevicesPage
 * - Lists all devices
 * - Opens Add / Edit modals
 * - Receives credential events (create / regenerate)
 * - Triggers refresh after any sensitive action
 */
export default function DevicesPage() {
  const { theme } = useContext(ThemeContext);

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [editDevice, setEditDevice] = useState(null);

  /**
   * Fetch all devices
   */
  const fetchDevices = async () => {
    try {
      const res = await api.get("/admin/devices");
      setDevices(res.data.devices || []);
    } catch (err) {
      console.error("Failed to fetch devices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  /**
   * This callback is triggered AFTER:
   * - Device creation (AddDeviceModal)
   * - Secret regeneration (DeviceTable)
   *
   * It refreshes the list so UI always reflects latest state.
   */
  const handleSensitiveActionComplete = () => {
    fetchDevices();
  };

  return (
    <AdminLayout>
      <div className={theme === "dark" ? "text-gray-100" : "text-gray-900"}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Devices</h2>

          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700 transition"
          >
            + Add Device
          </button>
        </div>

        {/* Device Table */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <DeviceTable
            devices={devices}
            refresh={fetchDevices}
            setEditDevice={setEditDevice}
            onSecretAction={handleSensitiveActionComplete}
          />
        )}
      </div>

      {/* Add Device Modal */}
      {showAdd && (
        <AddDeviceModal
          close={() => setShowAdd(false)}
          refresh={fetchDevices}
          onCreated={handleSensitiveActionComplete}
        />
      )}

      {/* Edit Device Modal */}
      {editDevice && (
        <EditDeviceModal
          device={editDevice}
          close={() => setEditDevice(null)}
          refresh={fetchDevices}
        />
      )}
    </AdminLayout>
  );
}
