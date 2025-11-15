// File: web/src/pages/FamilyDashboard.tsx
import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, AlertTriangle, Loader2, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { familyAPI } from '../api/services';
import toast from 'react-hot-toast';

const FamilyDashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateFamily, setShowCreateFamily] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    age: '',
    relation: '',
    comorbidities: '',
    allergies: '',
  });
  const [newFamily, setNewFamily] = useState({
    name: '',
    city: user?.location.city || '',
  });

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    try {
      setLoading(true);
      if (user?.familyId) {
        const [familyRes, alertsRes] = await Promise.all([
          familyAPI.getFamily(user.familyId),
          familyAPI.getFamilyAlerts(user.familyId),
        ]);
        setFamily(familyRes.data.family);
        setAlerts(alertsRes.data.alerts);
      }
    } catch (error) {
      console.error('Failed to load family data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await familyAPI.createFamily({
  name: newFamily.name,
  members: [],
  sharedLocation: { city: newFamily.city },
});

// Save the new family ID into auth store
if (user?.id) {
 useAuthStore.setState((state) => {
  const updatedUser = {
    ...state.user!,
    familyId: res.data.family._id,
  };

  localStorage.setItem("user", JSON.stringify(updatedUser));

  return { user: updatedUser };
});


}

toast.success("Family created!");
setShowCreateFamily(false);

      window.location.reload(); // Refresh to update user's familyId
    } catch (error) {
      toast.error('Failed to create family');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await familyAPI.addMember(user!.familyId!, {
        name: newMember.name,
        age: parseInt(newMember.age),
        relation: newMember.relation,
        healthProfile: {
          comorbidities: newMember.comorbidities.split(',').map(s => s.trim()).filter(Boolean),
          allergies: newMember.allergies.split(',').map(s => s.trim()).filter(Boolean),
        },
      });
      toast.success('Family member added!');
      setShowAddMember(false);
      setNewMember({ name: '', age: '', relation: '', comorbidities: '', allergies: '' });
      fetchFamilyData();
    } catch (error) {
      toast.error('Failed to add member');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!family) {
    return (
      <div className="fade-in">
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 mb-6">
            <Users className="w-10 h-10 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Family Group</h2>
          <p className="text-gray-600 mb-6">Create a family group to monitor health risks for your loved ones</p>
          <button
            onClick={() => setShowCreateFamily(true)}
            className="btn btn-primary"
          >
            Create Family Group
          </button>
        </div>

        {/* Create Family Modal */}
        {showCreateFamily && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Create Family Group</h3>
                <button onClick={() => setShowCreateFamily(false)}>
                  <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <form onSubmit={handleCreateFamily} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Family Name
                  </label>
                  <input
                    type="text"
                    value={newFamily.name}
                    onChange={(e) => setNewFamily({ ...newFamily, name: e.target.value })}
                    className="input"
                    placeholder="The Smith Family"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={newFamily.city}
                    onChange={(e) => setNewFamily({ ...newFamily, city: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <button type="submit" className="w-full btn btn-primary">
                  Create Family
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{family.name}</h1>
          <p className="text-gray-600 mt-1">{family.sharedLocation?.city}</p>
        </div>
        <button
          onClick={() => setShowAddMember(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Active Health Alerts</h3>
              <p className="text-sm text-red-700 mt-1">
                {alerts.length} alert{alerts.length !== 1 ? 's' : ''} requiring attention
              </p>
              <div className="mt-4 space-y-3">
                {alerts.slice(0, 3).map((alert, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-red-200">
                    <p className="text-sm font-medium text-gray-900">
                      Risk Level: {alert.riskLevel}/100
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Affected: {alert.affectedMembers.map((m: any) => m.name).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Family Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {family.members.map((member: any, index: number) => (
          <div key={member._id || index} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-lg">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.relation}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Age</span>
                <span className="font-medium text-gray-900">{member.age} years</span>
              </div>

              {member.healthProfile.comorbidities.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Health Conditions</p>
                  <div className="flex flex-wrap gap-2">
                    {member.healthProfile.comorbidities.map((condition: string, idx: number) => (
                      <span key={idx} className="badge badge-warning">
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {member.healthProfile.allergies.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Allergies</p>
                  <div className="flex flex-wrap gap-2">
                    {member.healthProfile.allergies.map((allergy: string, idx: number) => (
                      <span key={idx} className="badge badge-danger">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {member.age < 12 && (
                <div className="bg-blue-50 rounded-lg p-3 mt-3">
                  <p className="text-xs text-blue-800">
                    👶 Child - Extra monitoring recommended
                  </p>
                </div>
              )}

              {member.age > 65 && (
                <div className="bg-purple-50 rounded-lg p-3 mt-3">
                  <p className="text-xs text-purple-800">
                    👴 Senior - Enhanced care needed
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Add Family Member</h3>
              <button onClick={() => setShowAddMember(false)}>
                <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={newMember.age}
                  onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                  className="input"
                  min="0"
                  max="150"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relation
                </label>
                <select
                  value={newMember.relation}
                  onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select relation</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Grandparent">Grandparent</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Health Conditions (comma-separated)
                </label>
                <input
                  type="text"
                  value={newMember.comorbidities}
                  onChange={(e) => setNewMember({ ...newMember, comorbidities: e.target.value })}
                  className="input"
                  placeholder="Diabetes, Hypertension"
                /></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies (comma-separated)
                </label>
                <input
                  type="text"
                  value={newMember.allergies}
                  onChange={(e) => setNewMember({ ...newMember, allergies: e.target.value })}
                  className="input"
                  placeholder="Pollen, Nuts"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn btn-primary">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyDashboard;