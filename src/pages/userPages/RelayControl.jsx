import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useParams, useOutletContext } from "react-router-dom";
import api from "../../api/connection";
import { on, off } from "../../api/websocket";

export default function RelayControlPage() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const { deviceId } = useParams();
  const { devices } = useOutletContext();

  const activeDevice = devices.find(
    (d) => String(d.deviceId) === String(deviceId)
  );

  const [mainRelay, setMainRelay] = useState({
    state: false,
    loading: false,
    pending: false,
  });

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = "error") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const loadRelayData = async () => {
    if (!deviceId) return;
    setLoading(true);

    try {
      const [mainRes, modulesRes] = await Promise.all([
        api.get(`/user/relay/main/${deviceId}`),
        api.get(`/user/modules?deviceId=${deviceId}`),
      ]);

      setMainRelay((prev) => ({
        ...prev,
        state: mainRes.data.relayState,
      }));

      const modulesData = await Promise.all(
        (modulesRes.data.modules || []).map(async (module) => {
          try {
            const unitsRes = await api.get(
              `/user/module-units?moduleId=${module._id}`
            );
            return {
              ...module,
              units: unitsRes.data.units || [],
            };
          } catch {
            return { ...module, units: [] };
          }
        })
      );

      setModules(modulesData);
    } catch (err) {
      console.error("Failed to load relay data", err);
      showAlert("Failed to load relay data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRelayData();

    const handleAck = (data) => {
      if (String(data.deviceId) !== String(deviceId)) return;

      if (data.status === "SUCCESS") {
        if (data.command === "relay_on" || data.command === "relay_off") {
          setMainRelay({
            state: data.relayState,
            loading: false,
            pending: false,
          });
          showAlert(`Main meter relay turned ${data.relayState ? "ON" : "OFF"}`, "success");
        } else if (data.command === "module_relay_ack") {
          setModules((prev) =>
            prev.map((mod) =>
              mod.moduleId === data.moduleId
                ? {
                    ...mod,
                    units: mod.units.map((u) =>
                      u.unitNumber === data.unitNumber
                        ? { ...u, relayStatus: data.relayState, loading: false }
                        : u
                    ),
                  }
                : mod
            )
          );
          showAlert(
            `Unit ${data.unitNumber} relay turned ${data.relayState ? "ON" : "OFF"}`,
            "success"
          );
        }
      } else if (data.status === "FAILED") {
        setMainRelay((prev) => ({ ...prev, loading: false, pending: false }));
        showAlert(data.message || "Relay control failed", "error");
      }
    };

    on("device:command_ack", handleAck);
    return () => off("device:command_ack", handleAck);
  }, [deviceId]);

  const toggleMainRelay = async () => {
    if (!activeDevice?.isOnline) {
      showAlert("Device is offline");
      return;
    }

    if (activeDevice?.isLocked) {
      showAlert("Device is locked due to insufficient balance");
      return;
    }

    const newState = !mainRelay.state;
    setMainRelay({ ...mainRelay, loading: true, pending: true });

    try {
      await api.post(`/user/relay/main/${deviceId}`, { state: newState });
    } catch (err) {
      setMainRelay({ ...mainRelay, loading: false, pending: false });
      showAlert(err.response?.data?.error || "Failed to toggle relay");
    }
  };

  const toggleUnitRelay = async (unitId, currentState, moduleIndex, unitIndex) => {
    const newState = !currentState;

    setModules((prev) =>
      prev.map((mod, mIdx) =>
        mIdx === moduleIndex
          ? {
              ...mod,
              units: mod.units.map((u, uIdx) =>
                uIdx === unitIndex ? { ...u, loading: true } : u
              ),
            }
          : mod
      )
    );

    try {
      await api.post(`/user/relay/unit/${unitId}`, { state: newState });
    } catch (err) {
      setModules((prev) =>
        prev.map((mod, mIdx) =>
          mIdx === moduleIndex
            ? {
                ...mod,
                units: mod.units.map((u, uIdx) =>
                  uIdx === unitIndex ? { ...u, loading: false } : u
                ),
              }
            : mod
        )
      );
      showAlert(err.response?.data?.error || "Failed to toggle unit relay");
    }
  };

  const bodyText = isDark ? "text-gray-100" : "text-gray-900";
  const mutedText = isDark ? "text-gray-400" : "text-gray-600";
  const bgCard = isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200";

  return (
    <div className="min-h-screen pb-6">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${bodyText}`}>Relay Control</h2>
        <p className={`text-sm ${mutedText} mt-1`}>
          Control relays for main meter and module units
        </p>
      </div>

      {/* ALERT */}
      {alert && (
        <div
          className={`mb-4 p-3 rounded-lg border ${
            alert.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
          }`}
        >
          <p className="text-sm flex items-center gap-2">
            <span>{alert.type === "success" ? "✓" : "⚠"}</span>
            <span>{alert.message}</span>
          </p>
        </div>
      )}

      {/* OFFLINE WARNING */}
      {!activeDevice?.isOnline && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <span>⚠️</span>
            <span>Main meter is offline. Relay control is disabled.</span>
          </p>
        </div>
      )}

      {/* LOCKED WARNING */}
      {activeDevice?.isLocked && (
        <div className="mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
            <span>🔒</span>
            <span>Device is locked due to insufficient balance.</span>
          </p>
        </div>
      )}

      {loading && (
        <div className={`text-center py-8 text-sm ${mutedText}`}>
          Loading relay data...
        </div>
      )}

      {!loading && (
        <div className="space-y-4">
          {/* MAIN METER RELAY */}
          <div className={`p-4 rounded-lg border ${bgCard}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${bodyText}`}>
                  Main Meter Relay
                </h3>
                <p className={`text-xs ${mutedText} mt-0.5`}>
                  {activeDevice?.meterName || `Device ${deviceId}`}
                </p>
              </div>

              <button
                onClick={toggleMainRelay}
                disabled={
                  !activeDevice?.isOnline ||
                  activeDevice?.isLocked ||
                  mainRelay.loading
                }
                className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors ${
                  mainRelay.state
                    ? "bg-green-500"
                    : isDark
                    ? "bg-gray-700"
                    : "bg-gray-300"
                } ${
                  !activeDevice?.isOnline ||
                  activeDevice?.isLocked ||
                  mainRelay.loading
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <span
                  className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-lg transition-transform ${
                    mainRelay.state ? "translate-x-12" : "translate-x-1"
                  }`}
                >
                  {mainRelay.loading && (
                    <span className="flex h-full w-full items-center justify-center">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-green-500" />
                    </span>
                  )}
                </span>
                <span
                  className={`absolute text-xs font-medium ${
                    mainRelay.state
                      ? "left-2 text-white"
                      : "right-2 text-gray-600"
                  }`}
                >
                  {mainRelay.state ? "ON" : "OFF"}
                </span>
              </button>
            </div>
          </div>

          {/* MODULE UNITS */}
          {modules.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold ${bodyText} mb-3`}>
                Module Units
              </h3>

              {modules.map((module, moduleIndex) => (
                <div key={module.moduleId} className="mb-4">
                  <div className={`text-sm font-medium ${mutedText} mb-2`}>
                    {module.moduleId}
                    {!module.isOnline && (
                      <span className="ml-2 text-red-500">(Offline)</span>
                    )}
                  </div>

                  {module.units.length === 0 ? (
                    <div
                      className={`p-3 rounded-lg border ${bgCard} text-center text-sm ${mutedText}`}
                    >
                      No units configured
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {module.units.map((unit, unitIndex) => (
                        <div
                          key={unit._id}
                          className={`p-3 rounded-lg border ${bgCard}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium ${bodyText} truncate`}>
                                {unit.name || `Unit ${unit.unitNumber}`}
                              </div>
                              {unit.location && (
                                <div className={`text-xs ${mutedText} mt-0.5`}>
                                  {unit.location}
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() =>
                                toggleUnitRelay(
                                  unit._id,
                                  unit.relayStatus,
                                  moduleIndex,
                                  unitIndex
                                )
                              }
                              disabled={
                                !activeDevice?.isOnline ||
                                activeDevice?.isLocked ||
                                !module.isOnline ||
                                unit.loading
                              }
                              className={`relative inline-flex h-9 w-16 items-center rounded-full transition-colors ml-3 ${
                                unit.relayStatus
                                  ? "bg-green-500"
                                  : isDark
                                  ? "bg-gray-700"
                                  : "bg-gray-300"
                              } ${
                                !activeDevice?.isOnline ||
                                activeDevice?.isLocked ||
                                !module.isOnline ||
                                unit.loading
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer"
                              }`}
                            >
                              <span
                                className={`inline-block h-7 w-7 transform rounded-full bg-white shadow transition-transform ${
                                  unit.relayStatus
                                    ? "translate-x-8"
                                    : "translate-x-1"
                                }`}
                              >
                                {unit.loading && (
                                  <span className="flex h-full w-full items-center justify-center">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-green-500" />
                                  </span>
                                )}
                              </span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {modules.length === 0 && (
            <div className={`text-center py-8 text-sm ${mutedText}`}>
              No modules paired with this meter
            </div>
          )}
        </div>
      )}
    </div>
  );
}