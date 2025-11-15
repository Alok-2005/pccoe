import { useState, useEffect } from 'react'
import axios from 'axios'
import Navigation from '../components/Navigation'
import { AlertTriangle, Bell, CheckCircle, Clock } from 'lucide-react'

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
    // Refresh every 30 seconds
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.get('http://localhost:5000/api/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAlerts(data)
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (alertId: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`http://localhost:5000/api/alerts/${alertId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchAlerts()
    } catch (error) {
      console.error('Failed to mark alert as read:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    if (severity === 'critical') return 'border-l-red-500 bg-red-50'
    if (severity === 'high') return 'border-l-orange-500 bg-orange-50'
    if (severity === 'medium') return 'border-l-yellow-500 bg-yellow-50'
    return 'border-l-blue-500 bg-blue-50'
  }

  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical') return <AlertTriangle className="text-red-600" size={24} />
    if (severity === 'high') return <AlertTriangle className="text-orange-600" size={24} />
    if (severity === 'medium') return <Bell className="text-yellow-600" size={24} />
    return <CheckCircle className="text-blue-600" size={24} />
  }

  return (
    <div className="main-layout">
      <Navigation />
      
      <div className="main-content">
        <h1 className="text-3xl font-bold mb-6">🚨 Health Alerts</h1>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : alerts.length === 0 ? (
          <div className="card text-center py-12">
            <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
            <p className="text-gray-600 text-lg">No active alerts</p>
            <p className="text-gray-500">All systems nominal - stay safe!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className={`card border-l-4 ${getSeverityColor(alert.severity)} ${!alert.read ? 'ring-2 ring-climate-primary' : ''}`}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold">{alert.title}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Clock size={14} />
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className={`badge ${
                        alert.severity === 'critical' ? 'badge-critical' :
                        alert.severity === 'high' ? 'badge-warning' :
                        'badge-success'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-3">{alert.message}</p>

                    {alert.recommendations && alert.recommendations.length > 0 && (
                      <div className="mb-3">
                        <p className="font-semibold text-sm mb-2">Recommended Actions:</p>
                        <ul className="space-y-1">
                          {alert.recommendations.map((rec: string, i: number) => (
                            <li key={i} className="text-sm flex gap-2">
                              <span className="text-green-600">✓</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {alert.location && (
                      <p className="text-sm text-gray-600 mb-2">📍 Location: {alert.location}</p>
                    )}

                    {!alert.read && (
                      <button
                        onClick={() => markAsRead(alert._id)}
                        className="text-sm text-climate-primary font-semibold hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Tips */}
        <div className="card mt-8">
          <h2 className="text-xl font-bold mb-4">💡 Quick Safety Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <p className="font-semibold text-climate-primary mb-1">High Temperature Alert</p>
              <p className="text-sm text-gray-700">Stay indoors during peak hours (10 AM - 4 PM). Drink water regularly.</p>
            </div>
            <div className="bg-orange-50 p-4 rounded">
              <p className="font-semibold text-climate-warning mb-1">Poor Air Quality</p>
              <p className="text-sm text-gray-700">Wear N95 masks outdoors. Use air purifiers indoors.</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <p className="font-semibold text-yellow-600 mb-1">High UV Index</p>
              <p className="text-sm text-gray-700">Apply SPF 30+ sunscreen. Wear hats and sunglasses.</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="font-semibold text-green-600 mb-1">Disease Outbreak Risk</p>
              <p className="text-sm text-gray-700">Maintain hygiene. Use mosquito nets. Report symptoms early.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}