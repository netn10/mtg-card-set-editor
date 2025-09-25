import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

const CreateSet = ({ onSetCreated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    total_cards: 100,
    white_cards: 20,
    blue_cards: 20,
    black_cards: 20,
    red_cards: 20,
    green_cards: 20,
    colorless_cards: 0,
    multicolor_cards: 0,
    lands_cards: 0,
    basic_lands_cards: 0,
    // Rarity distribution
    common_cards: 60,
    uncommon_cards: 30,
    rare_cards: 8,
    mythic_cards: 2,
    // Hybrid card settings
    hybrid_cards: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const calculateColorTotal = () => {
    return formData.white_cards + formData.blue_cards + formData.black_cards + 
           formData.red_cards + formData.green_cards + formData.colorless_cards + 
           formData.multicolor_cards + formData.lands_cards + formData.basic_lands_cards;
  };

  const calculateRarityTotal = () => {
    return formData.common_cards + formData.uncommon_cards + formData.rare_cards + 
           formData.mythic_cards;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newSet = await response.json();
        onSetCreated(newSet);
        navigate(`/set/${newSet.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create set');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error creating set:', error);
    } finally {
      setLoading(false);
    }
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


  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="btn btn-secondary"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold">Create New Set</h1>
      </div>

      {error && (
        <div className="error-state mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Basic Information</h2>
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
                  placeholder="Enter set name"
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
                  placeholder="Describe your custom set"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Color Distribution */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Color Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <span className="font-medium">Color Total:</span>
              <span className={`font-bold ${calculateColorTotal() === formData.total_cards ? 'text-green-600' : 'text-orange-600'}`}>
                {calculateColorTotal()}
              </span>
            </div>
            {calculateColorTotal() !== formData.total_cards && (
              <div className="text-sm text-gray-600 mt-1">
                Target: {formData.total_cards}
              </div>
            )}
          </div>
        </div>

        {/* Rarity Distribution */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Rarity Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              <label htmlFor="common_cards" className="form-label mb-0 flex-1">
                Common
              </label>
              <input
                type="number"
                id="common_cards"
                name="common_cards"
                value={formData.common_cards}
                onChange={handleNumberChange}
                className="form-input w-20"
                min="0"
                max="1000"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
              <label htmlFor="uncommon_cards" className="form-label mb-0 flex-1">
                Uncommon
              </label>
              <input
                type="number"
                id="uncommon_cards"
                name="uncommon_cards"
                value={formData.uncommon_cards}
                onChange={handleNumberChange}
                className="form-input w-20"
                min="0"
                max="1000"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
              <label htmlFor="rare_cards" className="form-label mb-0 flex-1">
                Rare
              </label>
              <input
                type="number"
                id="rare_cards"
                name="rare_cards"
                value={formData.rare_cards}
                onChange={handleNumberChange}
                className="form-input w-20"
                min="0"
                max="1000"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-400 rounded-full"></div>
              <label htmlFor="mythic_cards" className="form-label mb-0 flex-1">
                Mythic Rare
              </label>
              <input
                type="number"
                id="mythic_cards"
                name="mythic_cards"
                value={formData.mythic_cards}
                onChange={handleNumberChange}
                className="form-input w-20"
                min="0"
                max="1000"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Rarity Total:</span>
              <span className={`font-bold ${calculateRarityTotal() === formData.total_cards ? 'text-green-600' : 'text-orange-600'}`}>
                {calculateRarityTotal()}
              </span>
            </div>
            {calculateRarityTotal() !== formData.total_cards && (
              <div className="text-sm text-gray-600 mt-1">
                Target: {formData.total_cards}
              </div>
            )}
          </div>
        </div>

        {/* Hybrid Cards */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Special Card Types</h2>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
            <label htmlFor="hybrid_cards" className="form-label mb-0 flex-1">
              Hybrid Cards (cards with hybrid mana costs)
            </label>
            <input
              type="number"
              id="hybrid_cards"
              name="hybrid_cards"
              value={formData.hybrid_cards}
              onChange={handleNumberChange}
              className="form-input w-20"
              min="0"
              max="1000"
            />
          </div>
          <div className="text-sm text-gray-600 mt-2">
            These cards count toward their color distribution but have special hybrid mana costs like {'{W/U}'}, {'{U/B}'}, etc.
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary"
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
            {loading ? 'Creating...' : 'Create Set'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSet;
