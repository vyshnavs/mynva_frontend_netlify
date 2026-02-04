export default function UsersTable({ users }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 dark:border-gray-700">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Device ID(s)</th>
            <th className="px-4 py-3 text-left">Device Status</th>
            <th className="px-4 py-3 text-left">Modules</th>
            <th className="px-4 py-3 text-left">Created At</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr
              key={u.userId}
              className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <td className="px-4 py-3 font-medium">{u.email}</td>

              <td className="px-4 py-3">
                {u.devices.length
                  ? u.devices.map((d) => d.deviceId).join(", ")
                  : "-"}
              </td>

              <td className="px-4 py-3 space-x-2">
                {u.devices.length ? (
                  u.devices.map((d, i) => (
                    <span
                      key={i}
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        d.isOnline
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {d.deviceId}: {d.isOnline ? "Online" : "Offline"}
                    </span>
                  ))
                ) : (
                  "-"
                )}
              </td>

              <td className="px-4 py-3">
                {u.devices.length
                  ? u.devices.map((d) => (
                      <div key={d.deviceId}>
                        {d.deviceId}: {d.moduleCount}
                      </div>
                    ))
                  : "-"}
              </td>

              <td className="px-4 py-3">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
