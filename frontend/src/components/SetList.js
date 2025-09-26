import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Trash2,
  Eye,
  Plus,
  Filter,
  SortAsc,
  SortDesc,
  X,
  LayoutGrid,
  Rows,
  Sparkles
} from 'lucide-react';
import DeleteSetModal from './DeleteSetModal';
import LoadingSpinner from './LoadingSpinner';

const SetList = ({ sets, loading, onDelete, onUpdate }) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);
  
  // Filter and sort state
  const [filters, setFilters] = useState({
    name: '',
    description: '',
    minCards: '',
    maxCards: ''
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Filter and sort logic
  const filteredAndSortedSets = useMemo(() => {
    let filtered = sets.filter(set => {
      // Name filter
      if (filters.name && !set.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      
      // Description filter
      if (filters.description && !set.description?.toLowerCase().includes(filters.description.toLowerCase())) {
        return false;
      }
      
      // Card count filters
      const cardCount = set.card_count || 0;
      if (filters.minCards && cardCount < parseInt(filters.minCards)) {
        return false;
      }
      if (filters.maxCards && cardCount > parseInt(filters.maxCards)) {
        return false;
      }
      
      return true;
    });

    // Sort the filtered sets
    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'card_count':
          aValue = a.card_count || 0;
          bValue = b.card_count || 0;
          break;
        case 'total_cards':
          aValue = a.total_cards || 0;
          bValue = b.total_cards || 0;
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
  }, [sets, filters, sortBy, sortOrder]);

  // Filter and sort handlers
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
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
      description: '',
      minCards: '',
      maxCards: ''
    });
  };

  const hasActiveFilters = () => {
    return filters.name || filters.description || filters.minCards || filters.maxCards;
  };

  const handleDeleteClick = (set) => {
    setSetToDelete(set);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (setToDelete) {
      try {
        const response = await fetch(`/api/sets/${setToDelete.id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          onDelete(setToDelete.id);
          setDeleteModalOpen(false);
          setSetToDelete(null);
        } else {
          console.error('Failed to delete set');
        }
      } catch (error) {
        console.error('Error deleting set:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-6 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-content">
          <span className="empty-state-badge">Welcome Commander</span>
          <div className="empty-state-icon-wrapper">
            <Sparkles size={54} className="empty-state-icon" />
          </div>
          <h3 className="empty-state-title">Build your first custom set</h3>
          <p className="empty-state-copy">
            Spark your creativity with a brand-new expansion. Set the target distribution, add archetypes, then craft powerful cards card-by-card.
          </p>
          <div className="empty-state-actions">
            <Link to="/create" className="btn btn-primary btn-lg">
              <Plus size={20} />
              Start a Set
            </Link>
            <a
              className="btn btn-ghost btn-lg"
              href="https://magic.wizards.com/en/how-to-play"
              target="_blank"
              rel="noreferrer"
            >
              Learn the basics
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sets-header">
        <div className="sets-header__primary">
          <div className="sets-header__icon">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="sets-header__title">Custom Sets</h1>
            <p className="sets-header__meta">
              {filteredAndSortedSets.length} of {sets.length} sets
              {hasActiveFilters() && ' (filtered)'}
            </p>
          </div>
        </div>

        <div className="sets-header__actions">
          <button
            className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowFilters(!showFilters)}
            title="Toggle filters"
          >
            <Filter size={16} />
            Filters
            {hasActiveFilters() && <span className="dot-indicator" />}
          </button>

          <div className="segmented-control" role="radiogroup" aria-label="Select view mode">
            <button
              className={`segmented-control__option ${viewMode === 'grid' ? 'is-active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
            >
              <LayoutGrid size={16} />
              <span>Grid</span>
            </button>
            <button
              className={`segmented-control__option ${viewMode === 'list' ? 'is-active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
            >
              <Rows size={16} />
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
              Refine results
            </div>
            {hasActiveFilters() && (
              <button className="filters-reset" onClick={clearFilters}>
                <X size={14} />
                Clear all
              </button>
            )}
          </div>

          <div className="filters-grid">
            <div>
              <label className="form-label">Name</label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                placeholder="Search by name"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <input
                type="text"
                value={filters.description}
                onChange={(e) => handleFilterChange('description', e.target.value)}
                placeholder="Search by description"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Min Cards</label>
              <input
                type="number"
                value={filters.minCards}
                onChange={(e) => handleFilterChange('minCards', e.target.value)}
                placeholder="0"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Max Cards</label>
              <input
                type="number"
                value={filters.maxCards}
                onChange={(e) => handleFilterChange('maxCards', e.target.value)}
                placeholder="250"
                className="form-input"
              />
            </div>
          </div>

          <div className="filters-panel__sort">
            <span className="form-label">Sort By</span>
            <div className="segmented-control" role="radiogroup" aria-label="Sort sets">
              {[
                { key: 'name', label: 'Name' },
                { key: 'created_at', label: 'Date created' },
                { key: 'card_count', label: 'Current cards' },
                { key: 'total_cards', label: 'Target cards' }
              ].map(option => (
                <button
                  key={option.key}
                  className={`segmented-control__option ${sortBy === option.key ? 'is-active' : ''}`}
                  onClick={() => handleSortChange(option.key)}
                  aria-pressed={sortBy === option.key}
                >
                  <span>{option.label}</span>
                  {sortBy === option.key && (
                    sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        className={`grid gap-6 ${
          viewMode === 'list'
            ? 'grid-cols-1'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {filteredAndSortedSets.map((set) => {
          const currentCards = set.card_count || 0;
          const totalCards = set.total_cards || 0;
          const completion = totalCards ? Math.round((currentCards / totalCards) * 100) : 0;
          const clampedCompletion = Math.max(0, Math.min(100, completion));
          const remainingCards = totalCards ? Math.max(totalCards - currentCards, 0) : 0;

          return (
            <article
              key={set.id}
              className={`card set-card ${viewMode === 'list' ? 'set-card--list' : ''}`}
            >
            <header className="set-card__header">
              <div className="set-card__header-content">
                <h3 className="set-card__title">{set.name}</h3>
                {set.description && <p className="set-card__description">{set.description}</p>}
                <div className="set-card__meta">
                  <span>Created {formatDate(set.created_at)}</span>
                  <span>Set ID {set.id}</span>
                </div>
              </div>
              <div className="set-card__actions">
                <Link to={`/set/${set.id}`} className="btn btn-secondary btn-icon" title="Open set editor">
                  <Eye size={16} />
                </Link>
                <button
                  onClick={() => handleDeleteClick(set)}
                  className="btn btn-danger btn-icon"
                  title="Delete set"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </header>

            <section className="set-card__stats">
              <div className="set-card__stat">
                <span className="set-card__stat-label">Current cards</span>
                <span className="set-card__stat-value">{currentCards}</span>
              </div>
              <div className="set-card__stat">
                <span className="set-card__stat-label">Target</span>
                <span className="set-card__stat-value">{totalCards}</span>
              </div>
            </section>

            <section className="set-card__colors" aria-label="Color distribution">
              {[
                { key: 'white_cards', color: 'white', label: 'W' },
                { key: 'blue_cards', color: 'blue', label: 'U' },
                { key: 'black_cards', color: 'black', label: 'B' },
                { key: 'red_cards', color: 'red', label: 'R' },
                { key: 'green_cards', color: 'green', label: 'G' }
              ].map(({ key, color, label }) => (
                <div key={key} className="set-card__color">
                  <div className={`color-indicator color-${color}`}></div>
                  <span className="set-card__color-label">{label}</span>
                  <span className="set-card__color-value">{set[key] || 0}</span>
                </div>
              ))}
            </section>

            <footer className="set-card__footer">
              <span>Created {formatDate(set.created_at)}</span>
              <span className="set-card__progress" style={{ '--progress': `${clampedCompletion}%` }}>
                <span>{clampedCompletion}% complete</span>
                <span>·</span>
                <span>{remainingCards} remaining</span>
              </span>
            </footer>
            </article>
          );
        })}
      </div>

      <DeleteSetModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSetToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        setName={setToDelete?.name}
      />
    </div>
  );
};

export default SetList;
