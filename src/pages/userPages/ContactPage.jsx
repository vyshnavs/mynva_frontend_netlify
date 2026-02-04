import { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";

export default function ContactPage() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <div className="space-y-6">
      <h2
        className={`text-2xl font-bold ${
          isDark ? "text-gray-100" : "text-gray-900"
        }`}
      >
        Contact Us
      </h2>

      <div
        className={`p-6 rounded-xl border ${
          isDark
            ? "bg-gray-800/50 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="space-y-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Name
            </label>
            <input
              type="text"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? "bg-gray-900 border-gray-700 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Email
            </label>
            <input
              type="email"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? "bg-gray-900 border-gray-700 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Message
            </label>
            <textarea
              rows="4"
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? "bg-gray-900 border-gray-700 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>

          <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium">
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}
