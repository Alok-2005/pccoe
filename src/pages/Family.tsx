import { useState } from 'react'
import axios from 'axios'
import Navigation from '../components/Navigation'
import { Users, Plus, Heart } from 'lucide-react'

export default function Family() {
  const [familyName, setFamilyName] = useState('')
  const [members, setMembers] = useState<any[]>([
    { name: '', age: '', relation: '', comorbidities: '' }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const addMember = () => {
    setMembers([...members, { name: '', age: '', relation: '', comorbidities: '' }])
  }

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  const updateMember = (index: number, field: string, value: string) => {
    const updated = [...members]
    updated[index][field] = value
    setMembers(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!familyName || members.some(m => !m.name || !m.age)) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
    interface FamilyMember {
        name: string
        age: number
        relation: string
        comorbidities: string[]
    }

    interface FamilyData {
        familyName: string
        members: FamilyMember[]
    }

    const familyData: FamilyData = {
        familyName,
        members: members.map(m => ({
            name: m.name,
            age: parseInt(m.age),
            relation: m.relation,
            comorbidities: m.comorbidities ? m.comorbidities.split(',').map((c: string) => c.trim()) : []
        }))
    }

      const { data } = await axios.post('http://localhost:5000/api/families', familyData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setSuccess('Family group created successfully!')
      setTimeout(() => window.location.href = '/dashboard', 2000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create family group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main-layout">
      <Navigation />
      
      <div className="main-content">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Users size={32} /> Family Setup
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              {error && <div className="alert-critical mb-4">{error}</div>}
              {success && <div className="alert-success mb-4">{success}</div>}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Family Name */}
                <div>
                  <label className="form-label">Family Group Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder="e.g., Kumar Family"
                    required
                  />
                </div>

                {/* Members */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Family Members</h2>
                    <button
                      type="button"
                      onClick={addMember}
                      className="btn-secondary flex gap-2 items-center text-sm"
                    >
                      <Plus size={18} /> Add Member
                    </button>
                  </div>

                  <div className="space-y-4">
                    {members.map((member, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="form-label text-sm">Name *</label>
                            <input
                              type="text"
                              className="input-field"
                              value={member.name}
                              onChange={(e) => updateMember(idx, 'name', e.target.value)}
                              placeholder="Full name"
                              required
                            />
                          </div>
                          <div>
                            <label className="form-label text-sm">Age (years) *</label>
                            <input
                              type="number"
                              className="input-field"
                              value={member.age}
                              onChange={(e) => updateMember(idx, 'age', e.target.value)}
                              placeholder="Age"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="form-label text-sm">Relation</label>
                            <select
                              className="input-field"
                              value={member.relation}
                              onChange={(e) => updateMember(idx, 'relation', e.target.value)}
                            >
                              <option>Select relation</option>
                              <option>Father</option>
                              <option>Mother</option>
                              <option>Son</option>
                              <option>Daughter</option>
                              <option>Grandfather</option>
                              <option>Grandmother</option>
                              <option>Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="form-label text-sm">Health Conditions</label>
                            <input
                              type="text"
                              className="input-field"
                              value={member.comorbidities}
                              onChange={(e) => updateMember(idx, 'comorbidities', e.target.value)}
                              placeholder="e.g., Asthma, Diabetes (comma-separated)"
                            />
                          </div>
                        </div>

                        {members.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMember(idx)}
                            className="text-sm text-climate-danger font-semibold hover:underline"
                          >
                            Remove Member
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Creating Family...' : 'Create Family Group'}
                </button>
              </form>
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            <div className="card">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Heart size={24} className="text-red-500" /> Family Safety Mode
              </h2>
              <p className="text-sm text-gray-700 mb-3">
                Add family members with their health profiles to receive personalized alerts for each person.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Personalized risk predictions</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Health-specific recommendations</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Family group alerts</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Shared health reports</span>
                </li>
              </ul>
            </div>

            <div className="card">
              <h2 className="text-lg font-bold mb-3">Health Conditions</h2>
              <p className="text-sm text-gray-600 mb-3">Examples of health conditions to track:</p>
              <ul className="text-sm space-y-1">
                <li>• Asthma</li>
                <li>• Diabetes</li>
                <li>• Hypertension</li>
                <li>• Heart Disease</li>
                <li>• Arthritis</li>
                <li>• Allergies</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}