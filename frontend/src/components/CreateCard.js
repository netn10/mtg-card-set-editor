import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

const CreateCard = ({ setId, archetypes = [], onCardCreated }) => {
  const { showSuccess, showError } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    mana_cost: '',
    type_line: '',
    text: '',
    power: '',
    toughness: '',
    colors: [],
    rarity: 'common',
    archetype_id: ''
  });
  const [loading, setLoading] = useState(false);

  const availableColors = [
    { value: 'white', label: 'White', symbol: 'W' },
    { value: 'blue', label: 'Blue', symbol: 'U' },
    { value: 'black', label: 'Black', symbol: 'B' },
    { value: 'red', label: 'Red', symbol: 'R' },
    { value: 'green', label: 'Green', symbol: 'G' }
  ];

  const rarityOptions = [
    { value: 'common', label: 'Common' },
    { value: 'uncommon', label: 'Uncommon' },
    { value: 'rare', label: 'Rare' },
    { value: 'mythic', label: 'Mythic Rare' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleColorChange = (colorValue) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(colorValue)
        ? prev.colors.filter(c => c !== colorValue)
        : [...prev.colors, colorValue]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };
      if (!payload.archetype_id) {
        delete payload.archetype_id;
      }
      const response = await fetch(`/api/sets/${setId}/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showSuccess(`Card "${formData.name}" created successfully!`);
        setFormData({
          name: '',
          mana_cost: '',
          type_line: '',
          text: '',
          power: '',
          toughness: '',
          colors: [],
          rarity: 'common',
          archetype_id: ''
        });
        onCardCreated();
      } else {
        const errorData = await response.json();
        showError(errorData.message || 'Failed to create card');
      }
    } catch (error) {
      showError('Network error. Please try again.');
      console.error('Error creating card:', error);
    } finally {
      setLoading(false);
    }
  };

  const archetypeOptions = archetypes.map(a => ({ 
    value: a.id, 
    label: `${a.color_pair} — ${a.title || a.name}` 
  }));

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Add New Card</h2>
      </div>


      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Card Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                required
                placeholder="Enter card name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="mana_cost" className="form-label">
                Mana Cost
              </label>
              <input
                type="text"
                id="mana_cost"
                name="mana_cost"
                value={formData.mana_cost}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., {2}{W}{W} or {W/U}{U/B}"
              />
              <div className="text-sm text-gray-500 mt-1">
                Use {'{W}'}, {'{U}'}, {'{B}'}, {'{R}'}, {'{G}'} for colored mana, {'{1}'}, {'{2}'}, etc. for generic
                <br />
                Use {'{W/U}'}, {'{U/B}'}, {'{B/R}'}, {'{R/G}'}, {'{G/W}'} for hybrid mana
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="type_line" className="form-label">
                Type Line
              </label>
              <input
                type="text"
                id="type_line"
                name="type_line"
                value={formData.type_line}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., Creature — Human Knight"
              />
            </div>

            <div className="form-group">
              <label htmlFor="text" className="form-label">
                Card Text
              </label>
              <textarea
                id="text"
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                className="form-input form-textarea"
                placeholder="Enter card rules text"
                rows={6}
              />
            </div>
          </div>

          <div>
            <div className="form-group">
              <label className="form-label">Colors</label>
              <div className="space-y-2">
                {availableColors.map(({ value, label, symbol }) => (
                  <label key={value} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.colors.includes(value)}
                      onChange={() => handleColorChange(value)}
                      className="rounded border-gray-300"
                    />
                    <div className={`color-indicator color-${value}`}></div>
                    <span className="text-sm">{label} ({symbol})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="rarity" className="form-label">
                Rarity
              </label>
              <select
                id="rarity"
                name="rarity"
                value={formData.rarity}
                onChange={handleInputChange}
                className="form-select"
              >
                {rarityOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="archetype_id" className="form-label">
                Archetype (optional)
              </label>
              <select
                id="archetype_id"
                name="archetype_id"
                value={formData.archetype_id}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">None</option>
                {archetypeOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="power" className="form-label">
                  Power
                </label>
                <input
                  type="text"
                  id="power"
                  name="power"
                  value={formData.power}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="*"
                />
              </div>

              <div className="form-group">
                <label htmlFor="toughness" className="form-label">
                  Toughness
                </label>
                <input
                  type="text"
                  id="toughness"
                  name="toughness"
                  value={formData.toughness}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="*"
                />
              </div>
            </div>

            {/* Card Preview */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Eye size={18} />
                Live Preview
              </h3>
              <div className={`border-2 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg transition-all duration-300 ${
                formData.rarity === 'mythic' ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100' :
                formData.rarity === 'rare' ? 'border-gold-400 bg-gradient-to-br from-gold-50 to-gold-100' :
                formData.rarity === 'uncommon' ? 'border-silver-400 bg-gradient-to-br from-silver-50 to-silver-100' :
                'border-gray-300'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{formData.name || 'Card Name'}</h4>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-mono">
                      {formData.mana_cost || '{cost}'}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      formData.rarity === 'mythic' ? 'bg-yellow-100 text-yellow-800' :
                      formData.rarity === 'rare' ? 'bg-gold-100 text-gold-800' :
                      formData.rarity === 'uncommon' ? 'bg-silver-100 text-silver-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {formData.rarity}
                    </div>
                  </div>
                </div>
                
                {formData.type_line && (
                  <div className="text-sm text-gray-600 mb-2">
                    {formData.type_line}
                  </div>
                )}
                
                {formData.text && (
                  <div className="text-sm mb-2">
                    {formData.text}
                  </div>
                )}
                
                {formData.power && formData.toughness && (
                  <div className="text-right text-sm font-mono">
                    {formData.power}/{formData.toughness}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => setFormData({
              name: '',
              mana_cost: '',
              type_line: '',
              text: '',
              power: '',
              toughness: '',
              colors: [],
              rarity: 'common'
            })}
            className="btn btn-secondary"
          >
            <X size={20} />
            Clear
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
            {loading ? 'Creating...' : 'Create Card'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCard;
