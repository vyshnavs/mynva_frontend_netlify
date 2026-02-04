// src/components/userComp/RadarScanner.jsx
import { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";

export default function RadarScanner({
  deviceId,
  scanning = true,
  blips = [],
  onCancel,
  onRescan,
}) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <div className="flex justify-center">
      <div
        className={`rounded-xl p-4 shadow-md ${
          isDark ? "bg-black" : "bg-gray-100"
        }`}
        style={{ width: 220 }}
      >
        <div
          className="relative mx-auto rounded-full"
          style={{ width: 170, height: 170, perspective: "900px" }}
        >
          <div className="absolute inset-0 rounded-full ring-2 ring-green-500/40" />

          <div
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{ transform: "rotateX(55deg)" }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.18)_1px,transparent_1px)] bg-[length:18px_18px]" />

            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border border-green-500/30"
                style={{ transform: `scale(${(i + 1) / 3})` }}
              />
            ))}

            {scanning && (
              <div
                className="absolute inset-0 rounded-full animate-radar-spin"
                style={{
                  background:
                    "conic-gradient(from 0deg, rgba(34,197,94,0.45), rgba(34,197,94,0.1) 45%, transparent 65%)",
                }}
              />
            )}

            {blips.map((b) => (
              <span
                key={b.moduleId}
                className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping"
                style={{ left: `${b.x}%`, top: `${b.y}%` }}
              />
            ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-12 h-12 rounded-full text-[9px] font-mono font-bold flex items-center justify-center ${
                isDark
                  ? "bg-gray-900 text-green-400"
                  : "bg-white text-green-700"
              } border border-green-500/40`}
            >
              {deviceId}
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 mt-3">
          {scanning ? "Scanning nearby modules…" : "Scan completed"}
        </div>

        <div className="flex justify-center gap-2 mt-3">
          {scanning ? (
            <button
              onClick={onCancel}
              className={`px-3 py-1 text-xs rounded border ${
                isDark
                  ? "border-gray-700 hover:bg-gray-800"
                  : "border-gray-300 hover:bg-gray-200"
              }`}
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={onRescan}
              className="px-3 py-1 text-xs rounded bg-green-600 hover:bg-green-700 text-white"
            >
              Rescan
            </button>
          )}
        </div>

        <style>{`
          @keyframes radar-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-radar-spin {
            animation: radar-spin 4s linear infinite;
          }
        `}</style>
      </div>
    </div>
  );
}
