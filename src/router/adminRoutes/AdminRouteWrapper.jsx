import { Navigate } from "react-router-dom";
import { getToken, decodeToken } from "../../utils/auth";

export default function AdminRouteWrapper({ children }) {
  const token = getToken();

  if (!token) return <Navigate to="/admin/login" />;

  const decoded = decodeToken(token);

  if (!decoded || decoded.role !== "admin") {
    return <Navigate to="/admin/login" />;
  }

  return children;
}
