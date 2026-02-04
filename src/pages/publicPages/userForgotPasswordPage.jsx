import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/connection";
import { ThemeContext } from "../../contexts/ThemeContext";

const ForgotPassword = () => {
  const { theme } = useContext(ThemeContext);
  
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState(""); // 'error' or 'success'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Request OTP
  const handleRequestOTP = async () => {
    if (!email) {
      setMsg("Please enter your email");
      setMsgType("error");
      return;
    }

    setLoading(true);
    setMsg("");
    
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMsg(res.data.message || "OTP sent to your email");
      setMsgType("success");
      setStep(2);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to send OTP");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp) {
      setMsg("Please enter the OTP");
      setMsgType("error");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      setMsg(res.data.message || "OTP verified successfully");
      setMsgType("success");
      setStep(3);
    } catch (err) {
      setMsg(err.response?.data?.message || "Invalid or expired OTP");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setMsg("Please fill all fields");
      setMsgType("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMsg("Passwords do not match");
      setMsgType("error");
      return;
    }

    if (newPassword.length < 6) {
      setMsg("Password must be at least 6 characters");
      setMsgType("error");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      setMsg(res.data.message || "Password reset successful");
      setMsgType("success");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to reset password");
      setMsgType("error");
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
          Forgot Password
        </h2>

        {/* Step Indicator */}
        <div className="flex justify-center mb-6 space-x-2">
          <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
          <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
          <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
        </div>

        {msg && (
          <p className={`${msgType === 'error' ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'} mb-3 text-sm text-center font-semibold`}>
            {msg}
          </p>
        )}

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
              Enter your registered email to receive an OTP
            </p>
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
            <button
              type="button"
              onClick={handleRequestOTP}
              className="w-full bg-blue-600 hover:bg-blue-700 
              text-white py-2 rounded transition-all"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}

        {/* Step 2: Enter OTP */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
              Enter the 6-digit OTP sent to {email}
            </p>
            <input
              type="text"
              placeholder="Enter OTP"
              maxLength="6"
              className="w-full p-3 bg-white dark:bg-[#0f172a] 
              border border-gray-400 dark:border-blue-500 
              text-gray-900 dark:text-white rounded text-center text-2xl tracking-widest
              focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleVerifyOTP}
              className="w-full bg-blue-600 hover:bg-blue-700 
              text-white py-2 rounded transition-all"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full bg-gray-500 hover:bg-gray-600 
              text-white py-2 rounded transition-all"
              disabled={loading}
            >
              Back
            </button>
          </div>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
              Enter your new password
            </p>
            <input
              type="password"
              placeholder="New Password"
              className="w-full p-3 bg-white dark:bg-[#0f172a] 
              border border-gray-400 dark:border-blue-500 
              text-gray-900 dark:text-white rounded 
              focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full p-3 bg-white dark:bg-[#0f172a] 
              border border-gray-400 dark:border-blue-500 
              text-gray-900 dark:text-white rounded 
              focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleResetPassword}
              className="w-full bg-blue-600 hover:bg-blue-700 
              text-white py-2 rounded transition-all"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        )}

        {/* Back to Login Link */}
        <div className="mt-6 text-center text-sm text-gray-700 dark:text-gray-300">
          Remember your password?{" "}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;