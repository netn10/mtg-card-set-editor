import React, { useState, useMemo } from 'react';
import {
  Edit,
  Trash2,
  Eye,
  Grid as GridIcon,
  List as ListIcon,
  Filter,
  SortAsc,
  SortDesc,
  X,
  Compass
} from 'lucide-react';
import CardModal from './CardModal';
import DeleteCardModal from './DeleteCardModal';
import MTGCard from './MTGCard';

const CardList = ({ cards, archetypes = [], totalCards = 0, colorDistribution = {}, onCardDeleted }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  
  // Filter and sort state
  const [filters, setFilters] = useState({
    name: '',
    type: '',
    rarity: '',
    colors: [],
    archetype: ''
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort logic
  const filteredAndSortedCards = useMemo(() => {
    let filtered = cards.filter(card => {
      // Name filter
      if (filters.name && !card.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      
      // Type filter
      if (filters.type && !card.type_line?.toLowerCase().includes(filters.type.toLowerCase())) {
        return false;
      }
      
      // Rarity filter
      if (filters.rarity && card.rarity !== filters.rarity) {
        return false;
      }
      
      // Color filter
      if (filters.colors.length > 0) {
        const cardColors = card.colors || [];
        const hasMatchingColor = filters.colors.some(filterColor => 
          cardColors.includes(filterColor)
        );
        if (!hasMatchingColor) {
          return false;
        }
      }
      
      // Archetype filter
      if (filters.archetype && card.archetype?.name !== filters.archetype) {
        return false;
      }
      
      return true;
    });

    // Sort the filtered cards
    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'rarity':
          const rarityOrder = { 'common': 1, 'uncommon': 2, 'rare': 3, 'mythic': 4 };
          aValue = rarityOrder[a.rarity] || 0;
          bValue = rarityOrder[b.rarity] || 0;
          break;
        case 'type':
          aValue = a.type_line?.toLowerCase() || '';
          bValue = b.type_line?.toLowerCase() || '';
          break;
        case 'mana_cost':
          aValue = a.mana_cost || '';
          bValue = b.mana_cost || '';
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'serial':
          // For serial sorting, we need to find the position of each card in the original grid
          // This requires us to sort by the position in the original card order
          const allCards = [...cards].sort((x, y) => x.id - y.id); // Original order
          aValue = allCards.findIndex(card => card.id === a.id) + 1;
          bValue = allCards.findIndex(card => card.id === b.id) + 1;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [cards, filters, sortBy, sortOrder]);

  // Filter and sort handlers
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleColorFilterToggle = (color) => {
    setFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      type: '',
      rarity: '',
      colors: [],
      archetype: ''
    });
  };

  const hasActiveFilters = () => {
    return filters.name || filters.type || filters.rarity || filters.colors.length > 0 || filters.archetype;
  };

  const handleDeleteClick = (card) => {
    setCardToDelete(card);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (cardToDelete) {
      try {
        const response = await fetch(`/api/cards/${cardToDelete.id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          onCardDeleted();
          setDeleteModalOpen(false);
          setCardToDelete(null);
        } else {
          console.error('Failed to delete card');
        }
      } catch (error) {
        console.error('Error deleting card:', error);
      }
    }
  };

  const getColorClass = (colors) => {
    if (!colors || colors.length === 0) return 'colorless';
    if (colors.length === 1) return colors[0];
    return 'multicolor';
  };

  const getRarityClass = (rarity) => {
    const rarityMap = {
      'common': 'text-gray-600',
      'uncommon': 'text-blue-600',
      'rare': 'text-yellow-600',
      'mythic': 'text-red-600'
    };
    return rarityMap[rarity] || 'text-gray-600';
  };

  const getRarityBorderClass = (rarity) => {
    const rarityMap = {
      'common': 'border-gray-300',
      'uncommon': 'border-blue-300',
      'rare': 'border-yellow-300',
      'mythic': 'border-red-300'
    };
    return rarityMap[rarity] || 'border-gray-300';
  };

  const getRarityBadgeClass = (rarity) => {
    const rarityMap = {
      'common': 'bg-gray-100 text-gray-800',
      'uncommon': 'bg-blue-100 text-blue-800',
      'rare': 'bg-yellow-100 text-yellow-800',
      'mythic': 'bg-red-100 text-red-800'
    };
    return rarityMap[rarity] || 'bg-gray-100 text-gray-800';
  };

  const formatManaCost = (manaCost) => {
    if (!manaCost) return '';
    // Simple mana cost formatting - you could enhance this with proper mana symbols
    return manaCost.replace(/\{([^}]+)\}/g, '$1');
  };

  // Calculate expected color for a position based on set distribution
  const getExpectedColorForPosition = (position) => {
    if (!colorDistribution || totalCards === 0) return 'colorless';
    
    const colorRanges = [];
    let currentPosition = 1;
    
    // Define color order and their counts
    const colorOrder = [
      { key: 'white_cards', color: 'white' },
      { key: 'blue_cards', color: 'blue' },
      { key: 'black_cards', color: 'black' },
      { key: 'red_cards', color: 'red' },
      { key: 'green_cards', color: 'green' },
      { key: 'colorless_cards', color: 'colorless' },
      { key: 'multicolor_cards', color: 'multicolor' },
      { key: 'lands_cards', color: 'land' },
      { key: 'basic_lands_cards', color: 'basic-land' }
    ];
    
    // Build ranges for each color
    colorOrder.forEach(({ key, color }) => {
      const count = colorDistribution[key] || 0;
      if (count > 0) {
        colorRanges.push({
          color: color,
          start: currentPosition,
          end: currentPosition + count - 1
        });
        currentPosition += count;
      }
    });
    
    // Find which color range this position falls into
    const range = colorRanges.find(r => position >= r.start && position <= r.end);
    return range ? range.color : 'colorless';
  };

  // Calculate the actual set position based on color distribution
  const getActualSetPosition = (card, position) => {
    if (!colorDistribution || !card.colors || card.colors.length === 0) {
      return position; // Fallback to grid position
    }
    
    const colorRanges = [];
    let currentPosition = 1;
    
    // Define color order and their counts
    const colorOrder = [
      { key: 'white_cards', color: 'white' },
      { key: 'blue_cards', color: 'blue' },
      { key: 'black_cards', color: 'black' },
      { key: 'red_cards', color: 'red' },
      { key: 'green_cards', color: 'green' },
      { key: 'colorless_cards', color: 'colorless' },
      { key: 'multicolor_cards', color: 'multicolor' },
      { key: 'lands_cards', color: 'land' },
      { key: 'basic_lands_cards', color: 'basic-land' }
    ];
    
    // Build ranges for each color
    colorOrder.forEach(({ key, color }) => {
      const count = colorDistribution[key] || 0;
      if (count > 0) {
        colorRanges.push({
          color: color,
          start: currentPosition,
          end: currentPosition + count - 1,
          count: count
        });
        currentPosition += count;
      }
    });
    
    // Find which color range this card belongs to
    const cardColor = card.colors.length === 1 ? card.colors[0] : 
                     card.colors.length > 1 ? 'multicolor' : 'colorless';
    
    const range = colorRanges.find(r => r.color === cardColor);
    if (range) {
      // Calculate position within the color group based on card order
      const cardsInColorGroup = filteredAndSortedCards.filter(c => {
        if (c.colors.length === 1) return c.colors[0] === cardColor;
        if (c.colors.length > 1) return cardColor === 'multicolor';
        return cardColor === 'colorless';
      });
      
      const cardIndexInGroup = cardsInColorGroup.findIndex(c => c.id === card.id);
      return range.start + cardIndexInGroup;
    }
    
    return position; // Fallback to grid position
  };

  // Create grid positions with numbered slots
  const createGridPositions = () => {
    if (totalCards === 0) return [];
    
    const positions = [];
    
    // If sorting by serial, always show all positions including empty ones
    // If filters are active but not sorting by serial, only show filtered cards without empty spots
    if (hasActiveFilters() && sortBy !== 'serial') {
      filteredAndSortedCards.forEach((card, index) => {
        const position = index + 1;
        const actualSetPosition = getActualSetPosition(card, position);
        positions.push({
          position: position,
          card: card,
          isEmpty: false,
          expectedColor: getExpectedColorForPosition(card.id), // Use card ID for expected color
          actualSetPosition: actualSetPosition
        });
      });
    } else {
      // Show all positions including empty ones (for serial sorting or no filters)
      const maxSlots = totalCards;
      
      // Create a map of cards by their actual set position for serial sorting
      const cardsByPosition = {};
      if (sortBy === 'serial') {
        filteredAndSortedCards.forEach(card => {
          const actualPosition = getActualSetPosition(card, 1); // Get the correct set position
          cardsByPosition[actualPosition] = card;
        });
      }
      
      for (let i = 1; i <= maxSlots; i++) {
        let card = null;
        if (sortBy === 'serial') {
          // For serial sorting, place cards in their correct set positions
          card = cardsByPosition[i] || null;
        } else {
          // For other sorting, use the filtered order
          card = filteredAndSortedCards[i - 1] || null;
        }
        
        const expectedColor = getExpectedColorForPosition(i);
        const actualSetPosition = card ? getActualSetPosition(card, i) : i;
        positions.push({
          position: i,
          card: card,
          isEmpty: !card,
          expectedColor: expectedColor,
          actualSetPosition: actualSetPosition
        });
      }
    }
    
    return positions;
  };

  // Empty grid spot component
  const EmptyGridSpot = ({ position, expectedColor }) => (
    <div className={`empty-grid-spot empty-grid-spot-${expectedColor}`}>
      <div className="empty-grid-spot-content">
        <div className="empty-grid-spot-number">{position}</div>
        <div className="empty-grid-spot-label">Empty</div>
        <div className="empty-grid-spot-color">
          <div className={`color-indicator color-${expectedColor}`}></div>
        </div>
      </div>
    </div>
  );

  if (cards.length === 0) {
    return (
      <div className="card collection-empty">
        <Eye className="collection-empty__icon" />
        <h3 className="set-card__title">No cards yet</h3>
        <p className="set-card__description">
          Start adding cards to fill out this set’s slots. Track color balance, rarity spread, and archetypes as you go.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Enhanced Header */}
      <div className="collection-header">
        <div className="collection-header__primary">
          <div className="collection-header__icon">
            <Compass size={18} />
          </div>
          <div>
            <h2 className="collection-header__title">Set collection</h2>
            <p className="collection-header__meta">
              {filteredAndSortedCards.length} of {cards.length} cards
              {hasActiveFilters() && ' (filtered)'}
            </p>
          </div>
        </div>

        <div className="collection-header__actions">
          <button
            className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowFilters(!showFilters)}
            title="Toggle filters"
          >
            <Filter size={16} />
            Filters
            {hasActiveFilters() && <span className="dot-indicator" />}
          </button>

          <div className="segmented-control segmented-control--small" role="radiogroup" aria-label="Select card view">
            <button
              className={`segmented-control__option ${viewMode === 'grid' ? 'is-active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
            >
              <GridIcon size={15} />
              <span>Grid</span>
            </button>
            <button
              className={`segmented-control__option ${viewMode === 'list' ? 'is-active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
            >
              <ListIcon size={15} />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="card filters-panel">
          <div className="filters-panel__header">
            <div className="filters-panel__title">
              <Filter size={18} />
              Refine your card collection
            </div>
            {hasActiveFilters() && (
              <button onClick={clearFilters} className="filters-reset" title="Clear all filters">
                <X size={14} />
                Clear all
              </button>
            )}
          </div>

          <div className="filters-grid">
            {/* Name Filter */}
            <div className="form-group">
              <label className="form-label flex items-center gap-2">
                <span className="text-blue-500">🔍</span>
                Name
              </label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                placeholder="Search by name..."
                className="form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {/* Type Filter */}
            <div className="form-group">
              <label className="form-label flex items-center gap-2">
                <span className="text-green-500">🏷️</span>
                Type
              </label>
              <input
                type="text"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                placeholder="Search by type..."
                className="form-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {/* Rarity Filter */}
            <div className="form-group">
              <label className="form-label flex items-center gap-2">
                <span className="text-yellow-500">⭐</span>
                Rarity
              </label>
              <select
                value={filters.rarity}
                onChange={(e) => handleFilterChange('rarity', e.target.value)}
                className="form-select focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">All Rarities</option>
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="mythic">Mythic</option>
              </select>
            </div>

            {/* Archetype Filter */}
            <div className="form-group">
              <label className="form-label flex items-center gap-2">
                <span className="text-indigo-500">🏛️</span>
                Archetype
              </label>
              <select
                value={filters.archetype}
                onChange={(e) => handleFilterChange('archetype', e.target.value)}
                className="form-select focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">All Archetypes</option>
                {archetypes.map(archetype => (
                  <option key={archetype.id} value={archetype.name}>
                    {archetype.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Filter */}
            <div className="form-group">
              <label className="form-label flex items-center gap-2">
                <span className="text-purple-500">🎨</span>
                Colors
              </label>
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {['white', 'blue', 'black', 'red', 'green', 'colorless'].map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorFilterToggle(color)}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      filters.colors.includes(color) 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 shadow-sm' 
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className={`color-indicator color-${color} w-4 h-4 border-2`}></div>
                    <span className="capitalize">{color}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Controls */}
            <div className="form-group">
              <label className="form-label flex items-center gap-2">
                <span className="text-orange-500">📊</span>
                Sort By
              </label>
          <div className="segmented-control segmented-control--small" role="radiogroup" aria-label="Sort cards">
                {[
                  { key: 'name', label: 'Name', icon: '📝' },
                  { key: 'rarity', label: 'Rarity', icon: '⭐' },
                  { key: 'type', label: 'Type', icon: '🏷️' },
                  { key: 'mana_cost', label: 'Cost', icon: '⚡' },
                  { key: 'serial', label: 'Serial', icon: '🔢' },
                  { key: 'created_at', label: 'Date', icon: '📅' }
                ].map(option => (
                  <button
                    key={option.key}
                    onClick={() => handleSortChange(option.key)}
                className={`segmented-control__option ${sortBy === option.key ? 'is-active' : ''}`}
                aria-pressed={sortBy === option.key}
                  >
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                    {sortBy === option.key && (
                      <div className="ml-1">
                        {sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'grid' ? (
        <div>
          {hasActiveFilters() && sortBy !== 'serial' && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Filtering Active:</strong> Showing {filteredAndSortedCards.length} of {cards.length} cards. Empty spots are hidden when filtering.
              </p>
            </div>
          )}
          {hasActiveFilters() && sortBy === 'serial' && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>Serial Sorting:</strong> Showing all positions including empty slots in their correct order.
              </p>
            </div>
          )}
          <div className="mtg-grid-container" style={{
            display: 'grid',
            gridTemplateColumns: (hasActiveFilters() && sortBy !== 'serial')
              ? 'repeat(auto-fill, minmax(200px, 1fr))' 
              : 'repeat(4, 1fr)',
            gap: '20px',
            justifyContent: 'center',
            padding: '20px 0'
          }}>
          {createGridPositions().map(({ position, card, isEmpty, expectedColor, actualSetPosition }) => (
            <div key={hasActiveFilters() ? card?.id || position : position}>
              {isEmpty ? (
                <EmptyGridSpot position={position} expectedColor={expectedColor} />
              ) : (
                <MTGCard
                  card={card}
                  onView={(card) => setSelectedCard(card)}
                  onEdit={(card) => setSelectedCard({ ...card, isEditing: true })}
                  onDelete={handleDeleteClick}
                  cardNumber={actualSetPosition}
                  totalCards={totalCards}
                />
              )}
            </div>
          ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="grid grid-cols-4 gap-4 mb-2 text-sm text-gray-600">
            <div>Name</div>
            <div>Type</div>
            <div>Cost / Colors</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="space-y-2">
            {filteredAndSortedCards.map((card) => (
              <div key={card.id} className={`flex items-center justify-between p-4 ${getRarityBorderClass(card.rarity)}`}>
                <div className="grid grid-cols-4 gap-4 flex-1 items-center">
                  <div>
                    <div className="font-medium">{card.name}</div>
                    <div className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${getRarityBadgeClass(card.rarity)}`}>
                      {card.rarity}
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">{card.type_line || '-'}</div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm">{formatManaCost(card.mana_cost)}</span>
                    <div className="flex gap-1">
                      {card.colors && card.colors.length > 0 ? (
                        card.colors.map((color, index) => (
                          <div key={index} className={`color-indicator color-${color}`}></div>
                        ))
                      ) : (
                        <div className="color-indicator color-colorless"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => setSelectedCard(card)}
                      className="btn btn-sm btn-secondary"
                      title="View Card"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => setSelectedCard({ ...card, isEditing: true })}
                      className="btn btn-sm btn-secondary"
                      title="Edit Card"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(card)}
                      className="btn btn-sm btn-danger"
                      title="Delete Card"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CardModal
        card={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        onCardUpdated={onCardDeleted}
        archetypes={archetypes}
      />

      <DeleteCardModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCardToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        cardName={cardToDelete?.name}
      />
    </div>
  );
};

export default CardList;
