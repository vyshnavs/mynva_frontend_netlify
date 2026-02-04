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
    <div className={`space-y-6 p-4 sm:p-6 ${isDark ? "text-gray-100" : "text-gray-900"}`}>

      {/* ================= PROFILE HEADER ================= */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {user.documents?.photo ? (
            <img
              src={user.documents.photo}
              alt={displayName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-green-500 object-cover"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-green-500 flex items-center justify-center text-3xl font-bold bg-green-600 text-white">
              {firstLetter}
            </div>
          )}

          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold break-words">{displayName}</h1>
            <p className="text-gray-500 break-all">{user.email}</p>
            <p className="text-green-600 font-semibold capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* ================= CONTACT INFO ================= */}
      <Section title="Contact Information">
        <InfoField label="Email" value={user.email} />
        <InfoField label="Phone" value={user.phone} />
        <InfoField label="Mobile" value={user.mobile} />
        <InfoField label="Gender" value={user.gender} />
        <InfoField label="Job" value={user.job} />
      </Section>

      {/* ================= ADDRESS ================= */}
      {user.address && (
        <Section title="Address Details">
          <InfoField label="Building" value={user.address.building} />
          <InfoField label="Street" value={user.address.street} />
          <InfoField label="District" value={user.address.district} />
          <InfoField label="Pincode" value={user.address.pincode} />
          <InfoField label="Full Address" value={user.address.fullAddress} full />
        </Section>
      )}

      {/* ================= DOCUMENT LINKS ================= */}
      {user.documents && (
        <Section title="Documents">
          {user.documents.idProof && (
            <DocLink label="ID Proof" url={user.documents.idProof} />
          )}
          {user.documents.addressProof && (
            <DocLink label="Address Proof" url={user.documents.addressProof} />
          )}
        </Section>
      )}

      {/* ================= DEVICES TABLE ================= */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-indigo-600 px-4 sm:px-6 py-3">
          <h2 className="text-white text-lg sm:text-xl font-bold">My Devices</h2>
        </div>

        <div className="p-4 sm:p-6 overflow-x-auto">
          {devicesLoading ? (
            <p>Loading devices...</p>
          ) : devices.length === 0 ? (
            <p>No devices paired.</p>
          ) : (
            <table className="min-w-[720px] w-full border-collapse text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
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
                  <tr key={d.deviceId} className="border-t">
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
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function Section({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <h2 className="sm:col-span-2 text-lg sm:text-xl font-bold">{title}</h2>
      {children}
    </div>
  );
}

function InfoField({ label, value, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium break-words">{value || "—"}</p>
    </div>
  );
}

function DocLink({ label, url }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline break-all"
      >
        View in browser
      </a>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return (
    <td className={`px-3 py-2 align-top ${className}`}>
      {children}
    </td>
  );
}
