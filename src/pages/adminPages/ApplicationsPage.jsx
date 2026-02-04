import { useEffect, useState, useContext } from "react";
import AdminLayout from "../../layouts/admin/AdminLayout";
import ApplicationTable from "../../components/adminComp/applicationComp/ApplicationTable";
import ApplicationDetailsModal from "../../components/adminComp/applicationComp/ApplicationDetailsModal";
import ApproveApplicationModal from "../../components/adminComp/applicationComp/ApproveApplicationModal";
import RejectApplicationModal from "../../components/adminComp/applicationComp/RejectApplicationModal";
import api from "../../api/connection";
import { ThemeContext } from "../../contexts/ThemeContext";

export default function ApplicationsPage() {
  const { theme } = useContext(ThemeContext);

  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  
  const [filters, setFilters] = useState({ status: "ALL", search: "" });
  
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/applications/stats");
      setStats(res.data.stats);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const fetchApplications = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        status: filters.status !== "ALL" ? filters.status : undefined,
        search: filters.search || undefined,
      };

      const res = await api.get("/admin/applications", { params });
      setApplications(res.data.applications || []);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchApplications();
  }, []);

  useEffect(() => {
    fetchApplications(1);
  }, [filters]);

  const handleViewDetails = (app) => {
    setSelectedApplication(app);
    setShowDetails(true);
  };

  const handleApprove = (app) => {
    setSelectedApplication(app);
    setShowApprove(true);
  };

  const handleReject = (app) => {
    setSelectedApplication(app);
    setShowReject(true);
  };

  const handleActionComplete = () => {
    fetchApplications(pagination.page);
    fetchStats();
    setShowApprove(false);
    setShowReject(false);
    setShowDetails(false);
    setSelectedApplication(null);
  };

  const handlePageChange = (newPage) => {
    fetchApplications(newPage);
  };

  return (
    <AdminLayout>
      <div className={theme === "dark" ? "text-gray-100" : "text-gray-900"}>
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Applications</h2>
          <p className="text-gray-500">Manage electricity connection applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg shadow ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <p className="text-sm text-gray-500">Total Applications</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className={`p-4 rounded-lg shadow ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <p className="text-sm text-yellow-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className={`p-4 rounded-lg shadow ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <p className="text-sm text-green-600">Approved</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className={`p-4 rounded-lg shadow ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <p className="text-sm text-red-600">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-lg shadow mb-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email, or application ID..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className={`w-full p-2 rounded border ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className={`p-2 rounded border ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4">Loading applications...</p>
          </div>
        ) : (
          <>
            <ApplicationTable
              applications={applications}
              onViewDetails={handleViewDetails}
              onApprove={handleApprove}
              onReject={handleReject}
              theme={theme}
            />

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-4 py-2 rounded ${
                    pagination.page === 1
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className={`px-4 py-2 rounded ${
                    pagination.page === pagination.pages
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals - ONLY RENDER IF selectedApplication EXISTS */}
      {showDetails && selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          close={() => {
            setShowDetails(false);
            setSelectedApplication(null);
          }}
          onApprove={() => {
            setShowDetails(false);
            handleApprove(selectedApplication);
          }}
          onReject={() => {
            setShowDetails(false);
            handleReject(selectedApplication);
          }}
          theme={theme}
        />
      )}

      {showApprove && selectedApplication && (
        <ApproveApplicationModal
          application={selectedApplication}
          close={() => {
            setShowApprove(false);
            setSelectedApplication(null);
          }}
          onSuccess={handleActionComplete}
          theme={theme}
        />
      )}

      {showReject && selectedApplication && (
        <RejectApplicationModal
          application={selectedApplication}
          close={() => {
            setShowReject(false);
            setSelectedApplication(null);
          }}
          onSuccess={handleActionComplete}
          theme={theme}
        />
      )}
    </AdminLayout>
  );
}