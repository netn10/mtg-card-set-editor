import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';

const ArchetypeModal = ({ archetype, isOpen, onClose, onArchetypeUpdated, setId }) => {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    color_pair: 'WU',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 2-color combinations
  const twoColorPairs = [
    'WU', 'UB', 'BR', 'RG', 'GW', 'WB', 'UR', 'BG', 'RW', 'GU'
  ];

  // 3-color combinations
  const threeColorPairs = [
    'WUB', 'UBR', 'BRG', 'RGW', 'GWU', 'WBR', 'URG', 'BGW', 'RWU', 'GUB'
  ];

  useEffect(() => {
    if (archetype) {
      setFormData({
        name: archetype.name || '',
        title: archetype.title || archetype.name || '',
        color_pair: archetype.color_pair || 'WU',
        description: archetype.description || ''
      });
    } else {
      setFormData({
        name: '',
        title: '',
        color_pair: 'WU',
        description: ''
      });
    }
    setError('');
    setSuccess(false);
  }, [archetype, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const url = archetype 
        ? `/api/archetypes/${archetype.id}`
        : `/api/sets/${setId}/archetypes`;
      
      const method = archetype ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        if (onArchetypeUpdated) {
          onArchetypeUpdated();
        }
        
        // Clear success message and close modal after 1 second
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save archetype');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error saving archetype:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {archetype ? 'Edit Archetype' : 'Create Archetype'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="error-state">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              Archetype saved successfully!
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., WU Flyers"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Display Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Azorius Flyers"
              required
            />
            <div className="text-sm text-gray-600 mt-1">
              This is the display name shown in the UI
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="color_pair" className="form-label">
              Color Combination *
            </label>
            <select
              id="color_pair"
              name="color_pair"
              value={formData.color_pair}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <optgroup label="2-Color Combinations">
                {twoColorPairs.map(pair => (
                  <option key={pair} value={pair}>{pair}</option>
                ))}
              </optgroup>
              <optgroup label="3-Color Combinations">
                {threeColorPairs.map(pair => (
                  <option key={pair} value={pair}>{pair}</option>
                ))}
              </optgroup>
            </select>
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
              rows={3}
              placeholder="Short description of the archetype strategy"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
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
              {loading ? 'Saving...' : (archetype ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArchetypeModal;
