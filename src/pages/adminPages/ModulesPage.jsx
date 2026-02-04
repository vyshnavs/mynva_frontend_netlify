import { useEffect, useState, useContext, useMemo } from "react";
import AdminLayout from "../../layouts/admin/AdminLayout";
import api from "../../api/connection";
import { ThemeContext } from "../../contexts/ThemeContext";
import {
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import AddModuleModal from "../../components/adminComp/moduleComp/AddModuleModal";

export default function ModulesPage() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");

  // -------------------------
  // FETCH MODULES
  // -------------------------
  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/modules");
      setModules(res.data.modules || []);
    } catch (err) {
      console.error("Failed to fetch modules", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  // -------------------------
  // SEARCH FILTER
  // -------------------------
  const filteredModules = useMemo(() => {
    if (!search.trim()) return modules;
    const q = search.toLowerCase();

    return modules.filter((m) =>
      [
        m.moduleId,
        m.hardwareSerialNumber,
        m.connectedMainMeterId,
        m.connectedUserEmail,
      ]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [modules, search]);

  // -------------------------
  // DOWNLOAD CREDENTIAL FILE
  // -------------------------
  const downloadCredentials = (content, moduleId) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `module-${moduleId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // -------------------------
  // REGENERATE SECRET
  // -------------------------
  const regenerateSecret = async (id) => {
    if (!confirm("Regenerate secret? Old secret will become invalid.")) return;

    try {
      const res = await api.post(
        `/admin/modules/${id}/regenerate-secret`
      );

      if (res.data?.file && res.data?.moduleId) {
        downloadCredentials(res.data.file, res.data.moduleId);
      }

      alert("New secret generated and downloaded.");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to regenerate secret");
    }
  };

  // -------------------------
  // DELETE MODULE
  // -------------------------
  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;

    try {
      setDeleting(true);
      await api.delete(`/admin/modules/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchModules();
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const th =
    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap";
  const td = "px-4 py-3 text-sm align-middle whitespace-nowrap";

  return (
    <AdminLayout>
      <div className={isDark ? "text-gray-100" : "text-gray-900"}>
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h2 className="text-3xl font-bold">Slave Cluster Modules</h2>

          <div className="flex gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search ID / Serial / User / Meter"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-xl border w-full lg:w-96 ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>

            <button
              onClick={() => setShowAdd(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl shadow-md"
            >
              + Register Module
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
                <th className={th}>Module ID</th>
                <th className={th}>Serial</th>
                <th className={th}>Capacity</th>
                <th className={th}>Status</th>
                <th className={th}>Main Meter</th>
                <th className={th}>User</th>
                <th className={th}>Location</th>
                <th className={th}>Paired At</th>
                <th className={`${th} text-center`}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-gray-400">
                    Loading modules...
                  </td>
                </tr>
              )}

              {!loading && filteredModules.length === 0 && (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-gray-400">
                    No modules found
                  </td>
                </tr>
              )}

              {filteredModules.map((m) => (
                <tr
                  key={m._id}
                  className={`border-t ${
                    isDark ? "border-gray-800" : "border-gray-200"
                  } hover:bg-blue-500/5`}
                >
                  <td className={`${td} font-mono text-xs`}>
                    {m.moduleId}
                  </td>
                  <td className={`${td} font-mono text-xs`}>
                    {m.hardwareSerialNumber}
                  </td>
                  <td className={td}>{m.slaveCapacity}</td>
                  <td className={td}>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        m.isPaired
                          ? "bg-green-600 text-white"
                          : "bg-yellow-500 text-black"
                      }`}
                    >
                      {m.isPaired ? "Paired" : "Unpaired"}
                    </span>
                  </td>
                  <td className={td}>{m.connectedMainMeterId || "-"}</td>
                  <td className={td}>{m.connectedUserEmail || "-"}</td>
                  <td className={td}>{m.location || "-"}</td>
                  <td className={td}>
                    {m.pairedAt
                      ? new Date(m.pairedAt).toLocaleString()
                      : "-"}
                  </td>

                  <td className={`${td} text-center`}>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => regenerateSecret(m._id)}
                        className="p-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white"
                        title="Regenerate Secret"
                      >
                        <ArrowPathIcon className="w-4 h-4" />
                      </button>

                      <button
                        disabled={m.isPaired}
                        onClick={() => setDeleteTarget(m)}
                        className={`p-2 rounded-lg ${
                          m.isPaired
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                        title="Delete"
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

      {showAdd && (
        <AddModuleModal
          close={() => setShowAdd(false)}
          refresh={fetchModules}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-2xl w-96 ${
              isDark ? "bg-gray-900 text-white" : "bg-white"
            }`}
          >
            <h3 className="text-xl font-bold text-red-500 mb-3">
              Confirm Deletion
            </h3>

            <p className="mb-4 text-sm">
              Delete module <b>{deleteTarget.moduleId}</b>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 rounded-lg border"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white"
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
