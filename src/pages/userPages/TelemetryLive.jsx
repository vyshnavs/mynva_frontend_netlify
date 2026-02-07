import { useEffect, useState } from "react";
import { join, leave, on, off } from "../../api/websocket";
import { useParams } from "react-router-dom";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Activity, Zap, Power, Gauge, Radio, Box } from "lucide-react";

export default function TelemetryLive() {
  const { deviceId } = useParams();
  const [telemetry, setTelemetry] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connected, setConnected] = useState(false);
  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    console.log(`[TelemetryLive] 🔌 Connecting to device ${deviceId}`);
    
    join(`device:${deviceId}`);
    setConnected(true);

    const handler = (payload) => {
      if (String(payload.deviceId) !== String(deviceId)) return;
      
      console.log(`[TelemetryLive] 📊 Received telemetry:`, payload.data);
      setTelemetry(payload.data);
      setLastUpdate(new Date());
      
      // Update historical data for charts
      setHistoricalData(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString(),
          voltage: payload.data.mainMeter.voltage,
          current: payload.data.mainMeter.current,
          power: payload.data.mainMeter.power,
          powerFactor: payload.data.mainMeter.powerFactor
        };
        const updated = [...prev, newPoint];
        return updated.slice(-20); // Keep last 20 data points
      });
    };

    on("telemetry:update", handler);

    return () => {
      console.log(`[TelemetryLive] 🔌 Disconnecting from device ${deviceId}`);
      off("telemetry:update", handler);
      leave(`device:${deviceId}`);
      setConnected(false);
    };
  }, [deviceId]);

  if (!connected) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm">Connecting to device...</span>
        </div>
      </div>
    );
  }

  if (!telemetry) {
    return (
      <div className="p-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">⏳ Waiting for live telemetry data...</div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Device ID: {deviceId}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-5 space-y-4 sm:space-y-5 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Live Telemetry</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Device: {deviceId}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm text-green-700 dark:text-green-400 font-medium">
              {lastUpdate?.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Meter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3.5 sm:p-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
          <Gauge className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
          Main Meter
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          <Card 
            label="Voltage" 
            value={`${telemetry.mainMeter.voltage.toFixed(1)} V`}
            icon={<Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          />
          <Card 
            label="Current" 
            value={`${telemetry.mainMeter.current.toFixed(1)} A`}
            icon={<Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          />
          <Card 
            label="Power" 
            value={`${Math.round(telemetry.mainMeter.power)} W`}
            icon={<Power className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          />
          <Card 
            label="Power Factor" 
            value={telemetry.mainMeter.powerFactor.toFixed(2)}
            icon={<Gauge className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          />
          <Card 
            label="Frequency" 
            value={`${telemetry.mainMeter.frequency.toFixed(2)} Hz`}
            icon={<Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          />
          <Card 
            label="Relay State" 
            value={telemetry.mainMeter.relayState ? "ON" : "OFF"}
            icon={<Power className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            isStatus={true}
            statusActive={telemetry.mainMeter.relayState}
          />
        </div>
      </div>

      {/* Charts Section */}
      {historicalData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {/* Voltage & Current Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3.5 sm:p-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Voltage & Current
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af"
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#9ca3af"
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  width={45}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#9ca3af"
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  width={45}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '11px',
                    padding: '6px 8px'
                  }}
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} iconSize={12} />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="voltage" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  name="Voltage (V)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="current" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                  name="Current (A)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Power Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3.5 sm:p-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Power Consumption
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af"
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  width={45}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '11px',
                    padding: '6px 8px'
                  }}
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} iconSize={12} />
                <Area 
                  type="monotone" 
                  dataKey="power" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  name="Power (W)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Modules */}
      {telemetry.modules && telemetry.modules.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3.5 sm:p-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Box className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
            Connected Modules ({telemetry.modules.length})
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {telemetry.modules.map((module, idx) => (
              <ModuleCard key={idx} module={module} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ label, value, icon, isStatus, statusActive }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-2.5 sm:p-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
        <span className="text-gray-600 dark:text-gray-400">{icon}</span>
        <span className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        {isStatus ? (
          <div className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-xs sm:text-sm font-semibold ${
            statusActive 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {value}
          </div>
        ) : (
          <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
        )}
      </div>
    </div>
  );
}

function ModuleCard({ module }) {
  // Calculate module statistics
  const moduleStats = module.units && module.units.length > 0 ? {
    totalPower: module.units.reduce((sum, unit) => sum + unit.power, 0),
    avgVoltage: module.units.reduce((sum, unit) => sum + unit.voltage, 0) / module.units.length,
    avgCurrent: module.units.reduce((sum, unit) => sum + unit.current, 0) / module.units.length,
    activeUnits: module.units.filter(u => u.relayState).length
  } : null;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-3.5 bg-gray-50 dark:bg-gray-700/30">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 sm:gap-3 mb-3">
        <h4 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white flex items-center gap-2">
          <Box className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
          <span className="break-all text-sm sm:text-base">{module.moduleId}</span>
        </h4>
        {moduleStats && (
          <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
            <div className="px-2.5 py-1 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600">
              <span className="text-gray-500 dark:text-gray-400">Total: </span>
              <span className="font-semibold text-gray-900 dark:text-white">{Math.round(moduleStats.totalPower)} W</span>
            </div>
            <div className="px-2.5 py-1 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600">
              <span className="text-gray-500 dark:text-gray-400">Active: </span>
              <span className="font-semibold text-gray-900 dark:text-white">{moduleStats.activeUnits}/{module.units.length}</span>
            </div>
          </div>
        )}
      </div>
      
      {module.units && module.units.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 mb-3">
            {module.units.map((unit, idx) => (
              <UnitCard key={idx} unit={unit} />
            ))}
          </div>
          
          {/* Module Bar Chart */}
          <div className="mt-3 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <h5 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2.5">Unit Power Distribution</h5>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={module.units.map(u => ({ name: `U${u.unitIndex}`, power: u.power }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af"
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  width={40}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '11px',
                    padding: '6px 8px'
                  }}
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
                <Bar dataKey="power" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm text-center py-6">
          No unit data available
        </div>
      )}
    </div>
  );
}

function UnitCard({ unit }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 sm:p-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
          Unit {unit.unitIndex}
        </span>
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
            unit.health === "OK" ? "bg-green-500" : 
            unit.health === "WARNING" ? "bg-yellow-500" : "bg-red-500"
          }`}></div>
          <span className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-300">{unit.health}</span>
        </div>
      </div>
      
      <div className="space-y-1 text-xs sm:text-sm mb-2">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Voltage:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{unit.voltage.toFixed(1)} V</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Current:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{unit.current.toFixed(1)} A</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Power:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{Math.round(unit.power)} W</span>
        </div>
      </div>
      
      <div className={`text-center py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-semibold ${
        unit.relayState 
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
      }`}>
        {unit.relayState ? "● ACTIVE" : "○ INACTIVE"}
      </div>
    </div>
  );
}