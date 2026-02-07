import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { NavLink, useParams, useOutletContext } from "react-router-dom";
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
    <div className="relative min-h-screen pb-20">
      {/* HEADER */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:mb-6">
        <h2 className={`text-xl sm:text-2xl font-bold ${bodyText}`}>
          Slave Cluster Modules
        </h2>

        <button
          onClick={() => setShowPairing(true)}
          disabled={!deviceOnline}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${
            deviceOnline
              ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          title={!deviceOnline ? "Main meter is offline" : ""}
        >
          + Add Module
        </button>
      </div>

      {/* OFFLINE WARNING */}
      {!deviceOnline && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
            <span className="text-base">⚠️</span>
            <span>Main meter is offline. Module actions are disabled.</span>
          </p>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className={`text-sm ${mutedText} py-8 text-center`}>
          Loading slave clusters…
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && modules.length === 0 && (
        <div className="py-12 text-center">
          <div className={`text-sm ${mutedText}`}>
            No slave clusters paired with this meter.
          </div>
        </div>
      )}

      {/* DESKTOP TABLE */}
      {!loading && modules.length > 0 && (
        <div
          className={`hidden md:block rounded-lg border overflow-hidden ${
            isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed text-sm">
              <thead
                className={
                  isDark
                    ? "bg-gray-800 text-gray-300"
                    : "bg-gray-100 text-gray-700"
                }
              >
                <tr>
                  <th className="px-4 py-3 w-1/4 text-left font-medium">
                    Module ID
                  </th>
                  <th className="px-4 py-3 w-1/6 text-left font-medium">
                    Capacity
                  </th>
                  <th className="px-4 py-3 w-1/4 text-left font-medium">
                    Location
                  </th>
                  <th className="px-4 py-3 w-1/4 text-left font-medium">
                    Paired At
                  </th>
                  <th className="px-4 py-3 w-1/6 text-right font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className={bodyText}>
                {modules.map((m) => (
                  <tr
                    key={m.moduleId}
                    className={
                      isDark
                        ? "border-t border-gray-800 hover:bg-gray-800/50"
                        : "border-t hover:bg-gray-50"
                    }
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
                        disabled={
                          !deviceOnline || unpairingId === m.moduleId
                        }
                        className={`px-3 py-1.5 text-xs rounded-lg text-white transition-colors ${
                          deviceOnline
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {unpairingId === m.moduleId ? "Unpairing..." : "Unpair"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MOBILE CARDS - OPTIMIZED */}
      {!loading && modules.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {modules.map((m) => (
            <div
              key={m.moduleId}
              className={`p-3.5 rounded-lg border ${
                isDark
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              {/* Module ID Header */}
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium ${mutedText} mb-1`}>
                    Module ID
                  </div>
                  <div
                    className={`font-mono text-xs break-all ${bodyText}`}
                  >
                    {m.moduleId}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div>
                  <div className={`text-xs ${mutedText} mb-0.5`}>
                    Capacity
                  </div>
                  <div className={`text-sm font-medium ${bodyText}`}>
                    {m.slaveCapacity}
                  </div>
                </div>

                <div>
                  <div className={`text-xs ${mutedText} mb-0.5`}>
                    Location
                  </div>
                  <div className={`text-sm font-medium ${bodyText}`}>
                    {m.location || "-"}
                  </div>
                </div>
              </div>

              {/* Paired Date */}
              <div className={`text-xs ${mutedText} mb-3`}>
                Paired: {new Date(m.pairedAt).toLocaleString()}
              </div>

              {/* Action Button */}
              <button
                onClick={() => unpairModule(m.moduleId)}
                disabled={!deviceOnline || unpairingId === m.moduleId}
                className={`w-full py-2.5 text-sm font-medium rounded-lg text-white transition-colors ${
                  deviceOnline
                    ? "bg-red-600 active:bg-red-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {unpairingId === m.moduleId ? "Unpairing..." : "Unpair Module"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* PAIRING MODAL */}
      {showPairing && deviceOnline && (
        <ModulePairingModal
          deviceId={deviceId}
          close={() => setShowPairing(false)}
          onPaired={loadModules}
        />
      )}

      {/* BOTTOM LINK - FIXED POSITION */}
      <NavLink
        to={`/dashboard/device/${deviceId}/module-units`}
        className={`fixed bottom-4 left-4 right-4 sm:absolute sm:left-4 sm:right-auto px-4 py-2.5 sm:px-0 sm:py-0 text-center sm:text-left text-sm font-medium rounded-lg sm:rounded-none transition-colors ${
          isDark
            ? "bg-blue-900/50 sm:bg-transparent text-blue-400 hover:text-blue-300 hover:bg-blue-900/70 sm:hover:bg-transparent"
            : "bg-blue-50 sm:bg-transparent text-blue-600 hover:text-blue-700 hover:bg-blue-100 sm:hover:bg-transparent"
        }`}
      >
        Customize module units
      </NavLink>
    </div>
  );
}