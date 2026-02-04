import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import {  NavLink,useParams, useOutletContext } from "react-router-dom";
import api from "../../api/connection";
import ModulePairingModal from "../../components/userComp/ModulePairingModal";


export default function ModuleManagementPage() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const { deviceId } = useParams();

  // ✅ Get devices from UserLayout (NO re-fetch)
  const { devices } = useOutletContext();

  const activeDevice = devices.find(
    (d) => String(d.deviceId) === String(deviceId),
  );

  const deviceOnline = !!activeDevice?.isOnline;

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPairing, setShowPairing] = useState(false);
  const [unpairingId, setUnpairingId] = useState(null);

  const loadModules = async () => {
    if (!deviceId) return;
    setLoading(true);
    try {
      const res = await api.get(`/user/modules?deviceId=${deviceId}`);
      setModules(res.data.modules || []);
    } catch (err) {
      console.error("Failed to load modules", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, [deviceId]);

  const unpairModule = async (moduleId) => {
    if (!deviceOnline) return;

    if (!window.confirm(`Unpair module ${moduleId}?`)) return;
    try {
      setUnpairingId(moduleId);
      await api.delete(`/user/modules/${moduleId}`);
      await loadModules();
    } finally {
      setUnpairingId(null);
    }
  };

  const bodyText = isDark ? "text-gray-100" : "text-gray-900";
  const mutedText = isDark ? "text-gray-400" : "text-gray-600";

  return (
    <div className="relative space-y-6 pb-14">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className={`text-2xl font-bold ${bodyText}`}>
          Slave Cluster Modules
        </h2>

        <button
          onClick={() => setShowPairing(true)}
          disabled={!deviceOnline}
          className={`px-5 py-2 rounded-xl text-white ${
            deviceOnline
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          title={!deviceOnline ? "Main meter is offline" : ""}
        >
          + Add Module
        </button>
      </div>

      {!deviceOnline && (
        <div className="text-sm text-red-500">
          ⚠️ Main meter is offline. Module actions are disabled.
        </div>
      )}

      {loading && <div className={mutedText}>Loading slave clusters…</div>}

      {!loading && modules.length === 0 && (
        <div className={mutedText}>
          No slave clusters paired with this meter.
        </div>
      )}

      {/* DESKTOP TABLE */}
      {!loading && modules.length > 0 && (
        <div
          className={`hidden md:block rounded-xl border overflow-x-auto ${
            isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <table className="min-w-full table-fixed text-sm">
            <thead
              className={
                isDark
                  ? "bg-gray-800 text-gray-300"
                  : "bg-gray-100 text-gray-700"
              }
            >
              <tr>
                <th className="px-4 py-3 w-1/4 text-left">Module ID</th>
                <th className="px-4 py-3 w-1/6 text-left">Capacity</th>
                <th className="px-4 py-3 w-1/4 text-left">Location</th>
                <th className="px-4 py-3 w-1/4 text-left">Paired At</th>
                <th className="px-4 py-3 w-1/6 text-right">Action</th>
              </tr>
            </thead>

            <tbody className={bodyText}>
              {modules.map((m) => (
                <tr
                  key={m.moduleId}
                  className={isDark ? "border-t border-gray-800" : "border-t"}
                >
                  <td className="px-4 py-3 font-mono text-xs break-all">
                    {m.moduleId}
                  </td>

                  <td className="px-4 py-3">{m.slaveCapacity}</td>

                  <td className={`px-4 py-3 text-sm ${mutedText}`}>
                    {m.location || "-"}
                  </td>

                  <td className={`px-4 py-3 text-xs ${mutedText}`}>
                    {new Date(m.pairedAt).toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => unpairModule(m.moduleId)}
                      disabled={!deviceOnline || unpairingId === m.moduleId}
                      className={`px-3 py-1.5 text-xs rounded-lg text-white ${
                        deviceOnline
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Unpair
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MOBILE CARDS */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {modules.map((m) => (
          <div
            key={m.moduleId}
            className={`p-4 rounded-xl border ${
              isDark
                ? "bg-gray-900 border-gray-700 text-gray-100"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            <div className="font-mono text-xs break-all">{m.moduleId}</div>

            <div className={`text-sm mt-1 ${mutedText}`}>
              Capacity: {m.slaveCapacity}
            </div>

            <div className={`text-xs mt-1 ${mutedText}`}>
              {new Date(m.pairedAt).toLocaleString()}
            </div>

            <button
              onClick={() => unpairModule(m.moduleId)}
              disabled={!deviceOnline}
              className={`w-full mt-3 py-2 text-sm rounded-lg text-white ${
                deviceOnline ? "bg-red-600" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Unpair
            </button>
          </div>
        ))}
      </div>

      {showPairing && deviceOnline && (
        <ModulePairingModal
          deviceId={deviceId}
          close={() => setShowPairing(false)}
          onPaired={loadModules}
        />
      )}
      <NavLink
  to={`/dashboard/device/${deviceId}/module-units`}
  className={`absolute bottom-4 left-4 text-sm font-medium ${
    isDark
      ? "text-blue-400 hover:text-blue-300"
      : "text-blue-600 hover:text-blue-700"
  }`}
>
  Customize module units
</NavLink>

    </div>
  );
}
