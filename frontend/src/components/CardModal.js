import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';

const CardModal = ({ card, isOpen, onClose, onCardUpdated, archetypes = [] }) => {
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  useEffect(() => {
    if (card) {
      setFormData({
        name: card.name || '',
        mana_cost: card.mana_cost || '',
        type_line: card.type_line || '',
        text: card.text || '',
        power: card.power || '',
        toughness: card.toughness || '',
        colors: card.colors || [],
        rarity: card.rarity || 'common',
        archetype_id: card.archetype?.id || ''
      });
    }
  }, [card]);

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
    setError('');
    setSuccess(false);

    try {
      const payload = { ...formData };
      if (!payload.archetype_id) {
        delete payload.archetype_id;
      }
      const response = await fetch(`/api/cards/${card.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(true);
        onCardUpdated();
        
        // Clear success message and close modal after 1 second
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update card');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error updating card:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatManaCost = (manaCost) => {
    if (!manaCost) return '';
    return manaCost.replace(/\{([^}]+)\}/g, '$1');
  };

  if (!isOpen || !card) return null;

  const archetypeOptions = archetypes.map(a => ({ 
    value: a.id, 
    label: `${a.color_pair} — ${a.title || a.name}` 
  }));

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {card.isEditing ? 'Edit Card' : 'View Card'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-state mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message mb-4">
              Card updated successfully!
            </div>
          )}

          {card.isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="text-xs text-gray-500 mt-1">
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
                      rows={4}
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
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Preview</h4>
                    <div className={`border rounded-lg p-3 text-sm ${
                      formData.rarity === 'mythic' ? 'border-yellow-400 bg-yellow-50' :
                      formData.rarity === 'rare' ? 'border-gold-400 bg-gold-50' :
                      formData.rarity === 'uncommon' ? 'border-silver-400 bg-silver-50' :
                      'border-gray-300 bg-gray-50'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold">{formData.name || 'Card Name'}</h5>
                        <div className="flex items-center gap-2">
                          <div className="font-mono">
                            {formatManaCost(formData.mana_cost) || '{cost}'}
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
                        <div className="text-gray-600 mb-2">
                          {formData.type_line}
                        </div>
                      )}
                      
                      {formData.text && (
                        <div className="mb-2">
                          {formData.text}
                        </div>
                      )}
                      
                      {formData.power && formData.toughness && (
                        <div className="text-right font-mono">
                          {formData.power}/{formData.toughness}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={onClose}
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
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            // View mode
            <div className="space-y-4">
              <div className={`border rounded-lg p-4 ${
                card.rarity === 'mythic' ? 'border-yellow-400 bg-yellow-50' :
                card.rarity === 'rare' ? 'border-gold-400 bg-gold-50' :
                card.rarity === 'uncommon' ? 'border-silver-400 bg-silver-50' :
                'border-gray-300 bg-gray-50'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold">{card.name}</h3>
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-lg">
                      {formatManaCost(card.mana_cost)}
                    </div>
                    <div className={`px-3 py-1 rounded text-sm font-medium ${
                      card.rarity === 'mythic' ? 'bg-yellow-100 text-yellow-800' :
                      card.rarity === 'rare' ? 'bg-gold-100 text-gold-800' :
                      card.rarity === 'uncommon' ? 'bg-silver-100 text-silver-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {card.rarity}
                    </div>
                  </div>
                </div>
                
                {card.type_line && (
                  <div className="text-gray-600 mb-3">
                    {card.type_line}
                  </div>
                )}
                
                {card.text && (
                  <div className="mb-3 whitespace-pre-wrap">
                    {card.text}
                  </div>
                )}
                
                {card.power && card.toughness && (
                  <div className="text-right font-mono text-lg">
                    {card.power}/{card.toughness}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Colors</div>
                  <div className="flex gap-1 mt-1">
                    {card.colors && card.colors.length > 0 ? (
                      card.colors.map((color, index) => (
                        <div
                          key={index}
                          className={`color-indicator color-${color}`}
                        ></div>
                      ))
                    ) : (
                      <div className="color-indicator color-colorless"></div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Rarity</div>
                  <div className="font-medium capitalize">{card.rarity}</div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isEditing: true })}
                  className="btn btn-primary"
                >
                  Edit Card
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardModal;
