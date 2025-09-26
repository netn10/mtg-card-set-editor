import React, { useState } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';

const MTGCard = ({ card, onView, onEdit, onDelete, cardNumber, totalCards }) => {
  const [viewMode, setViewMode] = useState('render'); // 'render' or 'image'
  // MTG card dimensions (2.5" x 3.5" ratio)
  const cardWidth = 240; // pixels
  const cardHeight = 336; // pixels

  const formatManaCost = (manaCost) => {
    if (!manaCost) {
      return '';
    }
    
    // Parse mana cost with proper curly brace handling
    const manaSymbols = manaCost.match(/\{[^}]+\}/g) || [];
    
    return manaSymbols.map((symbol, index) => {
      const cleanSymbol = symbol.replace(/[{}]/g, ''); // Remove curly braces
      
      if (cleanSymbol.match(/[0-9]/)) {
        return <span key={index} className="mana-cost-number">{cleanSymbol}</span>;
      } else {
        const colorMap = {
          'W': { color: '#f8f5f0', border: '#d1d5db' },
          'U': { color: '#0e68ab', border: '#0e68ab' },
          'B': { color: '#150b00', border: '#150b00' },
          'R': { color: '#d3202a', border: '#d3202a' },
          'G': { color: '#00733e', border: '#00733e' },
          'X': { color: '#c5c5c5', border: '#9ca3af' }
        };
        const color = colorMap[cleanSymbol] || { color: '#c5c5c5', border: '#9ca3af' };
        return (
          <span 
            key={index} 
            className="mana-symbol"
            style={{ 
              backgroundColor: color.color,
              borderColor: color.border,
              color: cleanSymbol === 'W' ? '#000' : '#fff'
            }}
          >
            {cleanSymbol}
          </span>
        );
      }
    });
  };

  const getCardBorderColor = (rarity) => {
    switch (rarity) {
      case 'mythic': return '#fbbf24';
      case 'rare': return '#f59e0b';
      case 'uncommon': return '#9ca3af';
      default: return '#d1d5db';
    }
  };

  const getCardBackground = (colors) => {
    if (!colors || colors.length === 0) {
      return 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)';
    }
    if (colors.length === 1) {
      const colorMap = {
        'white': 'linear-gradient(135deg, #fefefe 0%, #f8f5f0 100%)',
        'blue': 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
        'black': 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
        'red': 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)',
        'green': 'linear-gradient(135deg, #dcfce7 0%, #86efac 100%)'
      };
      return colorMap[colors[0]] || 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)';
    }
    return 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)'; // Multicolor
  };


  const handleCardClick = (e) => {
    // Don't toggle if clicking on action buttons
    if (e.target.closest('.card-actions')) {
      return;
    }
    
    // Only toggle if there's an image available
    if (card.image_url) {
      setViewMode(prev => prev === 'render' ? 'image' : 'render');
    }
  };

  return (
    <div 
      className={`mtg-card ${card.image_url ? 'has-image' : ''}`}
      data-view-mode={viewMode}
      style={{
        width: cardWidth,
        height: cardHeight,
        border: `3px solid ${getCardBorderColor(card.rarity)}`,
        background: getCardBackground(card.colors),
        borderRadius: '12px',
        position: 'relative',
        cursor: card.image_url ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={handleCardClick}
      onMouseEnter={(e) => {
        if (!card.image_url) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.25)';
        }
      }}
      onMouseLeave={(e) => {
        if (!card.image_url) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }
      }}
    >
      {viewMode === 'image' && card.image_url ? (
        // Full image view
        <div className="card-image-view" style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.1)',
          position: 'relative'
        }}>
          <img 
            src={card.image_url} 
            alt={card.name}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
          {/* Overlay with card name */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            right: '8px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            {card.name}
          </div>
        </div>
      ) : (
        // Render view (existing content)
        <div className="card-render-view">
      {/* Card Header */}
      <div className="card-header" style={{
        padding: '12px',
        borderBottom: '2px solid rgba(0, 0, 0, 0.1)',
        background: 'rgba(255, 255, 255, 0.95)',
        position: 'relative',
        borderRadius: '8px 8px 0 0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '8px'
        }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0,
            lineHeight: '1.2',
            maxWidth: '140px',
            fontFamily: 'Arial, sans-serif'
          }}>
            {card.name}
          </h3>
          <div className="mana-cost" style={{
            display: 'flex',
            gap: '2px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {formatManaCost(card.mana_cost)}
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div className="type-line" style={{
            fontSize: '11px',
            color: '#6b7280',
            fontWeight: '600',
            fontFamily: 'Arial, sans-serif'
          }}>
            {card.type_line}
          </div>
          <div className={`rarity-badge rarity-${card.rarity}`} style={{
            padding: '2px 6px',
            borderRadius: '8px',
            fontSize: '8px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {card.rarity}
          </div>
        </div>
      </div>

      {/* Card Art Area */}
      <div className="card-art" style={{
        height: '140px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        borderBottom: '2px solid rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        margin: '0 8px',
        borderRadius: '6px'
      }}>
        <div style={{
          color: '#9ca3af',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          {card.image_url ? (
            <img 
              src={card.image_url} 
              alt={card.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div>Card Art</div>
          )}
        </div>
      </div>

      {/* Card Text */}
      <div className="card-text" style={{
        padding: '12px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(255, 255, 255, 0.95)',
        margin: '0 8px',
        borderRadius: '0 0 6px 6px'
      }}>
        <div style={{
          fontSize: '11px',
          color: '#374151',
          lineHeight: '1.4',
          flex: 1,
          overflow: 'hidden',
          fontFamily: 'Arial, sans-serif'
        }}>
          {card.text && (
            <div style={{
              maxHeight: '80px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              background: card.text.includes('Discard') ? '#fce7f3' : 'transparent',
              padding: card.text.includes('Discard') ? '8px' : '0',
              borderRadius: '4px',
              border: card.text.includes('Discard') ? '1px solid #f9a8d4' : 'none'
            }}>
              {card.text}
            </div>
          )}
        </div>
        
        {/* Power/Toughness */}
        {card.power && card.toughness && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#1f2937',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '2px 6px',
            borderRadius: '6px',
            border: '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            {card.power}/{card.toughness}
          </div>
        )}
        
        {/* Card Number Display */}
        {cardNumber && totalCards && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '12px',
            fontSize: '10px',
            fontWeight: 'bold',
            color: '#6b7280',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '2px 6px',
            borderRadius: '6px',
            border: '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            {cardNumber}/{totalCards}
          </div>
        )}
      </div>

      {/* Action Buttons Overlay */}
      <div className="card-actions" style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        display: 'flex',
        gap: '4px',
        opacity: 0,
        transition: 'opacity 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '0';
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(card);
          }}
          style={{
            background: 'rgba(59, 130, 246, 0.9)',
            border: 'none',
            borderRadius: '4px',
            padding: '4px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="View Card"
        >
          <Eye size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(card);
          }}
          style={{
            background: 'rgba(107, 114, 128, 0.9)',
            border: 'none',
            borderRadius: '4px',
            padding: '4px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Edit Card"
        >
          <Edit size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card);
          }}
          style={{
            background: 'rgba(239, 68, 68, 0.9)',
            border: 'none',
            borderRadius: '4px',
            padding: '4px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Delete Card"
        >
          <Trash2 size={12} />
        </button>
      </div>
        </div>
      )}
    </div>
  );
};

export default MTGCard;
