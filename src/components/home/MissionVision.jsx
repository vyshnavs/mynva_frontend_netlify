import { useState } from "react";

const MissionVision = () => {
  const [activeTab, setActiveTab] = useState("mission");

  const content = {
    mission: {
      title: "Our Mission",
      icon: "🎯",
      text: "To provide a smart, efficient, and transparent energy management system that empowers every household with real-time insights and intelligent control over their energy consumption.",
      highlights: [
        "Smart energy monitoring",
        "Transparent billing",
        "User empowerment"
      ]
    },
    vision: {
      title: "Our Vision",
      icon: "🌟",
      text: "To revolutionize energy management globally by making sustainable consumption accessible, intuitive, and rewarding for every household, reducing costs while protecting our planet.",
      highlights: [
        "Global sustainability",
        "Cost reduction",
        "Environmental impact"
      ]
    }
  };

  const stats = [
    { value: "50K+", label: "Active Users", color: "cyan" },
    { value: "2M+", label: "kWh Saved", color: "blue" },
    { value: "35%", label: "Avg. Cost Reduction", color: "violet" }
  ];

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-white via-cyan-50/20 to-blue-50/30 dark:from-gray-900 dark:via-slate-900 dark:to-gray-950">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(14, 165, 233, 0.03) 2px, transparent 2px),
                           linear-gradient(90deg, rgba(14, 165, 233, 0.03) 2px, transparent 2px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Floating Orbs */}
      <div className="absolute top-40 left-20 w-96 h-96 bg-cyan-400/10 dark:bg-cyan-500/10 rounded-full blur-3xl animate-float-diagonal" />
      <div className="absolute bottom-20 right-40 w-80 h-80 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-float-reverse" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-400/10 dark:bg-violet-500/10 rounded-full blur-3xl animate-pulse-slow" />

      <div className="relative z-10 container mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-sm font-medium backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              About Us
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Driving the Future of
            <span className="block mt-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 bg-clip-text text-transparent animate-gradient">
              Energy Innovation
            </span>
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex p-1.5 bg-gray-200/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-300 dark:border-gray-700 shadow-lg">
            {Object.keys(content).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`relative px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === key
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {activeTab === key && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg animate-slide-in" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-xl">{content[key].icon}</span>
                  {content[key].title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Card */}
        <div className="max-w-5xl mx-auto mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative p-10 md:p-14 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-violet-500/5 dark:from-cyan-500/10 dark:via-blue-500/10 dark:to-violet-500/10" />
            
            {/* Animated Border Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 rounded-3xl blur-2xl opacity-20 animate-pulse-glow" />

            <div className="relative z-10">
              {/* Large Icon */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur-2xl opacity-30 animate-pulse-slow" />
                  <div className="relative w-24 h-24 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl text-5xl shadow-2xl transform hover:scale-110 hover:rotate-6 transition-all duration-300">
                    {content[activeTab].icon}
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-6">
                {content[activeTab].title}
              </h3>
              
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed text-center max-w-3xl mx-auto mb-8">
                {content[activeTab].text}
              </p>

              {/* Highlights */}
              <div className="flex flex-wrap justify-center gap-4">
                {content[activeTab].highlights.map((highlight, i) => (
                  <div
                    key={i}
                    className="group px-6 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 dark:border-cyan-500/30 rounded-full backdrop-blur-sm hover:scale-105 transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                  >
                    <span className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300 font-medium">
                      <svg className="w-5 h-5 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative Corner Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-bl-full transform translate-x-16 -translate-y-16" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/10 to-violet-500/10 rounded-tr-full transform -translate-x-16 translate-y-16" />
          </div>
        </div>

      </div>

      <style>{`
        @keyframes float-diagonal {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(40px, -40px); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-30px, 30px); }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.5; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        
        .animate-float-diagonal { animation: float-diagonal 10s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 12s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient 3s ease infinite; 
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-ping-slow { animation: ping-slow 2s ease-out infinite; }
      `}</style>
    </section>
  );
};

export default MissionVision;