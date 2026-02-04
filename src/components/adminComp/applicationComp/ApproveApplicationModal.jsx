import { useState, useEffect } from "react";
import api from "../../../api/connection";

export default function ApproveApplicationModal({ application, close, onSuccess, theme }) {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAvailableDevices();
  }, []);

  const fetchAvailableDevices = async () => {
    try {
      const res = await api.get("/admin/applications/available-devices");
      setDevices(res.data.devices || []);
    } catch (err) {
      console.error("Failed to fetch devices:", err);
      setError("Failed to load available devices");
    }
  };

  const handleSubmit = async () => {
    if (!selectedDevice) {
      setError("Please select a device to allocate");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post(`/admin/applications/${application._id}/approve`, {
        deviceId: selectedDevice,
        adminRemarks: adminRemarks || "Application approved and device allocated",
      });

      onSuccess();
    } catch (err) {
      console.error("Failed to approve application:", err);
      setError(err.response?.data?.error || "Failed to approve application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center mx-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
            <p className="text-gray-700 font-semibold">Approving Application...</p>
          </div>
        </div>
      )}

      <div
        className={`w-full max-w-2xl my-4 sm:my-8 rounded-lg shadow-xl ${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        {/* Header - Sticky */}
        <div className="sticky top-0 bg-green-600 text-white p-4 sm:p-6 rounded-t-lg z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-2">
              <h2 className="text-xl sm:text-2xl font-bold">Approve Application</h2>
              <p className="text-xs sm:text-sm mt-1 opacity-90 break-all">{application.applicationId}</p>
            </div>
            <button
              onClick={close}
              disabled={loading}
              className="flex-shrink-0 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition disabled:opacity-50"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Application Summary */}
          <div className={`p-3 sm:p-4 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Applicant Details</h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <div className="flex-1">
                  <span className="text-gray-500">Name:</span>{" "}
                  <span className="font-semibold">{application.name}</span>
                </div>
                <div className="flex-1">
                  <span className="text-gray-500">Email:</span>{" "}
                  <span className="font-semibold break-all">{application.email}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-500">Address:</span>{" "}
                <span className="font-semibold">
                  {application.building}, {application.street}, {application.localBody},{" "}
                  {application.district} - {application.pincode}
                </span>
              </div>
            </div>
          </div>

          {/* Device Selection */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Select Device to Allocate *
            </label>
            {devices.length === 0 ? (
              <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
                <p className="font-semibold text-sm">No available devices</p>
                <p className="text-xs sm:text-sm mt-1">
                  Please add new devices or deallocate existing devices before approving
                  applications.
                </p>
              </div>
            ) : (
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className={`w-full p-2 sm:p-3 rounded border text-sm sm:text-base ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              >
                <option value="">-- Select a device --</option>
                {devices.map((device) => (
                  <option key={device._id} value={device._id}>
                    {device.deviceId} - {device.meterName} ({device.location})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Admin Remarks */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Admin Remarks (Optional)
            </label>
            <textarea
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
              placeholder="Add any additional remarks for the applicant..."
              rows="3"
              className={`w-full p-2 sm:p-3 rounded border text-sm sm:text-base resize-none ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 placeholder-gray-500"
              }`}
            />
          </div>

          {/* Confirmation Note */}
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-xs sm:text-sm">
            <p className="font-semibold">📧 Email Notification</p>
            <p className="mt-1">
              An approval email with device details will be sent to{" "}
              <strong className="break-all">{application.email}</strong>
            </p>
          </div>
        </div>

        {/* Footer - Sticky */}
        <div className={`sticky bottom-0 p-4 sm:p-6 border-t ${
          theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={close}
              disabled={loading}
              className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg border transition text-sm sm:text-base ${
                theme === "dark"
                  ? "border-gray-600 hover:bg-gray-700"
                  : "border-gray-300 hover:bg-gray-100"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedDevice || devices.length === 0}
              className="w-full sm:w-auto sm:flex-1 px-4 sm:px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
            >
              {loading ? "Approving..." : "Approve & Allocate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}