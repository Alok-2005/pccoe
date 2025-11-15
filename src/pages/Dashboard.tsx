// File: web/src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { 
  Cloud, 
  Wind, 
  Droplets, 
  Sun, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  Download,
  Loader2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useAuthStore } from '../store/authStore';
import { predictionAPI, reportAPI } from '../api/services';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [predRes, statsRes, historyRes] = await Promise.all([
        predictionAPI.getPrediction(),
        predictionAPI.getStats(),
        predictionAPI.getHistory(user!.id, 7),
      ]);
      
      setPrediction(predRes.data);
      setStats(statsRes.data);
      setHistory(historyRes.data.predictions);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Data refreshed!');
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      await reportAPI.generateReport();
      toast.success('Report generated! Check Reports page.');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 75) return 'text-red-400 bg-red-500/10';
    if (score >= 50) return 'text-orange-400 bg-orange-500/10';
    return 'text-green-400 bg-green-500/10';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 75) return 'High Risk';
    if (score >= 50) return 'Moderate Risk';
    return 'Low Risk';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  const chartData = history.map(p => ({
    date: format(new Date(p.createdAt), 'MMM dd'),
    overall: p.riskScores.overall,
    heatwave: p.riskScores.heatwave,
    airQuality: p.riskScores.airQuality,
    uvExposure: p.riskScores.uvExposure,
  })).reverse();

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-400 mt-1">
            {user?.location.city} • {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 border border-yellow-400/20 flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 font-semibold flex items-center space-x-2 shadow-yellow-400/40 shadow-md"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Risk Score Card */}
      <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-8 text-black shadow-yellow-400/40 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-black/70 text-sm font-medium">Overall Health Risk</p>
            <h2 className="text-5xl font-bold mt-2">
              {prediction?.riskScores.overall}/100
            </h2>
            <p className="mt-2 text-black/70">
              {getRiskLabel(prediction?.riskScores.overall)}
            </p>
          </div>
          <div className="w-32 h-32 rounded-full bg-black/10 flex items-center justify-center backdrop-blur-sm">
            <AlertTriangle className="w-16 h-16" />
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-black/20">
          <p className="text-sm text-black/80">
            {prediction?.explanation}
          </p>
        </div>
      </div>

      {/* Environmental Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Temperature</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {prediction?.environmentData.temperature}°C
              </h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Cloud className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Air Quality Index</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {prediction?.environmentData.aqi}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Wind className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">UV Index</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {prediction?.environmentData.uvIndex}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Sun className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Humidity</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {prediction?.environmentData.humidity}%
              </h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Droplets className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Risk Breakdown */}
      <div className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Risk Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Heatwave', score: prediction?.riskScores.heatwave },
            { label: 'Air Quality', score: prediction?.riskScores.airQuality },
            { label: 'UV Exposure', score: prediction?.riskScores.uvExposure },
            { label: 'Disease', score: prediction?.riskScores.disease },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{item.label}</span>
                <span className="font-semibold text-white">{item.score}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    item.score >= 75
                      ? 'bg-red-500'
                      : item.score >= 50
                      ? 'bg-orange-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Trends */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Risk Trends (7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid rgba(250, 204, 21, 0.2)',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="overall" 
                stroke="#facc15" 
                strokeWidth={2}
                name="Overall Risk"
              />
              <Line 
                type="monotone" 
                dataKey="heatwave" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Heatwave"
              />
              <Line 
                type="monotone" 
                dataKey="airQuality" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Air Quality"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Current Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'Heatwave', value: prediction?.riskScores.heatwave },
              { name: 'Air Quality', value: prediction?.riskScores.airQuality },
              { name: 'UV Exposure', value: prediction?.riskScores.uvExposure },
              { name: 'Disease', value: prediction?.riskScores.disease },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid rgba(250, 204, 21, 0.2)',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Bar dataKey="value" fill="#facc15" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">
          Personalized Recommendations
        </h3>
        <div className="space-y-4">
          {prediction?.recommendations.map((rec: any, index: number) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                rec.priority === 'critical'
                  ? 'bg-red-500/10 border-red-500'
                  : rec.priority === 'high'
                  ? 'bg-orange-500/10 border-orange-500'
                  : rec.priority === 'medium'
                  ? 'bg-blue-500/10 border-blue-500'
                  : 'bg-gray-800 border-gray-600'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`mt-0.5 px-2 py-1 rounded text-xs font-semibold uppercase ${
                  rec.priority === 'critical'
                    ? 'bg-red-500/20 text-red-300'
                    : rec.priority === 'high'
                    ? 'bg-orange-500/20 text-orange-300'
                    : rec.priority === 'medium'
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {rec.priority}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{rec.category}</h4>
                  <p className="text-sm text-gray-400 mt-1">{rec.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Average Risk</p>
                <h4 className="text-xl font-bold text-white">{stats.averageRisk}</h4>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Trend</p>
                <h4 className="text-xl font-bold text-white capitalize">{stats.trend}</h4>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Cloud className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Predictions</p>
                <h4 className="text-xl font-bold text-white">{stats.totalPredictions}</h4>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;