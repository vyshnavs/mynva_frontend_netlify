export default function ApplicationTable({ applications, onViewDetails, onApprove, onReject, theme }) {
  const getStatusBadge = (status) => {
    const badges = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  if (applications.length === 0) {
    return (
      <div className={`p-8 text-center rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
        <p className="text-gray-500">No applications found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={`w-full rounded-lg overflow-hidden ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
        <thead className={theme === "dark" ? "bg-gray-700" : "bg-gray-100"}>
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">Application ID</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Applicant</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Mobile</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Submitted</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {applications.map((app) => (
            <tr key={app._id} className={theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
              <td className="px-4 py-3 text-sm font-mono">{app.applicationId}</td>
              <td className="px-4 py-3 text-sm">{app.name}</td>
              <td className="px-4 py-3 text-sm">{app.email}</td>
              <td className="px-4 py-3 text-sm">{app.mobile}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(app.status)}`}>
                  {app.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                {new Date(app.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewDetails(app)}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View
                  </button>
                  {app.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => onApprove(app)}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onReject(app)}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}