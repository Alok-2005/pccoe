import { useState } from 'react'
import axios from 'axios'
import Navigation from '../components/Navigation'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function Predict() {
  const navigate = useNavigate()
  const [city, setCity] = useState('Pune')
  const [prediction, setPrediction] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.post(
        'http://localhost:5000/api/predict',
        { city },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setPrediction(data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  const getRiskBadgeClass = (level: string) => {
    if (level === 'Critical') return 'badge-critical'
    if (level === 'High') return 'badge-warning'
    return 'badge-success'
  }

  return (
    <div className="main-layout">
      <Navigation />
      
      <div className="main-content">
        <h1 className="text-3xl font-bold mb-6">🌍 Health Risk Predictor</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Form */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Select Location</h2>
              <form onSubmit={handlePredict} className="space-y-4">
                <div>
                  <label className="form-label">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="input-field"
                  >
                    <option>Pune</option>
                    <option>Mumbai</option>
                    <option>Delhi</option>
                    <option>Bangalore</option>
                    <option>Chennai</option>
                  </select>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Analyzing...' : 'Get Prediction'}
                </button>
              </form>

              {error && <div className="alert-critical mt-4">{error}</div>}
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {prediction ? (
              <div className="space-y-4">
                {/* Environment Data */}
                <div className="card">
                  <h2 className="text-lg font-bold mb-4">Environmental Data</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Temperature</p>
                      <p className="text-2xl font-bold text-climate-primary">
                        {prediction.environmentData.temperature}°C
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded">
                      <p className="text-sm text-gray-600">Humidity</p>
                      <p className="text-2xl font-bold text-climate-primary">
                        {prediction.environmentData.humidity}%
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded">
                      <p className="text-sm text-gray-600">AQI</p>
                      <p className="text-2xl font-bold text-climate-warning">
                        {prediction.environmentData.aqi}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded">
                      <p className="text-sm text-gray-600">UV Index</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {prediction.environmentData.uvIndex}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Risk Level */}
                <div className={`card ${prediction.prediction.riskLevel === 'Critical' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-yellow-500'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Risk Assessment</h2>
                    <span className={`badge ${getRiskBadgeClass(prediction.prediction.riskLevel)}`}>
                      {prediction.prediction.riskLevel}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-red-600 mb-2">Identified Risks:</h3>
                      <ul className="space-y-1">
                        {prediction.prediction.risks?.map((risk: string, i: number) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-green-600 mb-2">Recommendations:</h3>
                      <ul className="space-y-1">
                        {prediction.prediction.recommendations?.map((rec: string, i: number) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {prediction.prediction.medicalAlert && (
                      <div className="alert-critical">
                        <strong>⚠️ Medical Alert:</strong> {prediction.prediction.medicalAlert}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sources */}
                <div className="card">
                  <h3 className="font-bold mb-2">Evidence Sources:</h3>
                  <div className="space-y-2">
                    {prediction.sources?.slice(0, 3).map((source: any, i: number) => (
                      <div key={i} className="bg-gray-50 p-3 rounded text-sm">
                        <p className="font-semibold text-climate-primary">{source.source}</p>
                        <p className="text-gray-600">{source.text.substring(0, 100)}...</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => navigate('/reports')}
                  className="btn-primary w-full mt-4"
                >
                  Generate Full Report
                </button>
              </div>
            ) : (
              <div className="card text-center py-12">
                <p className="text-gray-600">Select a city and click "Get Prediction" to analyze health risks</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}