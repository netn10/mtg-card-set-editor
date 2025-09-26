import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

const DeleteCardModal = ({ isOpen, onClose, onConfirm, cardName }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--danger">
        <div className="modal-header">
          <div className="modal-header__leading">
            <div className="modal-icon modal-icon--danger">
              <Trash2 size={18} />
            </div>
            <div>
              <h2 className="modal-title">Delete card</h2>
              <p className="modal-subtitle">Removing this card is permanent</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-body__content">
            <p>
              Are you sure you want to delete <strong>{cardName}</strong> from this set?
            </p>
            <p className="modal-body__note">
              Any archetype assignments and statistics will update automatically after deletion.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="btn btn-danger">
            <AlertTriangle size={16} />
            Delete card
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCardModal;
