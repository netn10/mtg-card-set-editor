import React, { useState } from 'react';
import { Edit, Trash2, Eye, Grid as GridIcon, List as ListIcon } from 'lucide-react';
import CardModal from './CardModal';
import DeleteCardModal from './DeleteCardModal';
import MTGCard from './MTGCard';

const CardList = ({ cards, archetypes = [], totalCards = 0, colorDistribution = {}, onCardDeleted }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

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

  // Create grid positions with numbered slots
  const createGridPositions = () => {
    if (totalCards === 0) return [];
    
    const positions = [];
    const maxSlots = totalCards;
    
    // Sort cards by creation order (using ID as proxy for creation order)
    const sortedCards = [...cards].sort((a, b) => a.id - b.id);
    
    for (let i = 1; i <= maxSlots; i++) {
      const card = sortedCards[i - 1] || null;
      const expectedColor = getExpectedColorForPosition(i);
      positions.push({
        position: i,
        card: card,
        isEmpty: !card,
        expectedColor: expectedColor
      });
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
      <div className="empty-state">
        <Eye className="empty-state-icon" />
        <h3 className="text-xl font-semibold mb-2">No Cards Yet</h3>
        <p className="text-gray-500">
          Start adding cards to your set to see them here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Cards ({cards.length})</h2>
        <div className="flex items-center gap-2">
          <button
            className={`btn btn-secondary btn-sm ${viewMode === 'grid' ? 'font-bold' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <GridIcon size={16} /> Grid
          </button>
          <button
            className={`btn btn-secondary btn-sm ${viewMode === 'list' ? 'font-bold' : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <ListIcon size={16} /> List
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="mtg-grid-container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          justifyContent: 'center',
          padding: '20px 0'
        }}>
          {createGridPositions().map(({ position, card, isEmpty, expectedColor }) => (
            <div key={position}>
              {isEmpty ? (
                <EmptyGridSpot position={position} expectedColor={expectedColor} />
              ) : (
                <MTGCard
                  card={card}
                  onView={(card) => setSelectedCard(card)}
                  onEdit={(card) => setSelectedCard({ ...card, isEditing: true })}
                  onDelete={handleDeleteClick}
                />
              )}
            </div>
          ))}
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
            {cards.map((card) => (
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
