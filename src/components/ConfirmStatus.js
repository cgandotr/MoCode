// ConfirmationModal.js
import React from 'react';
import './ConfirmStatus.css'; // Create and import your CSS for styling the modal
import ReactDOM from 'react-dom';

function ConfirmStatus({ isOpen, onConfirm, onCancel, source }) {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        (
            <div className="modal-overlay">
                <div className="modal-content">
                    <button id="cancel-button" onClick={onCancel} >X</button>
                    <h3 id="message">Are you sure you want to mark this Question as {source}?</h3>
                    <h3 id="warning">You cannot undo this action.</h3>
                    <button id="confirm-button" onClick={onConfirm}>Confirm</button>
                </div>
            </div>
        ),
        document.body // Render the modal into the body element
    );
}
export default ConfirmStatus;
