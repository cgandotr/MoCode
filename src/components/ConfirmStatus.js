// ConfirmationModal.js
import React from 'react';
import './ConfirmStatus.css'; // Create and import your CSS for styling the modal
import ReactDOM from 'react-dom';
import CancelIcon from "../extra/cancel.svg"
import Button from '@mui/lab/LoadingButton';

function ConfirmStatus({ isOpen, onConfirm, onCancel, source }) {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        (
            <div className="modal-overlay">
                <div className="modal-content">
                    <img
                            id="cancel-button"
                            onClick={onCancel}
                            src={CancelIcon}
                           
                        />

                    <h3 id="message">Confirm marking this Question as {source}?</h3>
                    <h3 id="warning">This action cannot be undone.</h3>
                    <Button id="confirm-button" variant="contained" color="primary" type="submit" onClick={onConfirm}>
                        Confirm
                    </Button>
                </div>
            </div>
        ),
        document.body // Render the modal into the body element
    );
}
export default ConfirmStatus;
