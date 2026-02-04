export default function AISuggestions() {
  const suggestions = [
    {
      title: "Reduce Peak Usage",
      desc: "Shift heavy appliance usage (AC, heater) to non-peak hours to save 18% monthly.",
    },
    {
      title: "Fault Detected",
      desc: "Unusual spike in Meter 2. Possible wiring issue.",
    },
    {
      title: "Upgrade Recommendation",
      desc: "Smart plug installation may reduce wastage by 12%.",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">AI Suggestions</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suggestions.map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold text-green-600">{s.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
