import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye, Plus, BarChart3 } from 'lucide-react';
import DeleteSetModal from './DeleteSetModal';

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
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <div className="empty-state">
        <BarChart3 className="empty-state-icon" />
        <h3 className="text-xl font-semibold mb-2">No Sets Created</h3>
        <p className="text-gray-500 mb-4">
          Create your first custom Magic: The Gathering set to get started.
        </p>
        <Link to="/create" className="btn btn-primary">
          <Plus size={20} />
          Create New Set
        </Link>
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
              <div>
                <div className="text-sm text-gray-500">Total Cards</div>
                <div className="font-semibold">{set.card_count || 0}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Target</div>
                <div className="font-semibold">{set.total_cards}</div>
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

            <div className="text-sm text-gray-500">
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
