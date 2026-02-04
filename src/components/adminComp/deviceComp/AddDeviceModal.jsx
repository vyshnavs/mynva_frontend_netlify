import { useState, useContext } from "react";
import api from "../../../api/connection";
import { ThemeContext } from "../../../contexts/ThemeContext";

export default function AddDeviceModal({ close, refresh }) {
  const { theme } = useContext(ThemeContext);

  const [data, setData] = useState({
    meterName: "",
    location: "",
    meterSerialNumber: "",
    remarks: "",
  });

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const saveDevice = async () => {
    try {
      const res = await api.post("/admin/devices", data);
      alert(`Device ID: ${res.data.deviceId}\nSecret Key: ${res.data.secretKey}`);
      refresh();
      close();
    } catch {
      alert("Failed to add device");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
      <div
        className={`w-96 rounded-xl p-6 shadow-xl animate-fadeIn 
        ${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}
      >
        <h2 className="text-2xl font-bold mb-4">Add New Device</h2>

        <div className="space-y-3">
          <input className="form-input" name="meterName" placeholder="Meter Name" onChange={handleChange} />
          <input className="form-input" name="location" placeholder="Location" onChange={handleChange} />
          <input className="form-input" name="meterSerialNumber" placeholder="Serial Number" onChange={handleChange} />
          <textarea className="form-input" name="remarks" placeholder="Remarks" onChange={handleChange} />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button className="btn-gray" onClick={close}>Cancel</button>
          <button className="btn-blue" onClick={saveDevice}>Save</button>
        </div>
      </div>
    </div>
  );
}
