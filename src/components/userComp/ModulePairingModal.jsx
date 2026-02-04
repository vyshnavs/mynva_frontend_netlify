// src/components/userComp/ModulePairingModal.jsx
import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import api from "../../api/connection";
import RadarScanner from "./RadarScanner";
import { on, off } from "../../api/websocket";

export default function ModulePairingModal({ deviceId, close, onPaired }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const [scanning, setScanning] = useState(true);
  const [blips, setBlips] = useState([]);
  const [selected, setSelected] = useState(null);
  const [secret, setSecret] = useState("");
  const [pairing, setPairing] = useState(false);

  const startScan = () => {
    setScanning(true);
    setBlips([]);
    setSelected(null);
    api.get(`/user/modules/scan?deviceId=${deviceId}`).catch(console.error);
  };

  useEffect(() => {
    startScan();

    const onScan = (data) => {
      setScanning(false);
      setBlips((prev) =>
        prev.find((b) => b.moduleId === data.moduleId)
          ? prev
          : [
              ...prev,
              {
                moduleId: data.moduleId,
                slaveCapacity: data.slaveCapacity,
                x: Math.random() * 80 + 10,
                y: Math.random() * 80 + 10,
              },
            ]
      );
    };

    on("module:scan", onScan);
    return () => off("module:scan", onScan);
  }, [deviceId]);

  const pair = async () => {
    if (!secret || !selected) {
      alert("Secret key required");
      return;
    }

    try {
      setPairing(true);
      await api.post("/user/modules/pair", {
        deviceId,
        moduleId: selected.moduleId,
        secret,
      });
      onPaired();
      close();
    } catch (err) {
      alert(err.response?.data?.error || "Pairing failed");
    } finally {
      setPairing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-3">
      <div
        className={`w-full max-w-md rounded-2xl shadow-xl flex flex-col ${
          isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
        style={{ maxHeight: "90vh" }} // ✅ MOBILE SAFE
      >
        {/* ================= HEADER (FIXED) ================= */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isDark ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <h3 className="text-lg font-bold">Pair Slave Cluster</h3>
          <button
            onClick={close}
            className="text-xl text-gray-400 hover:text-red-500"
          >
            ✕
          </button>
        </div>

        {/* ================= SCROLLABLE BODY ================= */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* RADAR */}
          <RadarScanner
            deviceId={deviceId}
            scanning={scanning}
            blips={blips}
            onCancel={() => setScanning(false)}
            onRescan={startScan}
          />

          {/* EMPTY */}
          {!scanning && blips.length === 0 && (
            <div className="text-center text-sm text-gray-400">
              No modules detected
            </div>
          )}

          {/* MODULE LIST */}
          {!scanning && blips.length > 0 && (
            <div className="space-y-2">
              {blips.map((m) => (
                <button
                  key={m.moduleId}
                  onClick={() => setSelected(m)}
                  className={`w-full rounded-lg border px-4 py-2 text-left transition ${
                    selected?.moduleId === m.moduleId
                      ? "border-green-500 bg-green-500/10"
                      : isDark
                      ? "border-gray-700 hover:bg-gray-800"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="font-semibold text-sm">{m.moduleId}</div>
                  <div className="text-xs text-gray-400">
                    Capacity: {m.slaveCapacity}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* SECRET */}
          {selected && (
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Enter module secret key"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border outline-none ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-300"
                }`}
              />

              <button
                onClick={pair}
                disabled={pairing}
                className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-60"
              >
                {pairing ? "Pairing…" : "Pair Module"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
