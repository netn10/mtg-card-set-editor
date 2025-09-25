import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DeleteSetModal = ({ isOpen, onClose, onConfirm, setName }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <h2 className="modal-title">Delete Set</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete <strong>"{setName}"</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. All cards in this set will be permanently deleted.
            </p>
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
            type="button"
            onClick={onConfirm}
            className="btn btn-danger"
          >
            <AlertTriangle size={16} />
            Delete Set
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSetModal;
