import { useEffect, useState, useContext } from "react";
import AdminLayout from "../../layouts/admin/AdminLayout";
import AddPolicyModal from "../../components/adminComp/BillingPolicycomp/AddPolicyModal";
import EditPolicyModal from "../../components/adminComp/BillingPolicycomp/EditPolicyModal";
import PolicyTable from "../../components/adminComp/BillingPolicycomp/PolicyTable";
import api from "../../api/connection";
import { ThemeContext } from "../../contexts/ThemeContext";

export default function BillingPage() {
  const { theme } = useContext(ThemeContext);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editPolicy, setEditPolicy] = useState(null);

  const fetchPolicies = async () => {
    try {
      const res = await api.get("/admin/billing");
      setPolicies(res.data.policies || []);
    } catch (err) {
      console.error("Failed to fetch policies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return (
    <AdminLayout>
      <div className={theme === "dark" ? "text-gray-100" : "text-gray-900"}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Billing Policies</h2>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700 transition"
          >
            + Add Policy
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <PolicyTable
            policies={policies}
            refresh={fetchPolicies}
            setEditPolicy={setEditPolicy}
          />
        )}
      </div>

      {showAdd && (
        <AddPolicyModal close={() => setShowAdd(false)} refresh={fetchPolicies} />
      )}

      {editPolicy && (
        <EditPolicyModal
          policy={editPolicy}
          close={() => setEditPolicy(null)}
          refresh={fetchPolicies}
        />
      )}
    </AdminLayout>
  );
}