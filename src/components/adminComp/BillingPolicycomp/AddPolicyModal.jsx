import { useState, useContext } from "react";
import { ThemeContext } from "../../../contexts/ThemeContext";
import api from "../../../api/connection";

export default function AddPolicyModal({ close, refresh }) {
  const { theme } = useContext(ThemeContext);
  const [form, setForm] = useState({
    policyName: "",
    cycleDays: 60,
    fixedChargePerCycle: 0,
    fuelSurchargePerUnit: 0,
    electricityDutyPercent: 0,
    effectiveFrom: "",
    status: "DRAFT"
  });
  const [slabs, setSlabs] = useState([{ from: 0, to: 100, rate: 0 }]);

  const handleAddSlab = () => {
    const lastSlab = slabs[slabs.length - 1];
    setSlabs([...slabs, { from: lastSlab.to + 1, to: lastSlab.to + 100, rate: 0 }]);
  };

  const handleSlabChange = (i, field, val) => {
    const updated = [...slabs];
    if (field === "to" && val === "") {
      updated[i][field] = null;
    } else {
      updated[i][field] = val === "" ? "" : field === "rate" ? parseFloat(val) : parseInt(val);
    }
    setSlabs(updated);
  };

  const handleRemoveSlab = (i) => {
    setSlabs(slabs.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    try {
      await api.post("/admin/billing", { ...form, slabs });
      refresh();
      close();
    } catch (err) {
      console.error("Create failed:", err);
      alert(err.response?.data?.error || "Failed to create policy");
    }
  };

  const bgClass = theme === "dark" ? "bg-gray-800" : "bg-white";
  const inputClass = theme === "dark" 
    ? "bg-gray-700 border-gray-600 text-gray-100" 
    : "bg-white border-gray-300 text-gray-900";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${bgClass} rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">
          <h3 className="text-2xl font-bold mb-4">Add Billing Policy</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Policy Name</label>
                <input
                  type="text"
                  value={form.policyName}
                  onChange={(e) => setForm({ ...form, policyName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cycle Days</label>
                <input
                  type="number"
                  value={form.cycleDays}
                  onChange={(e) => setForm({ ...form, cycleDays: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fixed Charge (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.fixedChargePerCycle}
                  onChange={(e) => setForm({ ...form, fixedChargePerCycle: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fuel Surcharge/Unit (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.fuelSurchargePerUnit}
                  onChange={(e) => setForm({ ...form, fuelSurchargePerUnit: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Electricity Duty (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.electricityDutyPercent}
                  onChange={(e) => setForm({ ...form, electricityDutyPercent: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Effective From</label>
                <input
                  type="date"
                  value={form.effectiveFrom}
                  onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Energy Slabs</label>
                <button
                  type="button"
                  onClick={handleAddSlab}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  + Add Slab
                </button>
              </div>
              <div className="space-y-2">
                {slabs.map((s, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="From"
                      value={s.from}
                      onChange={(e) => handleSlabChange(i, "from", e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-lg ${inputClass}`}
                    />
                    <input
                      type="number"
                      placeholder="To (blank = ∞)"
                      value={s.to === null ? "" : s.to}
                      onChange={(e) => handleSlabChange(i, "to", e.target.value || null)}
                      className={`flex-1 px-3 py-2 border rounded-lg ${inputClass}`}
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Rate (₹)"
                      value={s.rate}
                      onChange={(e) => handleSlabChange(i, "rate", e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-lg ${inputClass}`}
                    />
                    {slabs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSlab(i)}
                        className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={close}
                className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Create Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}