import api from "../../../api/connection";

/**
 * Admin Device Table
 * - Shows owner (assigned user)
 * - Shows pairing status
 * - NO secret/password column
 * - Regenerate key with secure download
 */
export default function DeviceTable({
  devices,
  refresh,
  setEditDevice,
  onSecretAction,
}) {
  // ----------------------------------------------------
  // Download credentials as TXT (safe, user-initiated)
  // ----------------------------------------------------
  const downloadCredentials = ({ deviceId, secretKey, generatedAt }) => {
    const content =
`Smart Energy Meter – Pairing Credentials
---------------------------------------

Device ID     : ${deviceId}
Secret Key    : ${secretKey}
Generated At  : ${new Date(generatedAt).toLocaleString()}

IMPORTANT:
• This key is confidential
• Store it securely
• If lost, regenerate a new key from admin panel
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `device_${deviceId}_credentials.txt`;
    a.style.display = "none";

    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  // ----------------------------------------------------
  // Regenerate Secret Key
  // ----------------------------------------------------
  const regenerateKey = async (device) => {
    const ok = window.confirm(
      "This will invalidate the old secret key.\nDo you want to continue?"
    );
    if (!ok) return;

    try {
      const res = await api.post(
        `/admin/devices/${device._id}/regenerate-secret`
      );

      const { deviceId, secretKey, generatedAt } = res.data;

      downloadCredentials({ deviceId, secretKey, generatedAt });

      alert(
        `New secret key generated for Device ID ${deviceId}.\nCredentials have been downloaded.`
      );

      refresh();
      onSecretAction && onSecretAction();
    } catch (err) {
      console.error(err);
      alert("Failed to regenerate device key");
    }
  };

  // ----------------------------------------------------
  // Delete Device
  // ----------------------------------------------------
  const deleteDevice = async (id) => {
    if (!window.confirm("Delete this device?")) return;
    await api.delete(`/admin/devices/${id}`);
    refresh();
  };

  return (
    <div
      className="overflow-x-auto shadow-md rounded-xl border
      border-gray-300 dark:border-gray-700
      bg-white dark:bg-gray-900"
    >
      <table className="w-full text-left min-w-[1100px]">
        <thead className="bg-gray-200 dark:bg-gray-800">
          <tr className="text-gray-900 dark:text-gray-100">
            <th className="p-3">Meter</th>
            <th className="p-3">Device ID</th>
            <th className="p-3">Owner (User)</th>
            <th className="p-3">Status</th>
            <th className="p-3">Modules</th>
            <th className="p-3">Location</th>
            <th className="p-3">Remarks</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {devices.map((d) => {
            const ownerEmail = d.assignedUser?.email || "Unassigned";
            const isPaired = d.paired;

            return (
              <tr
                key={d._id}
                className="border-t border-gray-300 dark:border-gray-700
                hover:bg-gray-100 dark:hover:bg-gray-800
                text-gray-800 dark:text-gray-100"
              >
                <td className="p-3">{d.meterName || "-"}</td>

                <td className="p-3 font-mono">{d.deviceId}</td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-sm
                    ${
                      ownerEmail === "Unassigned"
                        ? "bg-gray-300 dark:bg-gray-700"
                        : "bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100"
                    }`}
                  >
                    {ownerEmail}
                  </span>
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium
                    ${
                      isPaired
                        ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
                        : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100"
                    }`}
                  >
                    {isPaired ? "Paired" : "Unpaired"}
                  </span>
                </td>

                <td className="p-3 text-center">{d.moduleCount}</td>

                <td className="p-3">{d.location || "-"}</td>

                <td className="p-3 max-w-[200px] truncate">
                  {d.remarks || "-"}
                </td>

                <td className="p-3 flex gap-2 justify-center">
                  <button
                    onClick={() => regenerateKey(d)}
                    className="px-3 py-1 bg-blue-600 text-white rounded
                    hover:bg-blue-700 transition"
                  >
                    Regenerate Key
                  </button>

                  <button
                    onClick={() => setEditDevice(d)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded
                    hover:bg-yellow-700 transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteDevice(d._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded
                    hover:bg-red-800 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
