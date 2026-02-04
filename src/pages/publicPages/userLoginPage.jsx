import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
import api from "../../api/connection";
import { ThemeContext } from "../../contexts/ThemeContext";
import { AuthContext } from "../../contexts/AuthContext.jsx";

const Login = () => {
  const { theme } = useContext(ThemeContext); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loadUser } = useContext(AuthContext);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res.data.accessToken;
      const expiryTime = Date.now() + 60 * 60 * 1000;
      localStorage.setItem("token", token);
      localStorage.setItem("tokenExpiry", expiryTime.toString());
      loadUser();
      navigate("/");
    } catch (err) {
      setMsg(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/google-login", {
        token: credentialResponse.credential,
      });
      const token = res.data.accessToken;
      const expiryTime = Date.now() + 60 * 60 * 1000;
      localStorage.setItem("token", token);
      localStorage.setItem("tokenExpiry", expiryTime.toString());
      loadUser();
      navigate("/");
    } catch (err) {
      setMsg(err.response?.data?.message || "Google Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center 
      bg-gradient-to-br from-gray-100 to-gray-300 
      dark:from-[#0f172a] dark:to-[#1e293b] 
      px-4 transition-all"
    >
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative bg-white dark:bg-[#1e293b] 
        bg-opacity-90 dark:bg-opacity-80 
        backdrop-blur-md border border-gray-300 dark:border-blue-800 
        p-10 rounded-2xl shadow-2xl w-full max-w-md transition-all"
      >
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-2xl">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <h2 className="text-3xl font-bold mb-4 text-center 
        text-gray-800 dark:text-blue-400 transition">
          Login
        </h2>

        {msg && (
          <p className="text-red-500 dark:text-red-400 mb-3 text-sm text-center font-semibold">
            {msg}
          </p>
        )}

        {/* Inputs */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 bg-white dark:bg-[#0f172a] 
            border border-gray-400 dark:border-blue-500 
            text-gray-900 dark:text-white rounded 
            focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-white dark:bg-[#0f172a] 
            border border-gray-400 dark:border-blue-500 
            text-gray-900 dark:text-white rounded 
            focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button
            type="button"
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 
            text-white py-2 rounded transition-all"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        {/* Forgot Password Link */}
        <div className="mt-4 text-center text-sm text-gray-700 dark:text-gray-300">
          <Link to="/forgot-password" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Forgot Password?
          </Link>
        </div>

        {/* Divider */}
        <div className="mt-6 flex items-center">
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          <span className="px-3 text-sm text-gray-500 dark:text-gray-400">OR</span>
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        {/* Google Login */}
        <div className="mt-6 flex justify-center">
          {!loading && (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setMsg("Google Sign In Failed")}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;