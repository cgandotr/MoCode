import React, { useState, useEffect, useContext } from "react";
import './LoadingPage.css';

/* MUI Library Imports */
import { CircularProgress, Typography } from '@mui/material';

/* AuthContext Imports */
import { AuthContext } from '../AuthContext';


/*
LoadingPage
------------------------------------
Page that should be displayed when we are waiting for tasks to be completed
Uses loadingPage & loadingMessage from AuthContext to determine state
Note that we always return the loading page, thus displaying the page is controlled by other pages
*/
function LoadingPage() {
    /*
    AuthContext Variables
    */
    const { loadingPage, loadingMessage } = useContext(AuthContext);

    /*
    State for ellipsis for loadingMessage
    */
    const [ellipsis, setEllipsis] = useState('');

    /*
    useEffect()
    ------------------------------------
    Function that updates ellipsis to get loading appearance
    Used for styling
    ------------------------------------
    . -> .. -> ...
    */
    useEffect(() => {
        let ellipsisInterval;
        if (loadingPage) {
            ellipsisInterval = setInterval(() => {
                setEllipsis((prev) => (prev.length < 3 ? prev + '.' : ''));
            }, 500);
        }

        return () => clearInterval(ellipsisInterval);
    }, []);

    return (
        <div className="loading-container">
            <CircularProgress id="circle" sx={{ color: 'var(--main-font-color)', marginBottom: "10%" }} />
            <Typography variant="h6" id="loading-msg">{loadingMessage}{ellipsis}</Typography>
        </div>
    );
}

export default LoadingPage;
