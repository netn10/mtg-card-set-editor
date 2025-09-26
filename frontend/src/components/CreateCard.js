import React, { useState } from 'react';
import { Save, X, Eye } from 'lucide-react';
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Card</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create a new Magic: The Gathering card</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="form-group">
              <label htmlFor="name" className="form-label flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Card Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
                placeholder="Enter card name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="mana_cost" className="form-label flex items-center gap-2">
                <span className="text-yellow-500">⚡</span>
                Mana Cost
              </label>
              <input
                type="text"
                id="mana_cost"
                name="mana_cost"
                value={formData.mana_cost}
                onChange={handleInputChange}
                className="form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="e.g., {2}{W}{W} or {W/U}{U/B}"
              />
              <div className="text-sm text-gray-500 mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="font-medium mb-1">Mana Cost Format:</div>
                <div>• Use {'{W}'}, {'{U}'}, {'{B}'}, {'{R}'}, {'{G}'} for colored mana</div>
                <div>• Use {'{1}'}, {'{2}'}, etc. for generic mana</div>
                <div>• Use {'{W/U}'}, {'{U/B}'}, etc. for hybrid mana</div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="type_line" className="form-label flex items-center gap-2">
                <span className="text-blue-500">🏷️</span>
                Type Line
              </label>
              <input
                type="text"
                id="type_line"
                name="type_line"
                value={formData.type_line}
                onChange={handleInputChange}
                className="form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="e.g., Creature — Human Knight"
              />
            </div>

            <div className="form-group">
              <label htmlFor="text" className="form-label flex items-center gap-2">
                <span className="text-green-500">📝</span>
                Card Text
              </label>
              <textarea
                id="text"
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                className="form-input form-textarea focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter card rules text"
                rows={6}
              />
            </div>
          </div>

          <div>
            <div className="form-group">
              <label className="form-label flex items-center gap-2">
                <span className="text-purple-500">🎨</span>
                Colors
              </label>
              <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {availableColors.map(({ value, label, symbol }) => (
                  <label key={value} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.colors.includes(value)}
                      onChange={() => handleColorChange(value)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className={`color-indicator color-${value} w-6 h-6 border-2`}></div>
                    <span className="text-sm font-medium">{label} ({symbol})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="rarity" className="form-label flex items-center gap-2">
                <span className="text-yellow-500">⭐</span>
                Rarity
              </label>
              <select
                id="rarity"
                name="rarity"
                value={formData.rarity}
                onChange={handleInputChange}
                className="form-select focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                {rarityOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="archetype_id" className="form-label flex items-center gap-2">
                <span className="text-indigo-500">🏛️</span>
                Archetype (optional)
              </label>
              <select
                id="archetype_id"
                name="archetype_id"
                value={formData.archetype_id}
                onChange={handleInputChange}
                className="form-select focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">None</option>
                {archetypeOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="power" className="form-label flex items-center gap-2">
                  <span className="text-red-500">⚔️</span>
                  Power
                </label>
                <input
                  type="text"
                  id="power"
                  name="power"
                  value={formData.power}
                  onChange={handleInputChange}
                  className="form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="*"
                />
              </div>

              <div className="form-group">
                <label htmlFor="toughness" className="form-label flex items-center gap-2">
                  <span className="text-blue-500">🛡️</span>
                  Toughness
                </label>
                <input
                  type="text"
                  id="toughness"
                  name="toughness"
                  value={formData.toughness}
                  onChange={handleInputChange}
                  className="form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="*"
                />
              </div>
            </div>

            {/* Card Preview */}
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Preview</h3>
              </div>
              <div className={`card-preview ${
                formData.rarity === 'mythic' ? 'card-preview-mythic' :
                formData.rarity === 'rare' ? 'card-preview-rare' :
                formData.rarity === 'uncommon' ? 'card-preview-uncommon' :
                'card-preview-common'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">{formData.name || 'Card Name'}</h4>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                      {formData.mana_cost || '{cost}'}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                      formData.rarity === 'mythic' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      formData.rarity === 'rare' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                      formData.rarity === 'uncommon' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                      'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {formData.rarity}
                    </div>
                  </div>
                </div>
                
                {formData.type_line && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium italic">
                    {formData.type_line}
                  </div>
                )}
                
                {formData.text && (
                  <div className="text-sm mb-3 leading-relaxed text-gray-700 dark:text-gray-300">
                    {formData.text}
                  </div>
                )}
                
                {formData.power && formData.toughness && (
                  <div className="text-right">
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full text-sm font-bold text-gray-800 dark:text-gray-200">
                      {formData.power}/{formData.toughness}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
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
            <X className="w-4 h-4 mr-2" />
            Clear Form
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Card
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCard;
