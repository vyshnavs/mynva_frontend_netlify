import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  DollarSign,
  BarChart3,
  Clock,
  Calendar,
  Activity,
  Gauge,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  MapPin,
  AlertTriangle,
  Info,
  Package
} from "lucide-react";
import api from "../../api/connection";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function AnalyticsPage() {
  const { deviceId } = useParams();
  
  const [analytics, setAnalytics] = useState([]);
  const [summary, setSummary] = useState(null);
  const [unitAnalytics, setUnitAnalytics] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [hourlyPattern, setHourlyPattern] = useState([]);
  const [loading, setLoading] = useState(true);
  const [interval, setInterval] = useState("1h");
  const [chartType, setChartType] = useState("area");
  const [metric, setMetric] = useState("energy");
  const [timeRange, setTimeRange] = useState("7d");
  const [expandedUnits, setExpandedUnits] = useState({});

  const intervals = [
    { value: "10min", label: "10 Min" },
    { value: "30min", label: "30 Min" },
    { value: "1h", label: "1 Hour" },
    { value: "6h", label: "6 Hours" },
    { value: "12h", label: "12 Hours" },
    { value: "1d", label: "1 Day" },
    { value: "1w", label: "1 Week" }
  ];

  const timeRanges = [
    { value: "1d", label: "24 Hours", days: 1 },
    { value: "7d", label: "7 Days", days: 7 },
    { value: "30d", label: "30 Days", days: 30 },
    { value: "90d", label: "90 Days", days: 90 }
  ];

  useEffect(() => {
    loadAnalytics();
    loadComparison();
    loadHourlyPattern();
  }, [deviceId, interval, timeRange]);

  const getDateRange = () => {
    const range = timeRanges.find(r => r.value === timeRange);
    const end = new Date();
    const start = new Date(end - range.days * 24 * 60 * 60 * 1000);
    return { start, end };
  };

  async function loadAnalytics() {
    setLoading(true);
    try {
      const { start, end } = getDateRange();
      const res = await api.get(
        `/user/analytics/${deviceId}?startDate=${start.toISOString()}&endDate=${end.toISOString()}&interval=${interval}`
      );
      setAnalytics(res.data.data.analytics);
      setSummary(res.data.data.summary);
      setUnitAnalytics(res.data.data.unitAnalytics || []);
    } catch (err) {
      console.error("Load analytics error:", err);
    }
    setLoading(false);
  }

  async function loadComparison() {
    try {
      const { start, end } = getDateRange();
      const res = await api.get(
        `/user/analytics/${deviceId}/comparison?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      );
      setComparison(res.data.comparison);
    } catch (err) {
      console.error("Load comparison error:", err);
    }
  }

  async function loadHourlyPattern() {
    try {
      const range = timeRanges.find(r => r.value === timeRange);
      const res = await api.get(
        `/user/analytics/${deviceId}/hourly-pattern?days=${range.days}`
      );
      setHourlyPattern(res.data.pattern);
    } catch (err) {
      console.error("Load hourly pattern error:", err);
    }
  }

  const toggleUnit = (unitId) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const chartData = useMemo(() => {
    return analytics.map(d => ({
      timestamp: new Date(d.timestamp).toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: interval.includes('min') ? '2-digit' : undefined,
        minute: interval.includes('min') ? '2-digit' : undefined
      }),
      energy: d.energy.consumed,
      cost: d.cost.amount,
      power: d.energy.avgPower,
      voltage: d.electrical.avgVoltage,
      current: d.electrical.avgCurrent,
      pf: d.electrical.avgPowerFactor
    }));
  }, [analytics, interval]);

  const hourlyChartData = useMemo(() => {
    return hourlyPattern.map(d => ({
      hour: `${d.hour}:00`,
      energy: d.avgUnits,
      cost: d.avgCost
    }));
  }, [hourlyPattern]);

  const metricConfig = {
    energy: { key: "energy", label: "Energy (kWh)", color: "#10b981", icon: Zap },
    cost: { key: "cost", label: "Cost (₹)", color: "#f59e0b", icon: DollarSign },
    power: { key: "power", label: "Power (W)", color: "#6366f1", icon: Activity },
    voltage: { key: "voltage", label: "Voltage (V)", color: "#ec4899", icon: Gauge }
  };

  const currentMetric = metricConfig[metric];

  const renderChart = (data, dataKey, color, height = 400) => {
    const chartData = data.map(d => ({
      timestamp: new Date(d.timestamp).toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: interval.includes('min') ? '2-digit' : undefined,
        minute: interval.includes('min') ? '2-digit' : undefined
      }),
      value: d[dataKey]
    }));

    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    const axisProps = {
      stroke: "#6b7280",
      style: { fontSize: "12px" }
    };

    switch (chartType) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={`url(#color-${dataKey})`}
              strokeWidth={2}
            />
          </AreaChart>
        );
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
              }}
            />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        );
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
              }}
            />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
    }
  };

  const renderMainChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    const axisProps = {
      stroke: "#6b7280",
      style: { fontSize: "12px" }
    };

    switch (chartType) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
              }}
            />
            <Area
              type="monotone"
              dataKey={currentMetric.key}
              stroke={currentMetric.color}
              fill="url(#colorMetric)"
              strokeWidth={2}
            />
          </AreaChart>
        );
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
              }}
            />
            <Line
              type="monotone"
              dataKey={currentMetric.key}
              stroke={currentMetric.color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        );
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timestamp" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
              }}
            />
            <Bar dataKey={currentMetric.key} fill={currentMetric.color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Usage Analytics</h1>
            <button
              onClick={loadAnalytics}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                {comparison && (
                  <span className={`text-xs font-semibold flex items-center gap-1 ${
                    comparison.change.energy >= 0 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {comparison.change.energy >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(comparison.change.energy).toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Energy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalEnergy} kWh</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                {comparison && (
                  <span className={`text-xs font-semibold flex items-center gap-1 ${
                    comparison.change.cost >= 0 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {comparison.change.cost >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(comparison.change.cost).toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{summary.totalCost}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Peak Power</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.peakPower} W</p>
              {summary.peakPowerTime && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {new Date(summary.peakPowerTime).toLocaleString('en-IN')}
                </p>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Gauge className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Cost/Unit</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{summary.avgCostPerUnit}</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Time Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                {timeRanges.map(range => (
                  <button
                    key={range.value}
                    onClick={() => setTimeRange(range.value)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      timeRange === range.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Interval
              </label>
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {intervals.map(int => (
                  <option key={int.value} value={int.value}>{int.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Metric
              </label>
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Object.entries(metricConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chart Type
              </label>
              <div className="flex gap-2">
                {['area', 'line', 'bar'].map(type => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                      chartType === type
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <currentMetric.icon className="w-5 h-5" style={{ color: currentMetric.color }} />
              {currentMetric.label}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {summary?.dataPoints} data points
            </span>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            {renderMainChart()}
          </ResponsiveContainer>
        </div>

        {/* Per-Unit Analytics */}
        {unitAnalytics.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Unit-wise Analytics</h2>
            
            {unitAnalytics.map(unit => (
              <div key={unit.unitId} className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-4 border border-gray-200 dark:border-gray-700">
                
                {/* Unit Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{unit.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        unit.status.healthStatus === 'good' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : unit.status.healthStatus === 'warning'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {unit.status.healthStatus}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        unit.status.isOnline
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                      }`}>
                        {unit.status.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    {unit.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{unit.description}</p>
                    )}
                    {unit.location && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {unit.location}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleUnit(unit.unitId)}
                    className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {expandedUnits[unit.unitId] ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>

                {/* Summary Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Energy</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{unit.summary.totalEnergy} kWh</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Power</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{unit.summary.avgPower} W</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Peak Power</p>
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{unit.summary.peakPower} W</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Peak Current</p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{unit.summary.peakCurrent} A</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Voltage</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{unit.summary.avgVoltage} V</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg PF</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{unit.summary.avgPowerFactor}</p>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedUnits[unit.unitId] && (
                  <>
                    {/* Thresholds */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        Configured Thresholds
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400">Max Voltage</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{unit.thresholds.maxVoltage} V</p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400">Min Voltage</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{unit.thresholds.minVoltage} V</p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400">Max Current</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{unit.thresholds.maxCurrent} A</p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400">Min Power Factor</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{unit.thresholds.minPowerFactor}</p>
                        </div>
                      </div>
                    </div>

                    {/* Connected Gadgets */}
                    {unit.connectedGadgets.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <Package className="w-4 h-4 text-blue-600" />
                          Connected Gadgets
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {unit.connectedGadgets.map((gadget, idx) => (
                            <div key={idx} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{gadget.name}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{gadget.category}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-600 dark:text-gray-400">Qty: {gadget.quantity}</span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">{gadget.ratedPower}W</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Usage Graphs */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Power Consumption</h4>
                        <ResponsiveContainer width="100%" height={250}>
                          {renderChart(unit.timeSeries, 'power', '#6366f1')}
                        </ResponsiveContainer>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Energy Usage</h4>
                        <ResponsiveContainer width="100%" height={250}>
                          {renderChart(unit.timeSeries, 'energy', '#10b981')}
                        </ResponsiveContainer>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Voltage</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            {renderChart(unit.timeSeries, 'voltage', '#ec4899')}
                          </ResponsiveContainer>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Current</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            {renderChart(unit.timeSeries, 'current', '#f59e0b')}
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Power Factor</h4>
                        <ResponsiveContainer width="100%" height={200}>
                          {renderChart(unit.timeSeries, 'powerFactor', '#8b5cf6')}
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Hourly Pattern */}
        {hourlyPattern.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              24-Hour Usage Pattern
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="hour"
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                  }}
                />
                <Legend />
                <Bar dataKey="energy" fill="#10b981" name="Avg Energy (kWh)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" fill="#f59e0b" name="Avg Cost (₹)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}