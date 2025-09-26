import React from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

const DeleteSetModal = ({ isOpen, onClose, onConfirm, setName }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--danger">
        <div className="modal-header">
          <div className="modal-header__leading">
            <div className="modal-icon modal-icon--danger">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h2 className="modal-title">Delete set</h2>
              <p className="modal-subtitle">This action cannot be undone</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-body__content">
            <p>
              You are about to permanently remove <strong>{setName}</strong> and every card it contains.
            </p>
            <p className="modal-body__note">
              Consider exporting any card data you want to keep before confirming.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="btn btn-danger">
            <AlertTriangle size={16} />
            Delete set
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSetModal;
