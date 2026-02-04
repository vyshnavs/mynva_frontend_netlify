import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { getToken, decodeToken } from "../../utils/auth";
import { initSocket } from "../../api/websocket";

export default function UserRouteWrapper({ children }) {
  const token = getToken();

  if (!token) return <Navigate to="/login" />;

  const decoded = decodeToken(token);

  if (!decoded || decoded.role !== "user") {
    return <Navigate to="/" />;
  }

  // ✅ Initialize socket ONCE per session
  useEffect(() => {
    initSocket();
  }, []);

  return children;
}
