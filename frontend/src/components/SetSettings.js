import React, { useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import DeleteSetModal from './DeleteSetModal';

const SetSettings = ({ set, onSetUpdated }) => {
  const [formData, setFormData] = useState({
    name: set.name,
    description: set.description,
    total_cards: set.total_cards,
    white_cards: set.white_cards,
    blue_cards: set.blue_cards,
    black_cards: set.black_cards,
    red_cards: set.red_cards,
    green_cards: set.green_cards,
    colorless_cards: set.colorless_cards,
    multicolor_cards: set.multicolor_cards,
    lands_cards: set.lands_cards || 0,
    basic_lands_cards: set.basic_lands_cards || 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [archetypeForm, setArchetypeForm] = useState({ name: '', color_pair: 'WU', description: '' });
  const [archError, setArchError] = useState('');
  const [archLoading, setArchLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`/api/sets/${set.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        onSetUpdated({ ...set, ...formData });
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update set');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error updating set:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshArchetypes = async () => {
    try {
      const res = await fetch(`/api/sets/${set.id}`);
      if (res.ok) {
        const data = await res.json();
        onSetUpdated(data);
      }
    } catch {}
  };

  const handleArchetypeCreate = async (e) => {
    e.preventDefault();
    setArchError('');
    setArchLoading(true);
    try {
      const res = await fetch(`/api/sets/${set.id}/archetypes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(archetypeForm)
      });
      if (res.ok) {
        setArchetypeForm({ name: '', color_pair: 'WU', description: '' });
        await refreshArchetypes();
      } else {
        const err = await res.json();
        setArchError(err.message || 'Failed to create archetype');
      }
    } catch (err) {
      setArchError('Network error. Please try again.');
    } finally {
      setArchLoading(false);
    }
  };

  const handleArchetypeDelete = async (archId) => {
    try {
      const res = await fetch(`/api/archetypes/${archId}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshArchetypes();
      }
    } catch {}
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/sets/${set.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Redirect to sets list
        window.location.href = '/';
      } else {
        console.error('Failed to delete set');
      }
    } catch (error) {
      console.error('Error deleting set:', error);
    }
  };

  const calculateTotal = () => {
    return formData.white_cards + formData.blue_cards + formData.black_cards + 
           formData.red_cards + formData.green_cards + formData.colorless_cards + 
           formData.multicolor_cards + formData.lands_cards + formData.basic_lands_cards;
  };

  const colorDistribution = [
    { key: 'white_cards', color: 'white', label: 'White', symbol: 'W' },
    { key: 'blue_cards', color: 'blue', label: 'Blue', symbol: 'U' },
    { key: 'black_cards', color: 'black', label: 'Black', symbol: 'B' },
    { key: 'red_cards', color: 'red', label: 'Red', symbol: 'R' },
    { key: 'green_cards', color: 'green', label: 'Green', symbol: 'G' },
    { key: 'colorless_cards', color: 'colorless', label: 'Colorless', symbol: 'C' },
    { key: 'multicolor_cards', color: 'multicolor', label: 'Multicolor', symbol: 'M' },
    { key: 'lands_cards', color: 'lands', label: 'Lands', symbol: 'L' },
    { key: 'basic_lands_cards', color: 'lands', label: 'Basic Lands', symbol: 'BL' }
  ];

  const currentTotal = calculateTotal();

  return (
    <div className="space-y-6">
      {error && (
        <div className="error-state">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          Set updated successfully!
        </div>
      )}

      {/* Basic Settings */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Basic Settings</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Set Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-input form-textarea"
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label htmlFor="total_cards" className="form-label">
                  Target Total Cards
                </label>
                <input
                  type="number"
                  id="total_cards"
                  name="total_cards"
                  value={formData.total_cards}
                  onChange={handleNumberChange}
                  className="form-input"
                  min="1"
                  max="1000"
                />
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Color Distribution</h4>
              <div className="space-y-3">
                {colorDistribution.map(({ key, color, label, symbol }) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className={`color-indicator color-${color}`}></div>
                    <label htmlFor={key} className="form-label mb-0 flex-1">
                      {label} ({symbol})
                    </label>
                    <input
                      type="number"
                      id={key}
                      name={key}
                      value={formData[key]}
                      onChange={handleNumberChange}
                      className="form-input w-20"
                      min="0"
                      max="1000"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Current Total:</span>
                  <span className={`font-bold ${currentTotal === formData.total_cards ? 'text-green-600' : 'text-orange-600'}`}>
                    {currentTotal}
                  </span>
                </div>
                {currentTotal !== formData.total_cards && (
                  <div className="text-sm text-gray-600 mt-1">
                    Target: {formData.total_cards}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner w-4 h-4"></div>
              ) : (
                <Save size={20} />
              )}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Archetypes */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Archetypes (two-color pairs)</h3>
        {archError && <div className="error-state mb-4">{archError}</div>}
        <form onSubmit={handleArchetypeCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="form-group">
            <label className="form-label" htmlFor="arch_name">Name</label>
            <input id="arch_name" className="form-input" value={archetypeForm.name} onChange={e=>setArchetypeForm({...archetypeForm, name:e.target.value})} placeholder="e.g., WU Flyers" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="arch_pair">Color Pair</label>
            <select id="arch_pair" className="form-select" value={archetypeForm.color_pair} onChange={e=>setArchetypeForm({...archetypeForm, color_pair:e.target.value})}>
              {['WU','UB','BR','RG','GW','WB','UR','BG','RW','GU'].map(p=> (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="form-group md:col-span-2">
            <label className="form-label" htmlFor="arch_desc">Description</label>
            <input id="arch_desc" className="form-input" value={archetypeForm.description} onChange={e=>setArchetypeForm({...archetypeForm, description:e.target.value})} placeholder="Short description" />
          </div>
          <div className="md:col-span-4 flex justify-end">
            <button className="btn btn-primary" disabled={archLoading}>{archLoading ? 'Adding...' : 'Add Archetype'}</button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(set.archetypes || []).map(a => (
            <div key={a.id} className="border rounded p-3 flex items-start justify-between">
              <div>
                <div className="font-semibold">{a.color_pair} — {a.name}</div>
                {a.description && (<div className="text-sm text-gray-600 mt-1">{a.description}</div>)}
              </div>
              <button className="btn btn-danger btn-sm" onClick={()=>handleArchetypeDelete(a.id)}>Delete</button>
            </div>
          ))}
          {(set.archetypes || []).length === 0 && (
            <div className="text-sm text-gray-600">No archetypes yet. Add one above.</div>
          )}
        </div>
      </div>

      {/* Set Statistics */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Set Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{set.cards.length}</div>
            <div className="text-sm text-gray-500">Cards Created</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{set.total_cards}</div>
            <div className="text-sm text-gray-500">Target Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.round((set.cards.length / set.total_cards) * 100)}%
            </div>
            <div className="text-sm text-gray-500">Completion</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {set.total_cards - set.cards.length}
            </div>
            <div className="text-sm text-gray-500">Remaining</div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200 bg-red-50">
        <h3 className="text-xl font-semibold mb-4 text-red-800">Danger Zone</h3>
        <p className="text-red-700 mb-4">
          Once you delete a set, there is no going back. Please be certain.
        </p>
        <button
          onClick={() => setDeleteModalOpen(true)}
          className="btn btn-danger"
        >
          <Trash2 size={20} />
          Delete Set
        </button>
      </div>

      <DeleteSetModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        setName={set.name}
      />
    </div>
  );
};

export default SetSettings;
