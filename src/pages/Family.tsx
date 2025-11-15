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
      
      <div className="main-content bg-black min-h-screen p-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-white">
          <Users size={32} /> Family Setup
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6">
              {error && <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-lg mb-4">{error}</div>}
              {success && <div className="bg-green-500/10 border border-green-500/20 text-green-300 p-3 rounded-lg mb-4">{success}</div>}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Family Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Family Group Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-500"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder="e.g., Kumar Family"
                    required
                  />
                </div>

                {/* Members */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Family Members</h2>
                    <button
                      type="button"
                      onClick={addMember}
                      className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 border border-yellow-400/20 flex gap-2 items-center text-sm"
                    >
                      <Plus size={18} /> Add Member
                    </button>
                  </div>

                  <div className="space-y-4">
                    {members.map((member, idx) => (
                      <div key={idx} className="bg-black border border-yellow-400/20 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 bg-gray-900 border border-yellow-400/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-500"
                              value={member.name}
                              onChange={(e) => updateMember(idx, 'name', e.target.value)}
                              placeholder="Full name"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Age (years) *</label>
                            <input
                              type="number"
                              className="w-full px-4 py-3 bg-gray-900 border border-yellow-400/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-500"
                              value={member.age}
                              onChange={(e) => updateMember(idx, 'age', e.target.value)}
                              placeholder="Age"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Relation</label>
                            <select
                              className="w-full px-4 py-3 bg-gray-900 border border-yellow-400/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white"
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
                            <label className="block text-sm font-medium text-gray-300 mb-2">Health Conditions</label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 bg-gray-900 border border-yellow-400/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-500"
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
                            className="text-sm text-red-400 font-semibold hover:text-red-300"
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
                  className="bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 font-semibold shadow-yellow-400/40 shadow-md w-full"
                >
                  {loading ? 'Creating Family...' : 'Create Family Group'}
                </button>
              </form>
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                <Heart size={24} className="text-red-400" /> Family Safety Mode
              </h2>
              <p className="text-sm text-gray-300 mb-3">
                Add family members with their health profiles to receive personalized alerts for each person.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Personalized risk predictions</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Health-specific recommendations</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Family group alerts</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Shared health reports</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-3 text-white">Health Conditions</h2>
              <p className="text-sm text-gray-400 mb-3">Examples of health conditions to track:</p>
              <ul className="text-sm space-y-1 text-gray-300">
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