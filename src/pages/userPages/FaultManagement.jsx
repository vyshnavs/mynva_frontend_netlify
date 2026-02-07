import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { join, leave, on, off } from "../../api/websocket";
import api from "../../api/connection";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  Filter,
  Calendar,
  Zap,
  Box,
  Loader2
} from "lucide-react";

export default function FaultManagement() {
  const { deviceId } = useParams();
  const [faults, setFaults] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState({ isResolved: "all", severity: "all" });
  const [connected, setConnected] = useState(false);
  
  const observerTarget = useRef(null);
  const LIMIT = 10;

  // ===============================
  // INITIAL LOAD & WEBSOCKET SETUP
  // ===============================
  useEffect(() => {
    // Reset and load initial data
    setFaults([]);
    setPage(0);
    setHasMore(true);
    fetchInitialFaults();
    fetchStats();
    
    if (deviceId) {
      join(`device:${deviceId}`);
      setConnected(true);

      const faultHandler = (payload) => {
        if (String(payload.deviceId) === String(deviceId)) {
          // Add new fault to the top
          setFaults(prev => [payload.fault, ...prev]);
          setTotal(prev => prev + 1);
          fetchStats();
        }
      };

      on("fault:new", faultHandler);

      return () => {
        off("fault:new", faultHandler);
        leave(`device:${deviceId}`);
        setConnected(false);
      };
    }
  }, [deviceId, filter]);

  // ===============================
  // INFINITE SCROLL OBSERVER
  // ===============================
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMoreFaults();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMore, loading, page]);

  // ===============================
  // FETCH INITIAL FAULTS
  // ===============================
  const fetchInitialFaults = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      queryParams.append("limit", LIMIT);
      queryParams.append("skip", 0);
      
      if (filter.isResolved !== "all") {
        queryParams.append("isResolved", filter.isResolved);
      }
      if (filter.severity !== "all") {
        queryParams.append("severity", filter.severity);
      }

      const url = deviceId 
        ? `/user/device/${deviceId}/faults?${queryParams}`
        : `/user/faults?${queryParams}`;

      const res = await api.get(url);
      setFaults(res.data.faults || []);
      setTotal(res.data.total || 0);
      setHasMore((res.data.faults || []).length >= LIMIT);
      setPage(1);
    } catch (err) {
      console.error("Failed to fetch faults:", err);
      setFaults([]);
      setTotal(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // LOAD MORE FAULTS (PAGINATION)
  // ===============================
  const loadMoreFaults = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const queryParams = new URLSearchParams();
      
      queryParams.append("limit", LIMIT);
      queryParams.append("skip", page * LIMIT);
      
      if (filter.isResolved !== "all") {
        queryParams.append("isResolved", filter.isResolved);
      }
      if (filter.severity !== "all") {
        queryParams.append("severity", filter.severity);
      }

      const url = deviceId 
        ? `/user/device/${deviceId}/faults?${queryParams}`
        : `/user/faults?${queryParams}`;

      const res = await api.get(url);
      const newFaults = res.data.faults || [];
      
      setFaults(prev => [...prev, ...newFaults]);
      setHasMore(newFaults.length >= LIMIT);
      setPage(prev => prev + 1);
    } catch (err) {
      console.error("Failed to load more faults:", err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  // ===============================
  // FETCH STATS
  // ===============================
  const fetchStats = async () => {
    if (!deviceId) return;
    try {
      const res = await api.get(`/user/device/${deviceId}/faults/stats`);
      setStats(res.data.stats);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      setStats(null);
    }
  };

  // ===============================
  // RESOLVE FAULT
  // ===============================
  const resolveFault = async (faultId) => {
    try {
      await api.patch(`/user/faults/${faultId}/resolve`);
      
      // Update the fault in the list
      setFaults(prev => 
        prev.map(fault => 
          fault._id === faultId 
            ? { ...fault, isResolved: true, resolvedAt: new Date() }
            : fault
        )
      );
      
      fetchStats();
    } catch (err) {
      console.error("Failed to resolve fault:", err);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
      case "warning": return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case "info": return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      default: return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical": return <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "warning": return <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "info": return <Info className="w-4 h-4 sm:w-5 sm:h-5" />;
      default: return <Info className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header - Mobile Optimized */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Fault Management</h2>
            {deviceId && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Device ID: {deviceId}</p>
            )}
          </div>
          {connected && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm text-green-700 dark:text-green-400 font-medium">Live</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats - Mobile Optimized Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
          <StatCard label="Total" value={stats.total} color="gray" />
          <StatCard label="Critical" value={stats.critical} color="red" />
          <StatCard label="Warning" value={stats.warning} color="yellow" />
          <StatCard label="Info" value={stats.info} color="blue" />
          <StatCard label="Resolved" value={stats.resolved} color="green" />
        </div>
      )}

      {/* Filters - Mobile Optimized */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-3">
          <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Filters</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <select
            value={filter.isResolved}
            onChange={(e) => setFilter({ ...filter, isResolved: e.target.value })}
            className="px-2.5 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value={false}>Active</option>
            <option value={true}>Resolved</option>
          </select>
          <select
            value={filter.severity}
            onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
            className="px-2.5 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* Fault List - Mobile Optimized */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Fault History ({total})
        </h3>
        
        {loading ? (
          <div className="flex justify-center py-8 sm:py-12">
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : faults.length === 0 ? (
          <div className="text-center py-12 sm:py-16 text-gray-500 dark:text-gray-400">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-green-500" />
            <p className="text-base sm:text-lg font-medium">No faults found</p>
            <p className="text-xs sm:text-sm mt-1">All systems operating normally</p>
          </div>
        ) : (
          <>
            <div className="space-y-2.5 sm:space-y-3">
              {faults.map((fault) => (
                <FaultCard
                  key={fault._id}
                  fault={fault}
                  onResolve={resolveFault}
                  getSeverityColor={getSeverityColor}
                  getSeverityIcon={getSeverityIcon}
                />
              ))}
            </div>

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex justify-center py-4 sm:py-6">
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-blue-600" />
              </div>
            )}

            {/* Intersection Observer Target */}
            {hasMore && !loadingMore && (
              <div ref={observerTarget} className="h-4" />
            )}

            {/* End of List Message */}
            {!hasMore && faults.length > 0 && (
              <div className="text-center py-4 sm:py-6 text-gray-500 dark:text-gray-400">
                <p className="text-xs sm:text-sm">You've reached the end of the list</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    gray: "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white",
    red: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",
  };

  return (
    <div className={`rounded-lg p-3 sm:p-4 ${colors[color]}`}>
      <p className="text-xs sm:text-sm font-medium opacity-80">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold mt-0.5 sm:mt-1">{value}</p>
    </div>
  );
}

function FaultCard({ fault, onResolve, getSeverityColor, getSeverityIcon }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-3">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2.5 sm:gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border ${getSeverityColor(fault.severity)}`}>
                {getSeverityIcon(fault.severity)}
                {fault.severity.toUpperCase()}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                {fault.source === "mainMeter" ? <Zap className="w-3 h-3" /> : <Box className="w-3 h-3" />}
                {fault.source === "mainMeter" ? "Main Meter" : `Module ${fault.moduleId}`}
                {fault.unitNumber && ` - Unit ${fault.unitNumber}`}
              </span>
            </div>
            
            <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1 leading-tight">
              {fault.faultType.replace(/_/g, ' ').toUpperCase()}
            </h4>
            
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
              {fault.description}
            </p>
            
            {fault.measuredValue && (
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                Measured: <span className="font-semibold">{fault.measuredValue} {fault.unit}</span>
                {fault.thresholdValue && (
                  <span className="block sm:inline sm:ml-1">
                    (Threshold: {fault.thresholdValue} {fault.unit})
                  </span>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {new Date(fault.createdAt).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          {fault.isResolved ? (
            <div className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md text-xs sm:text-sm font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Resolved
            </div>
          ) : (
            <button
              onClick={() => onResolve(fault._id)}
              className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-md text-xs sm:text-sm font-semibold transition-colors"
            >
              Mark Resolved
            </button>
          )}
        </div>
      </div>
    </div>
  );
}