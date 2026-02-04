import { useState, useContext } from "react";
import api from "../../api/connection";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../contexts/ThemeContext";
import { AuthContext } from "../../contexts/AuthContext.jsx";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const [stage, setStage] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { loadUser } = useContext(AuthContext);

  // 🔔 Toast message state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // STEP 1: Email + Password → Send OTP
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/admin/auth/login", { email, password });
      if (res.data.success) {
        setStage("otp");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Admin not found");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP → Login & Store Token
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/admin/auth/verify-otp", { email, otp });

      const token = res.data.token;
      const expiryTime = Date.now() + 60 * 60 * 1000;

      localStorage.setItem("token", token);
      localStorage.setItem("tokenExpiry", expiryTime.toString());
      loadUser();
      navigate("/admin/dashboard");
    } catch (err) {
      showToast(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`
        min-h-screen flex items-center justify-center
        px-4 py-10
        ${theme === "light" ? "bg-gray-100" : "bg-gray-900"}
      `}
    >
      {/* 🔔 FLOATING TOAST */}
      {toast && (
        <div
          className={`
            fixed top-20 left-1/2 -translate-x-1/2 z-50
            px-6 py-3 rounded-lg shadow-lg
            text-sm font-semibold
            transition
            ${
              toast.type === "error"
                ? "bg-red-600 text-white"
                : "bg-green-600 text-white"
            }
          `}
        >
          {toast.message}
        </div>
      )}

      {/* LOGIN STAGE */}
      {stage === "login" && (
        <form
          onSubmit={handleLogin}
          className={`
            w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-xl
            ${theme === "light" ? "bg-white" : "bg-gray-800"}
          `}
        >
          <h2
            className={`
              text-2xl font-bold mb-6 text-center
              ${theme === "light" ? "text-gray-900" : "text-white"}
            `}
          >
            Admin Login
          </h2>

          <input
            type="email"
            placeholder="Admin Email"
            className={`
              w-full p-3 mb-4 rounded border
              ${theme === "light"
                ? "bg-white border-gray-300 text-gray-900"
                : "bg-gray-900 border-gray-600 text-white"}
              focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            className={`
              w-full p-3 mb-6 rounded border
              ${theme === "light"
                ? "bg-white border-gray-300 text-gray-900"
                : "bg-gray-900 border-gray-600 text-white"}
              focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <button
            disabled={loading}
            className={`
              w-full py-3 rounded-lg font-semibold
              flex justify-center items-center gap-2
              text-white transition
              ${loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"}
            `}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      )}

      {/* OTP STAGE */}
      {stage === "otp" && (
        <form
          onSubmit={handleOtpVerify}
          className={`
            w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-xl
            ${theme === "light" ? "bg-white" : "bg-gray-800"}
          `}
        >
          <h2
            className={`
              text-2xl font-bold mb-6 text-center
              ${theme === "light" ? "text-gray-900" : "text-white"}
            `}
          >
            Enter OTP
          </h2>

          <input
            type="text"
            maxLength={6}
            placeholder="6-digit OTP"
            className={`
              w-full p-3 mb-6 rounded border text-center tracking-widest
              ${theme === "light"
                ? "bg-white border-gray-300 text-gray-900"
                : "bg-gray-900 border-gray-600 text-white"}
              focus:outline-none focus:ring-2 focus:ring-green-500
            `}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={loading}
          />

          <button
            disabled={loading}
            className={`
              w-full py-3 rounded-lg font-semibold
              flex justify-center items-center gap-2
              text-white transition
              ${loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"}
            `}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminLoginPage;
