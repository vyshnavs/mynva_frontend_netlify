import { useState } from "react";

const Features = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const features = [
    { 
      title: "Real-time Monitoring", 
      desc: "Track your energy usage live with millisecond precision and interactive dashboards.",
      icon: "⚡",
      color: "cyan"
    },
    { 
      title: "AI Suggestions", 
      desc: "Optimize usage using smart insights powered by machine learning algorithms.",
      icon: "🤖",
      color: "blue"
    },
    { 
      title: "Secure Payments", 
      desc: "Recharge instantly with bank-grade security and multiple payment options.",
      icon: "🔒",
      color: "violet"
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      cyan: {
        gradient: "from-cyan-500 to-blue-500",
        text: "text-cyan-600 dark:text-cyan-400",
        border: "border-cyan-500/30",
        glow: "shadow-cyan-500/20",
        bg: "bg-cyan-500/10"
      },
      blue: {
        gradient: "from-blue-500 to-violet-500",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-500/30",
        glow: "shadow-blue-500/20",
        bg: "bg-blue-500/10"
      },
      violet: {
        gradient: "from-violet-500 to-purple-500",
        text: "text-violet-600 dark:text-violet-400",
        border: "border-violet-500/30",
        glow: "shadow-violet-500/20",
        bg: "bg-violet-500/10"
      }
    };
    return colors[color];
  };

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(14, 165, 233, 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Floating Gradient Orbs */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-cyan-400/10 dark:bg-cyan-500/10 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute bottom-40 left-10 w-72 h-72 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-float-slower" />

      <div className="relative z-10 container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-sm font-medium backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Key Features
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Powerful Features for
            <span className="block mt-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 bg-clip-text text-transparent animate-gradient">
              Smart Energy Management
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need to monitor, optimize, and control your energy consumption in one intelligent platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, i) => {
            const colorClasses = getColorClasses(feature.color);
            const isHovered = hoveredIndex === i;
            
            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`group relative p-8 bg-white dark:bg-gray-800 rounded-2xl border-2 ${colorClasses.border} shadow-lg hover:shadow-2xl ${colorClasses.glow} transition-all duration-500 hover:-translate-y-3 animate-fade-in-up cursor-pointer overflow-hidden`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Animated Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Glow Effect on Hover */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${colorClasses.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

                <div className="relative z-10">
                  {/* Icon with animated background */}
                  <div className="relative inline-block mb-6">
                    <div className={`absolute inset-0 ${colorClasses.bg} rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />
                    <div className={`relative w-16 h-16 flex items-center justify-center bg-gradient-to-br ${colorClasses.gradient} rounded-2xl text-3xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                      {feature.icon}
                    </div>
                    
                    {/* Pulsing ring */}
                    {isHovered && (
                      <div className={`absolute inset-0 rounded-2xl border-2 ${colorClasses.border} animate-ping-slow`} />
                    )}
                  </div>

                  {/* Content */}
                  <h3 className={`text-2xl font-bold ${colorClasses.text} mb-3 group-hover:translate-x-1 transition-transform duration-300`}>
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.desc}
                  </p>

                  {/* Animated arrow indicator */}
                  <div className={`mt-6 flex items-center gap-2 ${colorClasses.text} font-semibold text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-2`}>
                    Learn more
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>

                {/* Corner decoration */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClasses.gradient} opacity-5 rounded-bl-full transform translate-x-12 -translate-y-12 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-500`} />
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-40px, 40px); }
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
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 10s ease-in-out infinite; }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient 3s ease infinite; 
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-ping-slow { animation: ping-slow 2s ease-out infinite; }
      `}</style>
    </section>
  );
};

export default Features;