import { useState } from "react";
import api from "../../../api/connection";

export default function RejectApplicationModal({
  application,
  close,
  onSuccess,
  theme,
}) {
  const [loading, setLoading] = useState(false);
  const [adminRemarks, setAdminRemarks] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();       // ✅ CRITICAL
    e.stopPropagation();      // ✅ CRITICAL

    if (!adminRemarks.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    if (adminRemarks.trim().length < 10) {
      setError("Rejection reason must be at least 10 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post(`/admin/applications/${application._id}/reject`, {
        adminRemarks: adminRemarks.trim(),
      });

      onSuccess();
    } catch (err) {
      console.error("Failed to reject application:", err);
      setError(err.response?.data?.error || "Failed to reject application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mb-4"></div>
            <p className="text-gray-700 font-semibold">Processing...</p>
          </div>
        </div>
      )}

      <div
        className={`max-w-2xl w-full rounded-lg shadow-xl flex flex-col max-h-[90vh] ${
          theme === "dark"
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-900"
        }`}
      >
        {/* Header */}
        <div className="bg-red-600 text-white p-6 rounded-t-lg flex-shrink-0">
          <h2 className="text-2xl font-bold">Reject Application</h2>
          <p className="text-sm mt-1 opacity-90">
            {application.applicationId}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div
            className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-50"
            }`}
          >
            <h3 className="font-semibold mb-2">Applicant Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Name:</span>{" "}
                <span className="font-semibold">{application.name}</span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>{" "}
                <span className="font-semibold">{application.email}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Reason for Rejection *
            </label>
            <textarea
              value={adminRemarks}
              onChange={(e) => {
                setAdminRemarks(e.target.value);
                setError("");
              }}
              rows="5"
              className={`w-full p-3 rounded border ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300"
              }`}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-6 border-t flex-shrink-0 ${
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              disabled={loading}
              className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                loading ||
                !adminRemarks.trim() ||
                adminRemarks.trim().length < 10
              }
              className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Reject Application"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
