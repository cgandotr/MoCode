import React from 'react';
import './ConfirmStatus.css';
import ReactDOM from 'react-dom';

/* Custom imports */
import CancelIcon from "../extra/cancel.svg"

/* MUI Library Imports */
import Button from '@mui/lab/LoadingButton';


/*
ConfirmStatus
------------------------------------
Modal that opens when user tries to set problem status
Communicates with 'Home' Component
------------------------------------
inputs:
    isOpen (indicates modal is open)
    source (tells us what status user is trying to confirm) (Complete/InComplete)

outputs:
    onConfirm (indicates user confirmed)
    onCancel (indicates user did not confirm)
*/
function ConfirmStatus({ isOpen, onConfirm, onCancel, source }) {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        (
            <div className="modal-overlay">
                <div className="modal-content">
                    <img id="cancel-button" onClick={onCancel} src={CancelIcon}/>
                    <h3 id="message">Confirm marking this Question as {source}?</h3>
                    <h3 id="warning">This action cannot be undone.</h3>
                    <Button id="confirm-button" variant="contained" color="primary" type="submit" onClick={onConfirm}>
                        Confirm
                    </Button>
                </div>
            </div>
        ),
        document.body
    );
}
export default ConfirmStatus;
