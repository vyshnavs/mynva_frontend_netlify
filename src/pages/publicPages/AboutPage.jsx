import { useState } from "react";

const AboutPage = () => {
  const [hoveredMember, setHoveredMember] = useState(null);

  const projectInfo = {
    title: "Smart Energy Meter System",
    description: "An IoT-based prepaid energy meter system with real-time monitoring, remote control capabilities, and AI-powered analytics. The system enables users to track their energy consumption, manage prepaid credits, and control connected modules through a web and mobile interface."
  };

  const guide = {
    name: "Prof. Anu Jayan",
    photo: "👩",
    department: "Department of Electrical Engineering"
  };

  const teamMembers = [
    {
      name: "Vyshnav S",
      photo: "👨‍💻",
      branch: "Electrical Engineering"
    },
    {
      name: "Muhammed Yaseen S",
      photo: "👨‍💻",
      branch: "Electrical Engineering"
    },
    {
      name: "Nidhin N K",
      photo: "👨‍💻",
      branch: "Electrical Engineering"
    },
    {
      name: "Minhaj T",
      photo: "👨‍💻",
      branch: "Electrical Engineering"
    }
  ];

  const technologies = [
    { name: "MongoDB", icon: "🍃" },
    { name: "Express.js", icon: "⚡" },
    { name: "React", icon: "⚛️" },
    { name: "Node.js", icon: "🟢" },
    { name: "LLM API", icon: "🤖" },
    { name: "IoT Sensors", icon: "📡" }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30 dark:from-gray-900 dark:via-slate-900 dark:to-gray-950">
      
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(14, 165, 233, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(14, 165, 233, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-400/10 dark:bg-cyan-500/10 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-float-slower" />

      <div className="relative z-10 container mx-auto px-6 py-20">
        
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-sm font-medium backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              About Our Project
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            {projectInfo.title}
          </h1>
        </div>

        {/* Project Description */}
        <div className="max-w-4xl mx-auto mb-16 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Project Overview</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {projectInfo.description}
            </p>
          </div>
        </div>

        {/* Project Guide */}
        <div className="max-w-4xl mx-auto mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Project Guide</h2>
          <div className="flex justify-center">
            <div className="p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 text-center max-w-sm w-full">
              <div className="w-32 h-32 flex items-center justify-center bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl text-6xl mx-auto mb-4 shadow-lg">
                {guide.photo}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{guide.name}</h3>
              <p className="text-cyan-600 dark:text-cyan-400 font-medium">{guide.department}</p>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="max-w-6xl mx-auto mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Team Members</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredMember(i)}
                onMouseLeave={() => setHoveredMember(null)}
                className="group p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-2 border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center"
              >
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 flex items-center justify-center bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl text-5xl transform group-hover:scale-110 transition-all duration-300 shadow-lg">
                    {member.photo}
                  </div>
                  {hoveredMember === i && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-cyan-500/50 animate-ping-slow" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{member.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{member.branch}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div className="max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Technology Stack</h2>
          <div className="p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {technologies.map((tech, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border border-cyan-400/20 dark:border-cyan-500/20 rounded-xl hover:scale-105 transition-all duration-300"
                >
                  <span className="text-3xl">{tech.icon}</span>
                  <span className="text-base font-semibold text-gray-900 dark:text-white">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
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
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-ping-slow { animation: ping-slow 2s ease-out infinite; }
      `}</style>
    </div>
  );
};

export default AboutPage;