import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye, Plus, BarChart3, Calendar, Target } from 'lucide-react';
import DeleteSetModal from './DeleteSetModal';
import LoadingSpinner from './LoadingSpinner';

const SetList = ({ sets, loading, onDelete, onUpdate }) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Custom Sets</h1>
        <Link to="/create" className="btn btn-primary">
          <Plus size={20} />
          New Set
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sets.map((set) => (
          <div key={set.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold">{set.name}</h3>
              <div className="flex gap-2">
                <Link 
                  to={`/set/${set.id}`} 
                  className="btn btn-sm btn-secondary"
                  title="View Set"
                >
                  <Eye size={16} />
                </Link>
                <button
                  onClick={() => handleDeleteClick(set)}
                  className="btn btn-sm btn-danger"
                  title="Delete Set"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {set.description && (
              <p className="text-gray-600 mb-4 text-sm">{set.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-sm text-gray-500">Total Cards</div>
                  <div className="font-bold text-lg text-gray-800">{set.card_count || 0}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-sm text-gray-500">Target</div>
                  <div className="font-bold text-lg text-gray-800">{set.total_cards}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {[
                { key: 'white_cards', color: 'white', label: 'W' },
                { key: 'blue_cards', color: 'blue', label: 'U' },
                { key: 'black_cards', color: 'black', label: 'B' },
                { key: 'red_cards', color: 'red', label: 'R' },
                { key: 'green_cards', color: 'green', label: 'G' }
              ].map(({ key, color, label }) => (
                <div key={key} className="text-center">
                  <div className={`color-indicator color-${color}`}></div>
                  <div className="text-xs text-gray-500">{label}</div>
                  <div className="text-sm font-medium">{set[key]}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 pt-3 border-t border-gray-100">
              <Calendar className="w-4 h-4" />
              Created {formatDate(set.created_at)}
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
