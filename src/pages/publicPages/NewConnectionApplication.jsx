import { useState, useContext, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import api from "../../api/connection";
import { ThemeContext } from "../../contexts/ThemeContext";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

const NewConnectionApplication = () => {
  const { theme } = useContext(ThemeContext);
  const captchaRef = useRef(null);

  const [step, setStep] = useState("instructions");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [captchaToken, setCaptchaToken] = useState(null);

  const [submittedData, setSubmittedData] = useState(null);
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    building: "",
    street: "",
    localBody: "",
    district: "",
    pincode: "",
    consent: false,
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [id, setId] = useState(null);
  const [idPreview, setIdPreview] = useState(null);
  const [addressProof, setAddressProof] = useState(null);
  const [addressProofPreview, setAddressProofPreview] = useState(null);

  const inputBase =
    theme === "light"
      ? "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
      : "bg-gray-900 border-gray-600 text-white placeholder-gray-400";

  const fileBase =
    theme === "light"
      ? "bg-gray-50 border-gray-300 text-gray-800"
      : "bg-gray-900 border-gray-600 text-gray-200";

  const labelColor = theme === "light" ? "text-gray-700" : "text-gray-300";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const validateFile = (file, setter, previewSetter, allowedTypes) => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a file." });
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: "error", text: "Invalid file format." });
      setter(null);
      previewSetter(null);
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage({ type: "error", text: "File size must be under 1 MB." });
      setter(null);
      previewSetter(null);
      return false;
    }

    setter(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      previewSetter(reader.result);
    };
    reader.readAsDataURL(file);

    setMessage(null);
    return true;
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!form.name || !form.email) {
      setMessage({
        type: "error",
        text: "Please enter your name and email address.",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await api.post("/public/application/send-otp", {
        email: form.email,
        name: form.name,
      });

      setMessage({
        type: "success",
        text: "OTP sent to your email!",
      });
      startResendTimer();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to send OTP.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setMessage({ type: "error", text: "Please enter a valid 6-digit OTP." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await api.post("/public/application/verify-email", {
        email: form.email,
        otp,
      });

      setEmailVerified(true);
      setMessage({
        type: "success",
        text: "Email verified successfully!",
      });

      setTimeout(() => {
        setStep("form");
        setMessage(null);
      }, 1500);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Invalid OTP. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    setMessage(null);

    try {
      await api.post("/public/application/resend-otp", {
        email: form.email,
        name: form.name,
      });

      setMessage({ type: "success", text: "New OTP sent to your email!" });
      setOtp("");
      startResendTimer();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to resend OTP.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!emailVerified) {
      setMessage({ type: "error", text: "Please verify your email first." });
      return;
    }

    if (
      !form.name ||
      !form.email ||
      !form.mobile ||
      !form.building ||
      !form.street ||
      !form.localBody ||
      !form.district ||
      !form.pincode
    ) {
      setMessage({
        type: "error",
        text: "Please fill all applicant and address details.",
      });
      return;
    }

    if (!photo || !id || !addressProof) {
      setMessage({ type: "error", text: "Please upload all required documents." });
      return;
    }

    if (!form.consent) {
      setMessage({ type: "error", text: "Please accept the declaration." });
      return;
    }

    if (!captchaToken) {
      setMessage({
        type: "error",
        text: "Please complete the CAPTCHA verification.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.append("photo", photo);
      formData.append("id", id);
      formData.append("addressProof", addressProof);
      formData.append("captchaToken", captchaToken);

      const res = await api.post("/public/application/new", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmittedData({
        applicationId: res.data?.applicationId,
        ...form,
      });

      setStep("success");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Submission failed. Please try again.",
      });
      if (captchaRef.current) {
        captchaRef.current.reset();
        setCaptchaToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = `
NEW ELECTRICITY CONNECTION APPLICATION
========================================

Application Reference: ${submittedData.applicationId}

APPLICANT DETAILS
-----------------
Name: ${submittedData.name}
Email: ${submittedData.email}
Mobile: ${submittedData.mobile}

CONNECTION ADDRESS
------------------
Building: ${submittedData.building}
Street: ${submittedData.street}
Local Body: ${submittedData.localBody}
District: ${submittedData.district}
Pincode: ${submittedData.pincode}

This is a computer-generated application form.
Date: ${new Date().toLocaleDateString()}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Application_${submittedData.applicationId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`min-h-screen px-4 py-16 print:bg-white ${
        theme === "light" ? "bg-gray-100" : "bg-gray-900"
      }`}
    >
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-700 font-semibold">Processing...</p>
          </div>
        </div>
      )}

      <div
        className={`max-w-3xl mx-auto rounded-2xl shadow-xl p-6 sm:p-8 print:shadow-none ${
          theme === "light" ? "bg-white" : "bg-gray-800"
        }`}
      >
        {step === "instructions" && (
          <>
            <h1 className={`text-3xl font-bold mb-6 text-center ${labelColor}`}>
              New Domestic Electricity Connection
            </h1>

            <ul className={`list-disc pl-5 space-y-2 text-sm ${labelColor}`}>
              <li>Applicable only for LT Single-Phase Domestic supply</li>
              <li>Maximum sanctioned load: <b>5 kW</b></li>
              <li>Above 5 kW requires three-phase supply</li>
              <li><b>Email verification required before application submission</b></li>
              <li><b>One application per email address only</b></li>
              <li>You can only reapply if your previous application was <b>rejected</b></li>
              <li>All fields and documents are mandatory</li>
              <li>Connection subject to KSEB site inspection</li>
            </ul>

            <div className={`flex gap-2 mt-6 ${labelColor}`}>
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <span>I have read and understood the instructions</span>
            </div>

            <button
              disabled={!accepted}
              onClick={() => setStep("emailVerify")}
              className={`w-full mt-6 py-3 rounded-lg text-white font-semibold transition-all ${
                accepted
                  ? "bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Proceed to Email Verification
            </button>
          </>
        )}

        {step === "emailVerify" && (
          <div className="space-y-6">
            <h1 className={`text-3xl font-bold text-center ${labelColor}`}>
              📧 Verify Your Email
            </h1>

            <p className={`text-center ${labelColor}`}>
              First, verify your email address to proceed with the application
            </p>

            {message && (
              <div
                className={`p-3 rounded text-center font-semibold ${
                  message.type === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <div>
              <label className={`block mb-2 text-sm font-medium ${labelColor}`}>
                Full Name *
              </label>
              <input
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                disabled={emailVerified}
                className={`w-full p-3 rounded border ${inputBase}`}
              />
            </div>

            <div>
              <label className={`block mb-2 text-sm font-medium ${labelColor}`}>
                Email Address *
              </label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={form.email}
                onChange={handleChange}
                disabled={emailVerified}
                className={`w-full p-3 rounded border ${inputBase}`}
              />
            </div>

            {!emailVerified && (
              <button
                onClick={handleSendOtp}
                disabled={loading || resendTimer > 0}
                className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                  loading || resendTimer > 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500"
                }`}
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Send OTP"}
              </button>
            )}

            {resendTimer === 0 && !emailVerified && otp === "" && (
              <p className={`text-sm text-center ${labelColor}`}>
                Click "Send OTP" to receive verification code
              </p>
            )}

            {(resendTimer > 0 || otp.length > 0) && !emailVerified && (
              <>
                <div>
                  <label className={`block mb-2 text-sm font-medium ${labelColor}`}>
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className={`w-full p-3 rounded border text-center text-2xl tracking-widest ${inputBase}`}
                  />
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                    loading || otp.length !== 6
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-blue-400 hover:from-green-600 hover:to-blue-500"
                  }`}
                >
                  Verify Email
                </button>

                <div className="text-center">
                  <button
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || loading}
                    className={`text-sm ${
                      resendTimer > 0 || loading
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-600 hover:underline"
                    }`}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>
              </>
            )}

            {emailVerified && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-700 font-semibold">
                  ✅ Email verified successfully!
                </p>
                <p className="text-sm text-green-600 mt-2">
                  Redirecting to application form...
                </p>
              </div>
            )}
          </div>
        )}

        {step === "form" && (
          <div className="space-y-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center mb-4">
              <p className="text-green-700 font-semibold text-sm">
                ✅ Email Verified: {form.email}
              </p>
            </div>

            <h1 className={`text-3xl font-bold text-center ${labelColor}`}>
              Application Form
            </h1>

            {message && (
              <div
                className={`p-3 rounded text-center font-semibold ${
                  message.type === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <section>
              <h2 className={`font-semibold mb-4 ${labelColor}`}>
                Applicant Details *
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  disabled
                  className={`p-3 rounded border ${
                    theme === "light"
                      ? "bg-gray-100 text-gray-600"
                      : "bg-gray-700 text-gray-400"
                  }`}
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  disabled
                  className={`p-3 rounded border ${
                    theme === "light"
                      ? "bg-gray-100 text-gray-600"
                      : "bg-gray-700 text-gray-400"
                  }`}
                />
                <input
                  name="mobile"
                  type="tel"
                  placeholder="Mobile Number"
                  value={form.mobile}
                  onChange={handleChange}
                  className={`p-3 rounded border ${inputBase}`}
                />
              </div>
            </section>

            <section>
              <h2 className={`font-semibold mb-4 ${labelColor}`}>
                Connection Address *
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="building"
                  placeholder="Building/House Name"
                  value={form.building}
                  onChange={handleChange}
                  className={`p-3 rounded border ${inputBase}`}
                />
                <input
                  name="street"
                  placeholder="Street/Road"
                  value={form.street}
                  onChange={handleChange}
                  className={`p-3 rounded border ${inputBase}`}
                />
                <input
                  name="localBody"
                  placeholder="Local Body/City"
                  value={form.localBody}
                  onChange={handleChange}
                  className={`p-3 rounded border ${inputBase}`}
                />
                <input
                  name="district"
                  placeholder="District"
                  value={form.district}
                  onChange={handleChange}
                  className={`p-3 rounded border ${inputBase}`}
                />
                <input
                  name="pincode"
                  placeholder="Pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  className={`p-3 rounded border ${inputBase}`}
                />
              </div>
            </section>

            <section>
              <h2 className={`font-semibold mb-4 ${labelColor}`}>
                Documents (≤ 1 MB) *
              </h2>

              <div className="mb-4">
                <label className={`block mb-2 text-sm font-medium ${labelColor}`}>
                  Passport Size Photo (JPEG/PNG)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className={`w-full p-3 rounded border ${fileBase}`}
                  onChange={(e) =>
                    validateFile(e.target.files[0], setPhoto, setPhotoPreview, [
                      "image/jpeg",
                      "image/png",
                    ])
                  }
                />
                {photoPreview && (
                  <div className="mt-2">
                    <img
                      src={photoPreview}
                      alt="Photo preview"
                      className="h-32 rounded border"
                    />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className={`block mb-2 text-sm font-medium ${labelColor}`}>
                  ID Proof (Aadhaar/PAN/Voter ID - JPEG/PNG/PDF)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  className={`w-full p-3 rounded border ${fileBase}`}
                  onChange={(e) =>
                    validateFile(e.target.files[0], setId, setIdPreview, [
                      "image/jpeg",
                      "image/png",
                      "application/pdf",
                    ])
                  }
                />
                {idPreview && (
                  <div className="mt-2">
                    {id?.type === "application/pdf" ? (
                      <p className="text-sm text-green-600">
                        ✓ PDF uploaded: {id.name}
                      </p>
                    ) : (
                      <img
                        src={idPreview}
                        alt="ID preview"
                        className="h-32 rounded border"
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className={`block mb-2 text-sm font-medium ${labelColor}`}>
                  Address Proof (Aadhaar/Ration Card - JPEG/PNG/PDF)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  className={`w-full p-3 rounded border ${fileBase}`}
                  onChange={(e) =>
                    validateFile(
                      e.target.files[0],
                      setAddressProof,
                      setAddressProofPreview,
                      ["image/jpeg", "image/png", "application/pdf"]
                    )
                  }
                />
                {addressProofPreview && (
                  <div className="mt-2">
                    {addressProof?.type === "application/pdf" ? (
                      <p className="text-sm text-green-600">
                        ✓ PDF uploaded: {addressProof.name}
                      </p>
                    ) : (
                      <img
                        src={addressProofPreview}
                        alt="Address proof preview"
                        className="h-32 rounded border"
                      />
                    )}
                  </div>
                )}
              </div>
            </section>

            <div className={`flex gap-2 ${labelColor}`}>
              <input
                type="checkbox"
                name="consent"
                checked={form.consent}
                onChange={handleChange}
              />
              <span>I declare that all information provided is true and correct.</span>
            </div>

            <div className="flex justify-center">
              <ReCAPTCHA
                ref={captchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={setCaptchaToken}
                theme={theme === "dark" ? "dark" : "light"}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500"
              }`}
            >
              Submit Application
            </button>
          </div>
        )}

        {step === "success" && submittedData && (
          <>
            <h1 className="text-3xl font-bold text-center text-green-600 mb-2">
              ✅ Application Submitted Successfully
            </h1>

            <p className={`text-center mb-6 ${labelColor}`}>
              Your application has been submitted successfully. You will receive
              updates via email.
            </p>

            <div className="text-center mb-6">
              <p className={`text-sm ${labelColor}`}>Application Reference</p>
              <p className="text-xl font-bold text-blue-600">
                {submittedData.applicationId}
              </p>
            </div>

            <div className={`text-sm space-y-2 print:text-black ${labelColor}`}>
              <p>
                <b>Name:</b> {submittedData.name}
              </p>
              <p>
                <b>Email:</b> {submittedData.email}
              </p>
              <p>
                <b>Mobile:</b> {submittedData.mobile}
              </p>
              <p>
                <b>Address:</b> {submittedData.building}, {submittedData.street},{" "}
                {submittedData.localBody}, {submittedData.district} –{" "}
                {submittedData.pincode}
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                🖨 Print Application
              </button>

              <button
                onClick={handleDownload}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                📥 Download Application
              </button>

              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
              >
                New Application
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NewConnectionApplication;