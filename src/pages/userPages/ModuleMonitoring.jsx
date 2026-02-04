export default function ModuleMonitoring() {
  const modules = [
    { id: 1, name: "Meter 1", status: "Online", usage: "3.2 kWh" },
    { id: 2, name: "Meter 2", status: "Offline", usage: "—" },
    { id: 3, name: "Smart Plug A", status: "Online", usage: "0.8 kWh" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Module Monitoring</h1>

      <table className="w-full bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-left">
            <th className="p-4">Module</th>
            <th className="p-4">Status</th>
            <th className="p-4">Usage</th>
          </tr>
        </thead>

        <tbody>
          {modules.map((m) => (
            <tr key={m.id} className="border-b dark:border-gray-700">
              <td className="p-4">{m.name}</td>
              <td className="p-4">
                <span className={`px-3 py-1 rounded text-white ${
                  m.status === "Online" ? "bg-green-600" : "bg-red-600"
                }`}>
                  {m.status}
                </span>
              </td>
              <td className="p-4">{m.usage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
