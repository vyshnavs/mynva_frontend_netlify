import { useEffect, useState, useContext, useMemo } from "react";
import AdminLayout from "../../layouts/admin/AdminLayout";
import api from "../../api/connection";
import { ThemeContext } from "../../contexts/ThemeContext";
import {
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const emptyForm = {
  name: "",
  category: "light",
  ratedVoltage: 230,
  ratedCurrent: "",
  ratedPower: "",
  powerFactor: 0.9,
  description: "",
};

export default function GadgetsPage() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const [gadgets, setGadgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  /* =========================
     FETCH
  ========================= */
  const fetchGadgets = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/gadgets");
      setGadgets(res.data.gadgets || []);
    } catch (err) {
      console.error("Fetch gadgets failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGadgets();
  }, []);

  /* =========================
     SEARCH
  ========================= */
  const filtered = useMemo(() => {
    if (!search.trim()) return gadgets;
    const q = search.toLowerCase();
    return gadgets.filter((g) =>
      [g.name, g.category].some((v) =>
        v?.toLowerCase().includes(q)
      )
    );
  }, [gadgets, search]);

  /* =========================
     FORM HANDLING
  ========================= */
  const openAdd = () => {
    setForm(emptyForm);
    setShowAdd(true);
  };

  const openEdit = (gadget) => {
    setForm({
      name: gadget.name,
      category: gadget.category,
      ratedVoltage: gadget.ratedVoltage,
      ratedCurrent: gadget.ratedCurrent,
      ratedPower: gadget.ratedPower,
      powerFactor: gadget.powerFactor,
      description: gadget.description || "",
    });
    setEditTarget(gadget);
  };

  const submitForm = async () => {
    if (!form.name || !form.ratedCurrent || !form.ratedPower) {
      alert("Name, Current and Power are required");
      return;
    }

    try {
      setSaving(true);
      if (editTarget) {
        await api.put(`/admin/gadgets/${editTarget._id}`, form);
        setEditTarget(null);
      } else {
        await api.post("/admin/gadgets/create", form);
        setShowAdd(false);
      }
      fetchGadgets();
    } catch (err) {
      alert(err.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     DELETE
  ========================= */
  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;
    try {
      setDeleting(true);
      await api.delete(`/admin/gadgets/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchGadgets();
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const th =
    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider";
  const td = "px-4 py-3 text-sm whitespace-nowrap";

  const modalBg = isDark ? "bg-gray-900 text-white" : "bg-white";

  return (
    <AdminLayout>
      <div className={isDark ? "text-gray-100" : "text-gray-900"}>
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h2 className="text-3xl font-bold">Gadgets Catalog</h2>

          <div className="flex gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search gadgets"
                className={`pl-10 pr-4 py-2 rounded-xl border w-full lg:w-80 ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>

            <button
              onClick={openAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl shadow-md"
            >
              + Add Gadget
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div
          className={`overflow-x-auto rounded-2xl shadow-xl border ${
            isDark
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <table className="min-w-full">
            <thead className={isDark ? "bg-gray-800" : "bg-gray-100"}>
              <tr>
                <th className={th}>Name</th>
                <th className={th}>Category</th>
                <th className={th}>Voltage</th>
                <th className={th}>Current</th>
                <th className={th}>Power</th>
                <th className={`${th} text-center`}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-400">
                    Loading gadgets...
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((g) => (
                  <tr
                    key={g._id}
                    className={`border-t ${
                      isDark ? "border-gray-800" : "border-gray-200"
                    } hover:bg-blue-500/5`}
                  >
                    <td className={td}>{g.name}</td>
                    <td className={td}>{g.category}</td>
                    <td className={td}>{g.ratedVoltage} V</td>
                    <td className={td}>{g.ratedCurrent} A</td>
                    <td className={td}>{g.ratedPower} W</td>
                    <td className={`${td} text-center`}>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEdit(g)}
                          className="p-2 rounded-lg bg-blue-600 text-white"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(g)}
                          className="p-2 rounded-lg bg-red-600 text-white"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {(showAdd || editTarget) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`p-6 rounded-2xl w-full max-w-lg ${modalBg}`}>
            <h3 className="text-xl font-bold mb-4">
              {editTarget ? "Edit Gadget" : "Add Gadget"}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="col-span-2 p-2 rounded border"
              />
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                className="p-2 rounded border"
              >
                <option value="light">Light</option>
                <option value="fan">Fan</option>
                <option value="socket_6a">6A Socket</option>
                <option value="socket_16a">16A Socket</option>
                <option value="ac">AC</option>
                <option value="heater">Heater</option>
                <option value="custom">Custom</option>
              </select>

              <input
                type="number"
                placeholder="Voltage"
                value={form.ratedVoltage}
                onChange={(e) =>
                  setForm({ ...form, ratedVoltage: e.target.value })
                }
                className="p-2 rounded border"
              />

              <input
                type="number"
                placeholder="Current (A)"
                value={form.ratedCurrent}
                onChange={(e) =>
                  setForm({ ...form, ratedCurrent: e.target.value })
                }
                className="p-2 rounded border"
              />

              <input
                type="number"
                placeholder="Power (W)"
                value={form.ratedPower}
                onChange={(e) =>
                  setForm({ ...form, ratedPower: e.target.value })
                }
                className="p-2 rounded border"
              />

              <input
                type="number"
                step="0.01"
                placeholder="Power Factor"
                value={form.powerFactor}
                onChange={(e) =>
                  setForm({ ...form, powerFactor: e.target.value })
                }
                className="p-2 rounded border"
              />

              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="col-span-2 p-2 rounded border"
              />
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  setShowAdd(false);
                  setEditTarget(null);
                }}
                className="flex-1 py-2 rounded border"
              >
                Cancel
              </button>

              <button
                onClick={submitForm}
                disabled={saving}
                className="flex-1 py-2 rounded bg-blue-600 text-white"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`p-6 rounded-2xl w-96 ${modalBg}`}>
            <h3 className="text-xl font-bold text-red-500 mb-3">
              Confirm Deletion
            </h3>

            <p className="mb-4 text-sm">
              Delete gadget <b>{deleteTarget.name}</b>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 rounded border"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded bg-red-600 text-white"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
