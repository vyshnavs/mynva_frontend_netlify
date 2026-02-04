import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import { useParams } from "react-router-dom";
import api from "../../api/connection";

export default function ModuleUnitManagementPage() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const { deviceId } = useParams();

  const [modules, setModules] = useState([]);
  const [gadgets, setGadgets] = useState([]);
  const [editingUnit, setEditingUnit] = useState(null);
  const [form, setForm] = useState({
    name: "",
    location: "",
    description: "",
    connectedGadgets: [],
  });

  // Maximum limits for domestic loads
  const UNIT_LIMITS = {
    Kitchen: { maxCurrent: 25, minPowerFactor: 0.75 },
    Bedroom: { maxCurrent: 15, minPowerFactor: 0.8 },
    Hall: { maxCurrent: 20, minPowerFactor: 0.8 },
    Bathroom: { maxCurrent: 12, minPowerFactor: 0.85 },
    "Living Room": { maxCurrent: 20, minPowerFactor: 0.8 },
    "Dining Room": { maxCurrent: 15, minPowerFactor: 0.8 },
    Office: { maxCurrent: 15, minPowerFactor: 0.85 },
    Garage: { maxCurrent: 20, minPowerFactor: 0.75 },
    Outdoor: { maxCurrent: 15, minPowerFactor: 0.8 },
    Default: { maxCurrent: 16, minPowerFactor: 0.8 },
  };

  const [limitExceeded, setLimitExceeded] = useState({
    current: false,
    pf: false,
  });

  /* ===============================
     LOAD MODULES + UNITS
  =============================== */
  useEffect(() => {
    if (!deviceId) return;

    api
      .get(`/user/module-units/device/${deviceId}`)
      .then((res) => {
        setModules(res.data.modules || []);
      })
      .catch((err) => {
        console.error("LOAD MODULES ERROR:", err);
      });
  }, [deviceId]);

  /* ===============================
     LOAD GADGETS
  =============================== */
  useEffect(() => {
    api
      .get("/user/module-units/gadgets/list")
      .then((res) => setGadgets(res.data.gadgets || []))
      .catch((err) => console.error("LOAD GADGETS ERROR:", err));
  }, []);

  /* ===============================
     GET CURRENT LOCATION LIMITS
  =============================== */
  const getCurrentLimits = () => {
    const location = form.location || "Default";
    return UNIT_LIMITS[location] || UNIT_LIMITS["Default"];
  };

  /* ===============================
     CALCULATE THRESHOLDS (WITHOUT STATE UPDATE)
  =============================== */
  const calculateThresholds = (connectedGadgets) => {
    let maxCurrent = 0;
    let minPF = 1;

    connectedGadgets.forEach((cg) => {
      const gadget = gadgets.find((g) => g._id === cg.gadget);
      if (!gadget) return;

      maxCurrent += gadget.ratedCurrent * cg.quantity;
      minPF = Math.min(minPF, gadget.powerFactor || 1);
    });

    const limits = getCurrentLimits();
    const exceeded = {
      current: maxCurrent > limits.maxCurrent,
      pf: minPF < limits.minPowerFactor,
    };

    return {
      maxCurrent: maxCurrent.toFixed(2),
      minPowerFactor: minPF.toFixed(2),
      exceeded,
    };
  };

  /* ===============================
     UPDATE LIMITS WHEN FORM CHANGES
  =============================== */
  useEffect(() => {
    const result = calculateThresholds(form.connectedGadgets);
    setLimitExceeded(result.exceeded);
  }, [form.connectedGadgets, form.location, gadgets]);

  /* ===============================
     ADD GADGET
  =============================== */
  const addGadget = (gadgetId) => {
    if (!gadgetId) return;

    const existing = form.connectedGadgets.find((g) => g.gadget === gadgetId);
    if (existing) {
      setForm({
        ...form,
        connectedGadgets: form.connectedGadgets.map((g) =>
          g.gadget === gadgetId ? { ...g, quantity: g.quantity + 1 } : g
        ),
      });
    } else {
      setForm({
        ...form,
        connectedGadgets: [
          ...form.connectedGadgets,
          { gadget: gadgetId, quantity: 1 },
        ],
      });
    }
  };

  /* ===============================
     UPDATE QUANTITY
  =============================== */
  const updateQuantity = (gadgetId, newQuantity) => {
    if (newQuantity < 1) {
      setForm({
        ...form,
        connectedGadgets: form.connectedGadgets.filter(
          (g) => g.gadget !== gadgetId
        ),
      });
    } else {
      setForm({
        ...form,
        connectedGadgets: form.connectedGadgets.map((g) =>
          g.gadget === gadgetId ? { ...g, quantity: newQuantity } : g
        ),
      });
    }
  };

  /* ===============================
     REMOVE GADGET
  =============================== */
  const removeGadget = (gadgetId) => {
    setForm({
      ...form,
      connectedGadgets: form.connectedGadgets.filter(
        (g) => g.gadget !== gadgetId
      ),
    });
  };

  /* ===============================
     SAVE UNIT (WITH LIMIT CHECK)
  =============================== */
  const saveUnit = async () => {
    if (!editingUnit?._id) {
      console.warn("saveUnit called without editingUnit");
      return;
    }

    // Check if limits are exceeded
    if (limitExceeded.current || limitExceeded.pf) {
      alert(
        `Cannot save configuration!\n\n${
          limitExceeded.current
            ? `⚠️ Current limit exceeded for ${form.location || "this unit"}\n`
            : ""
        }${
          limitExceeded.pf
            ? `⚠️ Power factor too low for ${form.location || "this unit"}\n`
            : ""
        }\nPlease reduce the connected devices or change the location.`
      );
      return;
    }

    const unitId = editingUnit._id;
    const thresholds = calculateThresholds(form.connectedGadgets);

    try {
      await api.put(`/user/module-units/unit/${unitId}`, {
        ...form,
        thresholds: {
          maxVoltage: 240,
          minVoltage: 180,
          maxCurrent: parseFloat(thresholds.maxCurrent),
          minPowerFactor: parseFloat(thresholds.minPowerFactor),
        },
      });

      setEditingUnit(null);
      setForm({
        name: "",
        location: "",
        description: "",
        connectedGadgets: [],
      });
      setLimitExceeded({ current: false, pf: false });

      const res = await api.get(`/user/module-units/device/${deviceId}`);
      setModules(res.data.modules || []);
    } catch (err) {
      console.error("SAVE UNIT ERROR:", err);

      // Handle backend validation error
      if (err.response?.data?.limitExceeded) {
        alert(`❌ ${err.response.data.error}`);
      } else {
        alert("Failed to save configuration. Please try again.");
      }
    }
  };

  const currentThresholds = calculateThresholds(form.connectedGadgets);

  return (
    <div className="space-y-6">
      {modules.map((m) => (
        <div
          key={m.moduleDbId}
          className={`rounded-2xl border shadow-lg overflow-hidden ${
            isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <div
            className={`px-6 py-4 border-b ${
              isDark
                ? "border-gray-800 bg-gray-800/50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3
                className={`text-lg font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {m.moduleId}
              </h3>
              <span
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Capacity: {m.slaveCapacity} units
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className={isDark ? "bg-gray-800" : "bg-gray-100"}>
                <tr
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <th className="px-6 py-3 text-left font-semibold">Unit</th>
                  <th className="px-6 py-3 text-left font-semibold">Name</th>
                  <th className="px-6 py-3 text-left font-semibold hidden sm:table-cell">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">Gadgets</th>
                  <th className="px-6 py-3 text-left font-semibold hidden md:table-cell">
                    Max Current
                  </th>
                  <th className="px-6 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className={isDark ? "text-gray-300" : "text-gray-700"}>
                {m.units.map((u) => (
                  <tr
                    key={u._id}
                    className={`border-t ${
                      isDark
                        ? "border-gray-800 hover:bg-gray-800/30"
                        : "border-gray-200 hover:bg-gray-50"
                    } transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isDark
                            ? "bg-blue-900 text-blue-300"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {u.unitNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.name || (
                        <span
                          className={isDark ? "text-gray-600" : "text-gray-400"}
                        >
                          Not set
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {u.location || (
                        <span
                          className={isDark ? "text-gray-600" : "text-gray-400"}
                        >
                          -
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {u.connectedGadgets.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {u.connectedGadgets.map((g, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                isDark
                                  ? "bg-green-900 text-green-300"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {g.gadget.name} ×{g.quantity}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span
                          className={isDark ? "text-gray-600" : "text-gray-400"}
                        >
                          No gadgets
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span
                        className={`font-mono ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {u.thresholds.maxCurrent} A
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isDark
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                        onClick={() => {
                          setEditingUnit(u);
                          setForm({
                            name: u.name || "",
                            location: u.location || "",
                            description: u.description || "",
                            connectedGadgets: u.connectedGadgets.map((g) => ({
                              gadget: g.gadget._id,
                              quantity: g.quantity,
                            })),
                          });
                        }}
                      >
                        Configure
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* CUSTOMIZE MODAL */}
      {editingUnit && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
              isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
            }`}
          >
            {/* Header */}
            <div
              className={`sticky top-0 px-6 py-4 border-b ${
                isDark
                  ? "border-gray-800 bg-gray-900"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h3 className="text-xl font-bold">
                Configure Unit {editingUnit.unitNumber}
              </h3>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Unit Name
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="e.g., Master Bedroom"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Location / Room Type
                  </label>
                  <select
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    value={form.location}
                    onChange={(e) => {
                      setForm({ ...form, location: e.target.value });
                    }}
                  >
                    <option value="">Select Location</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Bedroom">Bedroom</option>
                    <option value="Hall">Hall</option>
                    <option value="Bathroom">Bathroom</option>
                    <option value="Living Room">Living Room</option>
                    <option value="Dining Room">Dining Room</option>
                    <option value="Office">Office</option>
                    <option value="Garage">Garage</option>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Default">Other</option>
                  </select>
                  {form.location && (
                    <div
                      className={`mt-2 text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Max limit: {getCurrentLimits().maxCurrent}A, Min PF:{" "}
                      {getCurrentLimits().minPowerFactor}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Description
                  </label>
                  <textarea
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="Optional description"
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Connected Gadgets */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Connected Devices
                </label>

                <select
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition mb-4 ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  onChange={(e) => {
                    addGadget(e.target.value);
                    e.target.value = "";
                  }}
                >
                  <option value="">+ Add Device</option>
                  {gadgets.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name} ({g.ratedCurrent}A, PF: {g.powerFactor})
                    </option>
                  ))}
                </select>

                {/* Gadget List */}
                <div className="space-y-2">
                  {form.connectedGadgets.map((cg) => {
                    const gadget = gadgets.find((g) => g._id === cg.gadget);
                    if (!gadget) return null;

                    return (
                      <div
                        key={cg.gadget}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isDark
                            ? "bg-gray-800 border-gray-700"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="font-medium">{gadget.name}</div>
                          <div
                            className={`text-xs ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {gadget.ratedCurrent}A per unit · PF:{" "}
                            {gadget.powerFactor}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(cg.gadget, cg.quantity - 1)
                            }
                            className={`w-8 h-8 rounded-lg font-bold ${
                              isDark
                                ? "bg-gray-700 hover:bg-gray-600 text-white"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                            }`}
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-mono">
                            {cg.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(cg.gadget, cg.quantity + 1)
                            }
                            className={`w-8 h-8 rounded-lg font-bold ${
                              isDark
                                ? "bg-gray-700 hover:bg-gray-600 text-white"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                            }`}
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeGadget(cg.gadget)}
                            className={`w-8 h-8 rounded-lg font-bold ${
                              isDark
                                ? "bg-red-900 hover:bg-red-800 text-red-300"
                                : "bg-red-100 hover:bg-red-200 text-red-700"
                            }`}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {form.connectedGadgets.length === 0 && (
                    <div
                      className={`text-center py-8 ${
                        isDark ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      No devices added yet
                    </div>
                  )}
                </div>
              </div>

              {/* Calculated Thresholds */}
              <div
                className={`p-4 rounded-lg border-2 ${
                  limitExceeded.current || limitExceeded.pf
                    ? isDark
                      ? "bg-red-950 border-red-800"
                      : "bg-red-50 border-red-300"
                    : isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div
                  className={`text-sm font-medium mb-2 ${
                    limitExceeded.current || limitExceeded.pf
                      ? isDark
                        ? "text-red-300"
                        : "text-red-700"
                      : isDark
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  {limitExceeded.current || limitExceeded.pf
                    ? "⚠️ Limit Exceeded!"
                    : "✓ Calculated Thresholds"}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Max Current
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        limitExceeded.current
                          ? isDark
                            ? "text-red-400"
                            : "text-red-600"
                          : isDark
                          ? "text-blue-400"
                          : "text-blue-600"
                      }`}
                    >
                      {currentThresholds.maxCurrent} A
                      {form.location &&
                        ` / ${getCurrentLimits().maxCurrent}A`}
                    </div>
                    {limitExceeded.current && (
                      <div
                        className={`text-xs mt-1 ${
                          isDark ? "text-red-400" : "text-red-600"
                        }`}
                      >
                        Exceeds limit by{" "}
                        {(
                          parseFloat(currentThresholds.maxCurrent) -
                          getCurrentLimits().maxCurrent
                        ).toFixed(2)}
                        A
                      </div>
                    )}
                  </div>
                  <div>
                    <div
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Min Power Factor
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        limitExceeded.pf
                          ? isDark
                            ? "text-red-400"
                            : "text-red-600"
                          : isDark
                          ? "text-green-400"
                          : "text-green-600"
                      }`}
                    >
                      {currentThresholds.minPowerFactor}
                      {form.location &&
                        ` / ${getCurrentLimits().minPowerFactor}`}
                    </div>
                    {limitExceeded.pf && (
                      <div
                        className={`text-xs mt-1 ${
                          isDark ? "text-red-400" : "text-red-600"
                        }`}
                      >
                        Below minimum by{" "}
                        {(
                          getCurrentLimits().minPowerFactor -
                          parseFloat(currentThresholds.minPowerFactor)
                        ).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className={`sticky bottom-0 px-6 py-4 border-t flex gap-3 ${
                isDark
                  ? "border-gray-800 bg-gray-900"
                  : "border-gray-200 bg-white"
              }`}
            >
              <button
                className={`flex-1 py-2.5 rounded-lg font-medium transition ${
                  isDark
                    ? "bg-gray-800 hover:bg-gray-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
                onClick={() => {
                  setEditingUnit(null);
                  setForm({
                    name: "",
                    location: "",
                    description: "",
                    connectedGadgets: [],
                  });
                  setLimitExceeded({ current: false, pf: false });
                }}
              >
                Cancel
              </button>
              <button
                className={`flex-1 py-2.5 rounded-lg font-medium transition ${
                  limitExceeded.current || limitExceeded.pf
                    ? isDark
                      ? "bg-red-900 text-red-300 cursor-not-allowed opacity-50"
                      : "bg-red-100 text-red-700 cursor-not-allowed opacity-50"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                onClick={saveUnit}
                disabled={limitExceeded.current || limitExceeded.pf}
              >
                {limitExceeded.current || limitExceeded.pf
                  ? "⚠️ Cannot Save - Limit Exceeded"
                  : "Save Configuration"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}