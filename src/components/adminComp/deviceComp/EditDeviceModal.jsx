import { useState, useContext } from "react";
import api from "../../../api/connection";
import { ThemeContext } from "../../../contexts/ThemeContext";

export default function EditDeviceModal({ device, close, refresh }) {
  const { theme } = useContext(ThemeContext);

  const [data, setData] = useState({
    meterName: device.meterName,
    location: device.location,
    meterSerialNumber: device.meterSerialNumber,
    remarks: device.remarks,
  });

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const updateDevice = async () => {
    try {
      await api.put(`/admin/devices/${device._id}`, data);
      refresh();
      close();
    } catch {
      alert("Update failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
      <div
        className={`w-96 rounded-xl p-6 shadow-xl animate-fadeIn 
        ${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}
      >
        <h2 className="text-2xl font-bold mb-4">Edit Device</h2>

        <div className="space-y-3">
          <input className="form-input" name="meterName" defaultValue={device.meterName} onChange={handleChange} />
          <input className="form-input" name="location" defaultValue={device.location} onChange={handleChange} />
          <input className="form-input" name="meterSerialNumber" defaultValue={device.meterSerialNumber} onChange={handleChange} />
          <textarea className="form-input" name="remarks" defaultValue={device.remarks} onChange={handleChange} />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button className="btn-gray" onClick={close}>Cancel</button>
          <button className="btn-blue" onClick={updateDevice}>Update</button>
        </div>
      </div>
    </div>
  );
}
