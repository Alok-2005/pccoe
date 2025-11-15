// File: web/src/pages/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  TrendingUp,
  Loader2,
  MapPin
} from 'lucide-react';
import { adminAPI } from '../api/services';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, heatmapRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getRiskHeatmap(),
      ]);
      setDashboardData(dashRes.data);
      setHeatmapData(heatmapRes.data.heatmapData);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const getRiskColor = (score: number) => {
    if (score >= 75) return 'bg-red-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">System overview and analytics</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {dashboardData.statistics.totalUsers}
              </h3>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Family Groups</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {dashboardData.statistics.totalFamilies}
              </h3>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Predictions</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {dashboardData.statistics.totalPredictions}
              </h3>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Reports</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {dashboardData.statistics.totalReports}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* High Risk Alerts */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-semibold text-gray-900">High Risk Alerts (24h)</h2>
        </div>

        <div className="space-y-3">
          {dashboardData.highRiskAlerts.slice(0, 5).map((alert: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{alert.userId.name}</p>
                <p className="text-sm text-gray-600">{alert.userId.location.city}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-600">{alert.riskScores.overall}</p>
                <p className="text-xs text-gray-600">Risk Score</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regional Risk Heatmap */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <MapPin className="w-6h-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Regional Risk Heatmap</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">City</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">Overall Risk</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">Heatwave</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">Air Quality</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">UV Exposure</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">Disease</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">Data Points</th>
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((item: any, index: number) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.city}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center justify-center w-16 h-8 rounded-full text-white text-sm font-semibold ${getRiskColor(item.riskScores.overall)}`}>
                      {item.riskScores.overall}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">
                    {item.riskScores.heatwave}
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">
                    {item.riskScores.airQuality}
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">
                    {item.riskScores.uvExposure}
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">
                    {item.riskScores.disease}
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">
                    {item.dataPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {dashboardData.recentActivity.map((activity: any, index: number) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Risk prediction for {activity.userId.name}
                </p>
                <p className="text-sm text-gray-600">
                  {activity.location.city} • Risk: {activity.riskScores.overall}/100
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(activity.createdAt), 'MMM dd, yyyy h:mm a')}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                activity.riskScores.overall >= 75 
                  ? 'bg-red-100 text-red-800'
                  : activity.riskScores.overall >= 50
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {activity.riskScores.overall >= 75 ? 'High' : activity.riskScores.overall >= 50 ? 'Moderate' : 'Low'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* City Risk Breakdown */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">City Risk Analysis (7 Days)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardData.cityRisks.map((city: any, index: number) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{city._id}</h3>
                <span className={`w-3 h-3 rounded-full ${getRiskColor(city.avgRisk)}`} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Risk</span>
                  <span className="font-semibold text-gray-900">{Math.round(city.avgRisk)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Max Risk</span>
                  <span className="font-semibold text-gray-900">{Math.round(city.maxRisk)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Data Points</span>
                  <span className="font-semibold text-gray-900">{city.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;