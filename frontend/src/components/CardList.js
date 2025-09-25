import React, { useState } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import CardModal from './CardModal';
import DeleteCardModal from './DeleteCardModal';

const CardList = ({ cards, onCardDeleted }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.id} className={`card border-2 ${getRarityBorderClass(card.rarity)}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{card.name}</h3>
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getRarityBadgeClass(card.rarity)}`}>
                  {card.rarity}
                </div>
              </div>
              <div className="flex gap-1">
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

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Cost:</span>
                <span className="font-mono text-sm">
                  {formatManaCost(card.mana_cost)}
                </span>
              </div>

              {card.type_line && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Type:</span>
                  <span className="text-sm">{card.type_line}</span>
                </div>
              )}

              {card.power && card.toughness && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">P/T:</span>
                  <span className="font-mono text-sm">
                    {card.power}/{card.toughness}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Colors:</span>
                <div className="flex gap-1">
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
            </div>

            {card.text && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-sm text-gray-600 line-clamp-3">
                  {card.text}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <CardModal
        card={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        onCardUpdated={onCardDeleted}
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
