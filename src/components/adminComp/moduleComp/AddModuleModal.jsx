import { useState, useContext } from "react";
import api from "../../../api/connection";
import { ThemeContext } from "../../../contexts/ThemeContext";

export default function AddModuleModal({ close, refresh }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const [form, setForm] = useState({
    hardwareSerialNumber: "",
    slaveCapacity: 2, // ✅ default capacity
  });

  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  // -------------------------
  // DOWNLOAD TXT FILE
  // -------------------------
  const downloadFile = (content, moduleId) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `module-${moduleId}.txt`;
    a.click();

    URL.revokeObjectURL(url);
  };

  // -------------------------
  // SUBMIT
  // -------------------------
  const submit = async () => {
    if (!form.hardwareSerialNumber.trim()) {
      alert("Hardware serial number is required");
      return;
    }

    if (form.slaveCapacity < 1) {
      alert("Slave capacity must be at least 1");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/admin/modules/create", {
        hardwareSerialNumber: form.hardwareSerialNumber,
        slaveCapacity: Number(form.slaveCapacity),
      });

      if (res.data?.file && res.data?.moduleId) {
        downloadFile(res.data.file, res.data.moduleId);
      }

      setGenerated(true);
      refresh();
    } catch (err) {
      alert(err.response?.data?.error || "Module creation failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-2 rounded-lg border outline-none ${
    isDark
      ? "bg-gray-800 border-gray-700 text-white"
      : "bg-white border-gray-300"
  }`;

  // -------------------------
  // SUCCESS VIEW
  // -------------------------
  if (generated) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div
          className={`p-6 rounded-xl w-96 ${
            isDark ? "bg-gray-900 text-white" : "bg-white"
          }`}
        >
          <h3 className="text-green-500 font-bold mb-3">
            Module Registered Successfully
          </h3>

          <p className="text-sm mb-4">
            The pairing credentials have been downloaded as a text file.
            <br />
            <b>Store it securely.</b>
          </p>

          <button
            onClick={close}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // -------------------------
  // FORM VIEW
  // -------------------------
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div
        className={`p-6 rounded-xl w-96 ${
          isDark ? "bg-gray-900 text-white" : "bg-white"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">
          Register Slave Cluster Module
        </h2>

        <input
          className={inputClass}
          placeholder="Hardware Serial Number"
          value={form.hardwareSerialNumber}
          onChange={(e) =>
            setForm({ ...form, hardwareSerialNumber: e.target.value })
          }
        />

        {/* ✅ SLAVE CAPACITY */}
        <input
          type="number"
          min="1"
          className={`${inputClass} mt-3`}
          placeholder="Slave Capacity (e.g. 2, 4, 8)"
          value={form.slaveCapacity}
          onChange={(e) =>
            setForm({ ...form, slaveCapacity: e.target.value })
          }
        />

        <div className="flex gap-2 mt-5">
          <button
            onClick={close}
            className="flex-1 py-2 border rounded-lg"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
