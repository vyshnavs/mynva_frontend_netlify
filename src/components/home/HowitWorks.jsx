import { useState } from "react";

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: "01",
      title: "Install Device",
      desc: "Our certified technician installs the smart meter at your location in under 2 hours. Plug-and-play setup with zero downtime.",
      icon: "🔧",
      color: "cyan"
    },
    {
      number: "02",
      title: "Connect & Configure",
      desc: "Link your meter to our cloud platform via WiFi or 4G. Configure modules and set up your dashboard in minutes.",
      icon: "📡",
      color: "blue"
    },
    {
      number: "03",
      title: "Monitor Real-time",
      desc: "Track live energy consumption across all modules. View instant insights, analytics, and usage patterns on any device.",
      icon: "📊",
      color: "violet"
    },
    {
      number: "04",
      title: "Optimize & Save",
      desc: "Get AI-powered recommendations to reduce waste. Control modules remotely and watch your savings grow month over month.",
      icon: "💡",
      color: "green"
    }
  ];

  const colorClasses = {
    cyan: {
      gradient: "from-cyan-500 to-blue-500",
      bg: "bg-cyan-500",
      text: "text-cyan-600 dark:text-cyan-400",
      border: "border-cyan-500",
      ring: "ring-cyan-500/20"
    },
    blue: {
      gradient: "from-blue-500 to-indigo-500",
      bg: "bg-blue-500",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-500",
      ring: "ring-blue-500/20"
    },
    violet: {
      gradient: "from-violet-500 to-purple-500",
      bg: "bg-violet-500",
      text: "text-violet-600 dark:text-violet-400",
      border: "border-violet-500",
      ring: "ring-violet-500/20"
    },
    green: {
      gradient: "from-green-500 to-emerald-500",
      bg: "bg-green-500",
      text: "text-green-600 dark:text-green-400",
      border: "border-green-500",
      ring: "ring-green-500/20"
    }
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-gray-50 dark:bg-gray-950">
      
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-3xl animate-float-slower" />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16 md:mb-20 animate-fade-in">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-sm font-semibold">
              Simple Process
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
            How It Works
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Get started in 4 simple steps. From installation to optimization, we make energy management effortless.
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block max-w-6xl mx-auto mb-20">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 via-violet-500 to-green-500 opacity-20" />
            <div 
              className="absolute top-24 left-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 via-violet-500 to-green-500 transition-all duration-1000 ease-out"
              style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
            />

            <div className="grid grid-cols-4 gap-8">
              {steps.map((step, index) => {
                const colors = colorClasses[step.color];
                const isActive = index === activeStep;
                const isPassed = index < activeStep;

                return (
                  <div
                    key={index}
                    className="relative cursor-pointer"
                    onMouseEnter={() => setActiveStep(index)}
                  >
                    {/* Step Number Circle */}
                    <div className={`
                      relative mx-auto w-48 h-48 rounded-full flex items-center justify-center
                      transition-all duration-500
                      ${isActive ? `scale-110 ring-8 ${colors.ring}` : 'scale-100'}
                      ${isPassed ? 'ring-4 ring-gray-300 dark:ring-gray-700' : ''}
                    `}>
                      {/* Glow Effect */}
                      <div className={`
                        absolute inset-0 bg-gradient-to-r ${colors.gradient} rounded-full blur-2xl
                        transition-opacity duration-500
                        ${isActive ? 'opacity-60' : 'opacity-0'}
                      `} />
                      
                      {/* Circle Background */}
                      <div className={`
                        relative w-full h-full rounded-full border-4 flex flex-col items-center justify-center
                        transition-all duration-500
                        ${isActive 
                          ? `bg-gradient-to-br ${colors.gradient} ${colors.border} text-white shadow-2xl` 
                          : isPassed
                            ? `bg-white dark:bg-gray-800 ${colors.border} ${colors.text}`
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400'
                        }
                      `}>
                        <span className="text-5xl mb-2">{step.icon}</span>
                        <span className={`text-3xl font-bold ${isActive ? 'text-white' : ''}`}>
                          {step.number}
                        </span>
                      </div>
                    </div>

                    {/* Step Details */}
                    <div className={`
                      mt-8 text-center transition-all duration-500
                      ${isActive ? 'scale-105' : 'scale-100'}
                    `}>
                      <h3 className={`
                        text-xl font-bold mb-3 transition-colors duration-300
                        ${isActive ? colors.text : 'text-gray-700 dark:text-gray-300'}
                      `}>
                        {step.title}
                      </h3>
                      <p className={`
                        text-sm leading-relaxed transition-all duration-500
                        ${isActive 
                          ? 'text-gray-700 dark:text-gray-300 opacity-100' 
                          : 'text-gray-500 dark:text-gray-500 opacity-70'
                        }
                      `}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Stack */}
        <div className="lg:hidden max-w-2xl mx-auto space-y-8">
          {steps.map((step, index) => {
            const colors = colorClasses[step.color];
            
            return (
              <div
                key={index}
                className="relative animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-6">
                  {/* Number Circle */}
                  <div className="relative flex-shrink-0">
                    <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} rounded-full blur-xl opacity-30`} />
                    <div className={`
                      relative w-20 h-20 rounded-full border-4 ${colors.border}
                      bg-gradient-to-br ${colors.gradient}
                      flex flex-col items-center justify-center shadow-xl text-white
                    `}>
                      <span className="text-2xl">{step.icon}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-4xl font-bold ${colors.text}`}>{step.number}</span>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="ml-10 mt-4 mb-4 h-12 w-1 bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-700 dark:to-transparent" />
                )}
              </div>
            );
          })}
        </div>

      </div>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, 40px) scale(1.1); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 12s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        
        .animation-delay-600 { animation-delay: 0.6s; }
      `}</style>
    </section>
  );
};

export default HowItWorks;