import { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";

export default function SupportPage() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const faqs = [
    {
      q: "How do I add a new device?",
      a: "Click the 'Add Device' button on the dashboard and follow the setup wizard.",
    },
    {
      q: "How to recharge prepaid balance?",
      a: "Go to the Prepaid System page and click the Recharge button.",
    },
    {
      q: "Can I monitor multiple devices?",
      a: "Yes, you can add and monitor unlimited devices from your dashboard.",
    },
  ];

  return (
    <div className="space-y-6">
      <h2
        className={`text-2xl font-bold ${
          isDark ? "text-gray-100" : "text-gray-900"
        }`}
      >
        Support
      </h2>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className={`p-6 rounded-xl border ${
              isDark
                ? "bg-gray-800/50 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h3
              className={`font-semibold mb-2 ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {faq.q}
            </h3>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
