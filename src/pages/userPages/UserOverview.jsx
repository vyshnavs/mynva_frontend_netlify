import { useEffect, useState, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api/connection";
import { getToken, decodeToken } from "../../utils/auth";
import { ThemeContext } from "../../contexts/ThemeContext";

export default function UserOverview() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const outletContext = useOutletContext();
  const devices = outletContext?.devices || [];
  const devicesLoading = outletContext?.devicesLoading ?? false;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) return setError("No authentication token found");

        const decoded = decodeToken(token);
        if (!decoded?._id) return setError("Invalid token");

        const res = await api.get("/user/profile");
        setUser(res.data.user);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.name || user.email || "User";
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className={`space-y-4 sm:space-y-6 ${isDark ? "text-gray-100" : "text-gray-900"}`}>

      {/* ================= PROFILE HEADER ================= */}
      <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-4 sm:p-6`}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {user.documents?.photo ? (
            <img
              src={user.documents.photo}
              alt={displayName}
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-4 border-green-500 object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-4 border-green-500 flex items-center justify-center text-2xl sm:text-3xl font-bold bg-green-600 text-white flex-shrink-0">
              {firstLetter}
            </div>
          )}

          <div className="text-center sm:text-left flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold break-words">{displayName}</h1>
            <p className={`text-sm sm:text-base break-all mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{user.email}</p>
            <p className="text-green-600 font-semibold capitalize text-sm sm:text-base mt-1">{user.role}</p>
          </div>
        </div>
      </div>

      {/* ================= CONTACT INFO ================= */}
      <Section title="Contact Information" isDark={isDark}>
        <InfoField label="Email" value={user.email} isDark={isDark} />
        <InfoField label="Phone" value={user.phone} isDark={isDark} />
        <InfoField label="Mobile" value={user.mobile} isDark={isDark} />
        <InfoField label="Gender" value={user.gender} isDark={isDark} />
        <InfoField label="Job" value={user.job} isDark={isDark} />
      </Section>

      {/* ================= ADDRESS ================= */}
      {user.address && (
        <Section title="Address Details" isDark={isDark}>
          <InfoField label="Building" value={user.address.building} isDark={isDark} />
          <InfoField label="Street" value={user.address.street} isDark={isDark} />
          <InfoField label="District" value={user.address.district} isDark={isDark} />
          <InfoField label="Pincode" value={user.address.pincode} isDark={isDark} />
          <InfoField label="Full Address" value={user.address.fullAddress} full isDark={isDark} />
        </Section>
      )}

      {/* ================= DOCUMENT LINKS ================= */}
      {user.documents && (user.documents.idProof || user.documents.addressProof) && (
        <Section title="Documents" isDark={isDark}>
          {user.documents.idProof && (
            <DocLink label="ID Proof" url={user.documents.idProof} isDark={isDark} />
          )}
          {user.documents.addressProof && (
            <DocLink label="Address Proof" url={user.documents.addressProof} isDark={isDark} />
          )}
        </Section>
      )}

      {/* ================= DEVICES - MOBILE CARDS / DESKTOP TABLE ================= */}
      <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg sm:rounded-xl shadow-md sm:shadow-lg overflow-hidden`}>
        <div className="bg-indigo-600 px-4 sm:px-6 py-3">
          <h2 className="text-white text-base sm:text-lg md:text-xl font-bold">My Devices</h2>
        </div>

        <div className="p-3 sm:p-4 md:p-6">
          {devicesLoading ? (
            <p className="text-center py-4">Loading devices...</p>
          ) : devices.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No devices paired.</p>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="block md:hidden space-y-3">
                {devices.map((d) => (
                  <DeviceCard key={d.deviceId} device={d} isDark={isDark} />
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full w-full border-collapse text-sm">
                  <thead className={`${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                    <tr>
                      <Th>Device ID</Th>
                      <Th>Name</Th>
                      <Th>Location</Th>
                      <Th>Status</Th>
                      <Th>Last Energy</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((d) => (
                      <tr key={d.deviceId} className={`border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                        <Td>{d.deviceId}</Td>
                        <Td className="whitespace-nowrap">{d.meterName || "—"}</Td>
                        <Td className="break-words">{d.location || "—"}</Td>
                        <Td>
                          <span className={d.isOnline ? "text-green-600" : "text-red-600"}>
                            {d.isOnline ? "Online" : "Offline"}
                          </span>
                        </Td>
                        <Td className="whitespace-nowrap">
                          {d.lastEnergyReading ?? "—"}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= MOBILE DEVICE CARD ================= */
function DeviceCard({ device, isDark }) {
  return (
    <div className={`${isDark ? "bg-gray-700/50" : "bg-gray-50"} rounded-lg p-3 border ${isDark ? "border-gray-600" : "border-gray-200"}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{device.meterName || "Unnamed Device"}</h3>
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"} mt-0.5`}>ID: {device.deviceId}</p>
        </div>
        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
          device.isOnline 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
        }`}>
          {device.isOnline ? "Online" : "Offline"}
        </span>
      </div>
      
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className={isDark ? "text-gray-400" : "text-gray-500"}>Location:</span>
          <span className="font-medium text-right ml-2 break-words">{device.location || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className={isDark ? "text-gray-400" : "text-gray-500"}>Last Energy:</span>
          <span className="font-medium">{device.lastEnergyReading ?? "—"}</span>
        </div>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function Section({ title, children, isDark }) {
  return (
    <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4`}>
      <h2 className="sm:col-span-2 text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">{title}</h2>
      {children}
    </div>
  );
}

function InfoField({ label, value, full, isDark }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-500"} mb-0.5 sm:mb-1`}>{label}</p>
      <p className="font-medium break-words text-sm sm:text-base">{value || "—"}</p>
    </div>
  );
}

function DocLink({ label, url, isDark }) {
  return (
    <div>
      <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-500"} mb-0.5 sm:mb-1`}>{label}</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all text-sm sm:text-base">
        View document
      </a>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-3 py-2 text-left font-semibold whitespace-nowrap text-sm">
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return (
    <td className={`px-3 py-2 align-top text-sm ${className}`}>
      {children}
    </td>
  );
}