import { useEffect, useState } from "react";

const Advertisement = () => {
  const [power, setPower] = useState(2.4);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPower((prev) => {
        const value = Number(prev) + (Math.random() * 0.4 - 0.2);
        return Math.max(0.5, Math.min(5, Number(value.toFixed(2))));
      });
    }, 1200);

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);

    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(14, 165, 233, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(14, 165, 233, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          transform: `translateY(${scrollY * 0.3}px)`
        }} />
      </div>

      {/* Floating Energy Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-400/20 dark:bg-cyan-500/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-blue-400/20 dark:bg-blue-500/20 rounded-full blur-3xl animate-float-slower" />
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-violet-400/20 dark:bg-violet-500/20 rounded-full blur-3xl animate-float-medium" />
      </div>

      {/* Energy Wave Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-96 h-96 md:w-[600px] md:h-[600px] rounded-full border border-cyan-400/20 animate-pulse-ring" />
        <div className="absolute w-80 h-80 md:w-[500px] md:h-[500px] rounded-full border border-blue-400/20 animate-pulse-ring-delayed" />
        <div className="absolute w-64 h-64 md:w-[400px] md:h-[400px] rounded-full border border-violet-400/20 animate-pulse-ring-slow" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-block animate-fade-in-up">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-sm font-medium backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                Next-Gen Energy Solution
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white animate-fade-in-up animation-delay-100">
              Smart Energy
              <span className="block mt-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 bg-clip-text text-transparent animate-gradient">
                Meter System
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto lg:mx-0 animate-fade-in-up animation-delay-200">
              Monitor your energy consumption in real-time with AI-powered insights. 
              Control modules remotely, manage prepaid credits, and optimize your usage—all from one intelligent platform.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 animate-fade-in-up animation-delay-400">
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-bold text-cyan-600 dark:text-cyan-400">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Monitoring</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">99.9%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-bold text-violet-600 dark:text-violet-400">AI</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Powered</div>
              </div>
            </div>
          </div>

          {/* Right Content - 3D Meter */}
          <div className="flex justify-center lg:justify-end animate-fade-in-up animation-delay-500">
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-violet-500/30 blur-3xl animate-pulse-glow" />
              
              {/* Meter Device */}
              <div className="relative w-72 h-[480px] md:w-80 md:h-[520px] rounded-[2.5rem] bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-black border-8 border-gray-300 dark:border-gray-700 shadow-2xl overflow-hidden animate-float">
                
                {/* Screen */}
                <div className="mt-12 mx-auto w-60 md:w-64 h-40 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-gray-950 dark:to-black border-4 border-gray-400 dark:border-gray-600 shadow-inner p-6 relative overflow-hidden">
                  {/* Scan Line Effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent animate-scan-line" />
                  
                  <div className="relative z-10">
                    <div className="text-center mb-2">
                      <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient font-mono">
                        {power}
                      </div>
                      <div className="text-cyan-400 text-sm font-semibold tracking-wider">kW LIVE</div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-400 mt-4">
                      <div>
                        <div className="text-green-400 font-semibold">↑ 12.3</div>
                        <div>Peak</div>
                      </div>
                      <div>
                        <div className="text-yellow-400 font-semibold">~ 8.7</div>
                        <div>Avg</div>
                      </div>
                      <div>
                        <div className="text-blue-400 font-semibold">↓ 3.2</div>
                        <div>Low</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Module Status LEDs */}
                <div className="flex justify-center gap-8 mt-12">
                  <div className="text-center">
                    <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse-led mx-auto" />
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">Kitchen</div>
                  </div>
                  <div className="text-center">
                    <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50 animate-pulse-led animation-delay-200 mx-auto" />
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">Living</div>
                  </div>
                  <div className="text-center">
                    <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50 animate-pulse-led animation-delay-400 mx-auto" />
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">Bedroom</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mx-auto w-60 md:w-64 mt-8 px-4">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <span>Daily Usage</span>
                    <span>67%</span>
                  </div>
                  <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 rounded-full animate-progress" style={{width: '67%'}} />
                  </div>
                </div>

                {/* Bottom Label */}
                <div className="absolute bottom-8 left-0 right-0 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    IoT Connected
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600" />
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
          <span className="text-xs font-medium">Scroll to explore</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-40px, 40px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, 30px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.8; }
          50% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(0.8); opacity: 0.8; }
        }
        @keyframes pulse-ring-delayed {
          0% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 0.3; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }
        @keyframes pulse-ring-slow {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.2; }
          100% { transform: scale(1); opacity: 0.5; }
        }
        @keyframes pulse-led {
          0%, 100% { opacity: 1; box-shadow: 0 0 20px currentColor; }
          50% { opacity: 0.6; box-shadow: 0 0 10px currentColor; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 67%; }
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
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 10s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 7s ease-in-out infinite; }
        .animate-pulse-ring { animation: pulse-ring 3s ease-in-out infinite; }
        .animate-pulse-ring-delayed { animation: pulse-ring-delayed 3s ease-in-out infinite 0.5s; }
        .animate-pulse-ring-slow { animation: pulse-ring-slow 3s ease-in-out infinite 1s; }
        .animate-pulse-led { animation: pulse-led 2s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient 3s ease infinite; 
        }
        .animate-scan-line { animation: scan-line 3s linear infinite; }
        .animate-progress { animation: progress 2s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        
        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-500 { animation-delay: 0.5s; }
      `}</style>
    </section>
  );
};

export default Advertisement;