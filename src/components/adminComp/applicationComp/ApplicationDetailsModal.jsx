export default function ApplicationDetailsModal({ application, close, onApprove, onReject, theme }) {
  // Safety check
  if (!application) {
    return null;
  }

  // ✅ FIXED: Check if URL is a PDF based on extension
  const isPdf = (url) => {
    if (!url) return false;
    return url.toLowerCase().endsWith('.pdf');
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "text-yellow-600",
      APPROVED: "text-green-600",
      REJECTED: "text-red-600",
    };
    return colors[status] || "text-gray-600";
  };

  // ✅ Component for rendering document preview
  const DocumentPreview = ({ url, label }) => {
    const isPdfFile = isPdf(url);

    if (isPdfFile) {
      return (
        <div>
          <p className="text-sm text-gray-500 mb-2">{label}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className={`w-full h-32 flex flex-col items-center justify-center rounded border-2 border-dashed hover:border-blue-500 transition ${
              theme === "dark" ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-gray-50"
            }`}>
              <svg className="w-12 h-12 text-red-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z"/>
                <path d="M10.5 13.5h-1v-3h1v3zm0-4h-1v-1h1v1z"/>
              </svg>
              <p className="text-xs font-semibold">PDF Document</p>
            </div>
            <p className="text-xs text-blue-600 mt-1 hover:underline">📄 Open PDF</p>
          </a>
        </div>
      );
    }

    // Image preview
    return (
      <div>
        <p className="text-sm text-gray-500 mb-2">{label}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <img
            src={url}
            alt={label}
            className="w-full h-32 object-cover rounded border hover:opacity-80 transition"
          />
          <p className="text-xs text-blue-600 mt-1 hover:underline">View Full Size</p>
        </a>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-green-500 text-white p-6 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Application Details</h2>
              <p className="text-sm mt-1 opacity-90">{application.applicationId}</p>
            </div>
            <button
              onClick={close}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Section */}
          <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Current Status</p>
                <p className={`text-xl font-bold ${getStatusColor(application.status)}`}>
                  {application.status}
                </p>
              </div>
              {application.approvedAt && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Approved On</p>
                  <p className="text-sm font-semibold">
                    {new Date(application.approvedAt).toLocaleString()}
                  </p>
                </div>
              )}
              {application.rejectedAt && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Rejected On</p>
                  <p className="text-sm font-semibold">
                    {new Date(application.rejectedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Applicant Details */}
          <div>
            <h3 className="text-lg font-bold mb-3 border-b pb-2">Applicant Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-semibold">{application.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-semibold">{application.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mobile Number</p>
                <p className="font-semibold">{application.mobile}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Applied On</p>
                <p className="font-semibold">
                  {new Date(application.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div>
            <h3 className="text-lg font-bold mb-3 border-b pb-2">Connection Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Building/House</p>
                <p className="font-semibold">{application.building}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Street/Road</p>
                <p className="font-semibold">{application.street}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Local Body/City</p>
                <p className="font-semibold">{application.localBody}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">District</p>
                <p className="font-semibold">{application.district}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pincode</p>
                <p className="font-semibold">{application.pincode}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-lg font-bold mb-3 border-b pb-2">Uploaded Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DocumentPreview 
                url={application.documents.photo} 
                label="Passport Photo" 
              />
              <DocumentPreview 
                url={application.documents.id} 
                label="ID Proof" 
              />
              <DocumentPreview 
                url={application.documents.addressProof} 
                label="Address Proof" 
              />
            </div>
          </div>

          {/* Allocated Device */}
          {application.allocatedDevice && (
            <div>
              <h3 className="text-lg font-bold mb-3 border-b pb-2">Allocated Device</h3>
              <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-blue-50"}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Device ID</p>
                    <p className="font-bold text-blue-600">
                      {application.allocatedDevice.deviceId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Meter Name</p>
                    <p className="font-semibold">{application.allocatedDevice.meterName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold">{application.allocatedDevice.location}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Remarks */}
          {application.adminRemarks && (
            <div>
              <h3 className="text-lg font-bold mb-3 border-b pb-2">Admin Remarks</h3>
              <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-yellow-50"}`}>
                <p>{application.adminRemarks}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {application.status === "PENDING" && (
          <div className={`sticky bottom-0 p-6 border-t ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50"}`}>
            <div className="flex gap-4 justify-end">
              <button
                onClick={close}
                className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                Close
              </button>
              <button
                onClick={onReject}
                className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Reject Application
              </button>
              <button
                onClick={onApprove}
                className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
              >
                Approve & Allocate Device
              </button>
            </div>
          </div>
        )}

        {application.status !== "PENDING" && (
          <div className={`sticky bottom-0 p-6 border-t ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50"}`}>
            <div className="flex justify-end">
              <button
                onClick={close}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}