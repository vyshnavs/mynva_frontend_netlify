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
      <div className="p-6">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-blue-600 rounded-full animate-spin"></div>
          <span>Connecting to device...</span>
        </div>
      </div>
    );
  }

  if (!telemetry) {
    return (
      <div className="p-6">
        <div className="text-gray-500 dark:text-gray-400">⏳ Waiting for live telemetry data...</div>
        <div className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Device ID: {deviceId}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Live Telemetry</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Device ID: {deviceId}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 dark:text-green-400 font-medium">
              {lastUpdate?.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Meter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Gauge className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          Main Meter
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card 
            label="Voltage" 
            value={`${telemetry.mainMeter.voltage.toFixed(1)} V`}
            icon={<Zap className="w-4 h-4" />}
          />
          <Card 
            label="Current" 
            value={`${telemetry.mainMeter.current.toFixed(1)} A`}
            icon={<Activity className="w-4 h-4" />}
          />
          <Card 
            label="Power" 
            value={`${Math.round(telemetry.mainMeter.power)} W`}
            icon={<Power className="w-4 h-4" />}
          />
          <Card 
            label="Power Factor" 
            value={telemetry.mainMeter.powerFactor.toFixed(2)}
            icon={<Gauge className="w-4 h-4" />}
          />
          <Card 
            label="Frequency" 
            value={`${telemetry.mainMeter.frequency.toFixed(2)} Hz`}
            icon={<Radio className="w-4 h-4" />}
          />
          <Card 
            label="Relay State" 
            value={telemetry.mainMeter.relayState ? "ON" : "OFF"}
            icon={<Power className="w-4 h-4" />}
            isStatus={true}
            statusActive={telemetry.mainMeter.relayState}
          />
        </div>
      </div>

      {/* Charts Section */}
      {historicalData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Voltage & Current Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Voltage & Current
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#9ca3af"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#9ca3af"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  label={{ value: 'Current (A)', angle: 90, position: 'insideRight', fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Power Consumption
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  label={{ value: 'Power (W)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Box className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            Connected Modules ({telemetry.modules.length})
          </h3>
          <div className="space-y-4">
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
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 dark:text-gray-400">{icon}</span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        {isStatus ? (
          <div className={`px-3 py-1 rounded-md text-sm font-semibold ${
            statusActive 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {value}
          </div>
        ) : (
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
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
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/30">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h4 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
          <Box className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          {module.moduleId}
        </h4>
        {moduleStats && (
          <div className="flex gap-3 text-sm">
            <div className="px-3 py-1 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600">
              <span className="text-gray-500 dark:text-gray-400">Total: </span>
              <span className="font-semibold text-gray-900 dark:text-white">{Math.round(moduleStats.totalPower)} W</span>
            </div>
            <div className="px-3 py-1 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600">
              <span className="text-gray-500 dark:text-gray-400">Active: </span>
              <span className="font-semibold text-gray-900 dark:text-white">{moduleStats.activeUnits}/{module.units.length}</span>
            </div>
          </div>
        )}
      </div>
      
      {module.units && module.units.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-4">
            {module.units.map((unit, idx) => (
              <UnitCard key={idx} unit={unit} />
            ))}
          </div>
          
          {/* Module Bar Chart */}
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Unit Power Distribution</h5>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={module.units.map(u => ({ name: `U${u.unitIndex}`, power: u.power }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  label={{ value: 'Power (W)', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 11 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
                <Bar dataKey="power" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
          No unit data available
        </div>
      )}
    </div>
  );
}

function UnitCard({ unit }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
          Unit {unit.unitIndex}
        </span>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${
            unit.health === "OK" ? "bg-green-500" : 
            unit.health === "WARNING" ? "bg-yellow-500" : "bg-red-500"
          }`}></div>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{unit.health}</span>
        </div>
      </div>
      
      <div className="space-y-1.5 text-sm mb-2">
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
      
      <div className={`text-center py-1.5 rounded-md text-xs font-semibold ${
        unit.relayState 
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
      }`}>
        {unit.relayState ? "● ACTIVE" : "○ INACTIVE"}
      </div>
    </div>
  );
}