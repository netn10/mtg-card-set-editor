import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye, Plus, BarChart3, Calendar, Target, Filter, SortAsc, SortDesc, X } from 'lucide-react';
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
          <div className="empty-state-icon-wrapper">
            <BarChart3 className="empty-state-icon" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-gray-800">No Sets Created</h3>
          <p className="text-gray-600 mb-6 max-w-md text-center">
            Create your first custom Magic: The Gathering set to start designing cards and building your collection.
          </p>
          <Link to="/create" className="btn btn-primary btn-lg">
            <Plus size={20} />
            Create New Set
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Custom Sets</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filteredAndSortedSets.length} of {sets.length} sets
                {hasActiveFilters() && ' (filtered)'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          {/* Filter Button */}
          <button
            className={`group relative inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-l-xl border transition-all duration-300 min-h-[3rem] ${
              showFilters 
                ? 'btn-primary border-primary' 
                : 'btn-secondary border-secondary'
            }`}
            onClick={() => setShowFilters(!showFilters)}
            title="Toggle filters"
          >
            <Filter size={16} className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
            Filter
            {hasActiveFilters() && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>
          
          {/* Grid Button */}
          <button
            className={`group inline-flex items-center justify-center px-6 py-3 text-sm font-semibold border-t border-b border-l-0 border-r-0 transition-all duration-300 min-h-[3rem] ${
              viewMode === 'grid'
                ? 'btn-primary border-primary'
                : 'btn-secondary border-secondary'
            }`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <div className="w-4 h-4 mr-2 grid grid-cols-2 gap-0.5">
              <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
            </div>
            Grid
          </button>
          
          {/* List Button */}
          <button
            className={`group inline-flex items-center justify-center px-6 py-3 text-sm font-semibold border rounded-r-xl border-l-0 transition-all duration-300 min-h-[3rem] ${
              viewMode === 'list'
                ? 'btn-primary border-primary'
                : 'btn-secondary border-secondary'
            }`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <div className="w-4 h-4 mr-2 flex flex-col gap-0.5">
              <div className="w-full h-0.5 bg-current rounded"></div>
              <div className="w-full h-0.5 bg-current rounded"></div>
              <div className="w-full h-0.5 bg-current rounded"></div>
            </div>
            List
          </button>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      {showFilters && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Filter & Sort</h3>
            <div className="flex items-center gap-2">
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="btn btn-sm btn-secondary"
                  title="Clear all filters"
                >
                  <X size={14} className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Name Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                placeholder="Search by name..."
                className="input input-sm w-full"
              />
            </div>

            {/* Description Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={filters.description}
                onChange={(e) => handleFilterChange('description', e.target.value)}
                placeholder="Search by description..."
                className="input input-sm w-full"
              />
            </div>

            {/* Min Cards Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Min Cards</label>
              <input
                type="number"
                value={filters.minCards}
                onChange={(e) => handleFilterChange('minCards', e.target.value)}
                placeholder="Minimum cards..."
                className="input input-sm w-full"
              />
            </div>

            {/* Max Cards Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Max Cards</label>
              <input
                type="number"
                value={filters.maxCards}
                onChange={(e) => handleFilterChange('maxCards', e.target.value)}
                placeholder="Maximum cards..."
                className="input input-sm w-full"
              />
            </div>
          </div>

          {/* Sort Controls */}
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <div className="flex gap-2">
              {[
                { key: 'name', label: 'Name' },
                { key: 'created_at', label: 'Date Created' },
                { key: 'card_count', label: 'Current Cards' },
                { key: 'total_cards', label: 'Target Cards' }
              ].map(option => (
                <button
                  key={option.key}
                  onClick={() => handleSortChange(option.key)}
                  className={`btn btn-sm ${
                    sortBy === option.key ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {option.label}
                  {sortBy === option.key && (
                    sortOrder === 'asc' ? <SortAsc size={14} className="w-3.5 h-3.5 ml-1" /> : <SortDesc size={14} className="w-3.5 h-3.5 ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={`grid gap-6 ${
        viewMode === 'list' 
          ? 'grid-cols-1' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {filteredAndSortedSets.map((set) => (
          <div key={set.id} className={`card ${
            viewMode === 'list' 
              ? 'flex flex-row items-center' 
              : ''
          }`}>
            {/* Header Section */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1 pr-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{set.name}</h3>
                {set.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{set.description}</p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link 
                  to={`/set/${set.id}`} 
                  className="btn btn-sm btn-secondary flex items-center justify-center"
                  title="View Set"
                >
                  <Eye size={16} className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDeleteClick(set)}
                  className="btn btn-sm btn-danger flex items-center justify-center"
                  title="Delete Set"
                >
                  <Trash2 size={16} className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Cards</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{set.card_count || 0}</div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Target</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{set.total_cards}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Distribution Section */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Color Distribution</h4>
              <div className="flex justify-center items-center gap-4">
                {[
                  { key: 'white_cards', color: 'white', label: 'W' },
                  { key: 'blue_cards', color: 'blue', label: 'U' },
                  { key: 'black_cards', color: 'black', label: 'B' },
                  { key: 'red_cards', color: 'red', label: 'R' },
                  { key: 'green_cards', color: 'green', label: 'G' }
                ].map(({ key, color, label }) => (
                  <div key={key} className="flex flex-col items-center">
                    <div className={`color-indicator color-${color} mb-2 w-8 h-8 border-2`}></div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{set[key] || 0}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Section */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>Created {formatDate(set.created_at)}</span>
            </div>
          </div>
        ))}
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
