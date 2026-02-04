import { useContext } from "react";
import { ThemeContext } from "../../../contexts/ThemeContext";
import api from "../../../api/connection";

export default function PolicyTable({ policies, refresh, setEditPolicy }) {
  const { theme } = useContext(ThemeContext);

  const handleDelete = async (id) => {
    if (!confirm("Delete this policy?")) return;
    try {
      await api.delete(`/admin/billing/${id}`);
      refresh();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const bgClass = theme === "dark" ? "bg-gray-800" : "bg-white";
  const borderClass = theme === "dark" ? "border-gray-700" : "border-gray-200";

  return (
    <div className={`${bgClass} rounded-lg shadow overflow-x-auto`}>
      <table className="w-full">
        <thead className={theme === "dark" ? "bg-gray-700" : "bg-gray-50"}>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Policy Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cycle Days</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Slabs</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Fixed Charge</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${borderClass}`}>
          {policies.map((p) => (
            <tr key={p._id}>
              <td className="px-6 py-4 whitespace-nowrap font-medium">{p.policyName}</td>
              <td className="px-6 py-4 whitespace-nowrap">{p.cycleDays}</td>
              <td className="px-6 py-4 whitespace-nowrap">{p.slabs.length} slabs</td>
              <td className="px-6 py-4 whitespace-nowrap">₹{p.fixedChargePerCycle}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded text-xs ${
                  p.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                  p.status === "INACTIVE" ? "bg-red-100 text-red-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {p.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap space-x-2">
                <button
                  onClick={() => setEditPolicy(p)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}