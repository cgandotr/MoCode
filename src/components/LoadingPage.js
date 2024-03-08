import React, { useState, useEffect, useContext } from "react";
import './LoadingPage.css';
import { CircularProgress, Typography } from '@mui/material';
import { AuthContext } from '../AuthContext';

function LoadingPage() {
    // Assuming AuthContext provides 'isLoadingPage' and 'loadingMessage'
    const { loadingPage, loadingMessage } = useContext(AuthContext);
    const [ellipsis, setEllipsis] = useState('');

    useEffect(() => {
        let ellipsisInterval;
        if (loadingPage) {
            ellipsisInterval = setInterval(() => {
                setEllipsis((prev) => (prev.length < 3 ? prev + '.' : ''));
            }, 500); // Update ellipsis every 500ms
        }

        return () => clearInterval(ellipsisInterval); // Clean up on unmount or isLoading change
    }, []);

    useEffect(() => {
        console.log('isLoadingPage value in LoadingPage', loadingPage);
    }, [loadingPage]);

    return (
        <div className="loading-container">
            <CircularProgress id="circle" sx={{ color: 'var(--main-font-color)', marginBottom: "10%" }} />
            <Typography variant="h6" id="loading-msg">{loadingMessage}{ellipsis}</Typography>
        </div>
    );
}

export default LoadingPage;
