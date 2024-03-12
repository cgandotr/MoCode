import React, { useState, useEffect, useContext, useRef } from "react";
import { NavLink } from "react-router-dom";
import './NavBar.css';

/* AuthContext Imports */
import { AuthContext } from '../AuthContext';

/* Firebase Imports */
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

/* MUI Library Imports */
import Switch from '@mui/material/Switch';


function NavBar() {
    /*
    AuthContext Variables
    */
    const { currentUser } = useContext(AuthContext);

    /*
    State for Display Mode
    */
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === "Dark");
    
    /*
    toggleCounter
    ------------------------------------
    Variable that helps with spamming display mode switch
    */
    const toggleCounter = useRef(0); // Tracks the toggle action sequence

    /*
    useEffect()
    ------------------------------------
    Triggered whenever the currentUser object changes
    if currentUser has displayMode property it performs the following actions:
        Sets the isDarkMode state based currentUser displayMode 
        Updates the local storage's theme item with the currentUser's displayMode,
            allowing the theme preference to persist across browser sessions.
        Sets a data-theme attribute on the document's root element based on updated
            currentUser's displayMode
    ------------------------------------
    */
    useEffect(() => {
        if (currentUser?.displayMode) {
            setIsDarkMode(currentUser.displayMode === "Dark");
            localStorage.setItem('theme', currentUser.displayMode);
            document.documentElement.setAttribute('data-theme', currentUser.displayMode);
        }
    }, [currentUser]);

    /*
    useEffect()
    ------------------------------------
    Manages theme toggling
    Basically we want to minimize firebase interaction if there is a spam
    ------------------------------------
    When the isDarkMode state changes:
        Increments toggleCounter.current to track the toggle action.
        Updates the local storage and data-theme attribute to reflect the new theme
        It cancels any pending Firestore update from a previous toggle using clearTimeout if there's an existing timeout, then sets a new timeout.
            This delay allows the system to wait for the last toggle action within a given timeframe before updating the user's displayMode in Firestore.
            This reduces database operations and avoids unnecessary writes.
    ------------------------------------
    */
    useEffect(() => {
        const currentToggle = ++toggleCounter.current;
        const curDisplayMode = isDarkMode ? "Dark" : "Light";
    
        localStorage.setItem('theme', curDisplayMode);
        document.documentElement.setAttribute('data-theme', curDisplayMode);
    
        // Cancel any pending Firestore update from previous toggles
        if (toggleCounter.currentTimeout) {
            clearTimeout(toggleCounter.currentTimeout);
        }
    
        // Delay the Firestore update, replacing the previous timeout with a new one
        toggleCounter.currentTimeout = setTimeout(() => {
            // Ensure this is the last toggle action before proceeding with Firestore update
            if (currentToggle === toggleCounter.current && currentUser?.__id) {
                setDoc(doc(db, 'users', currentUser.__id), { displayMode: curDisplayMode }, { merge: true })
                    .catch((error) => console.error("Error updating display mode:", error));
            }
        }, 500);
    
        // Cleanup function to clear pending timeout on component unmount or before next effect
        return () => {
            if (toggleCounter.currentTimeout) {
                clearTimeout(toggleCounter.currentTimeout);
            }
        };
    }, [isDarkMode, currentUser]);

    /*
    handleThemeChange()
    ------------------------------------
    Function that that updates Theme State
    Called by switch via onChange
    ------------------------------------
    */
    const handleThemeChange = (event) => {
        setIsDarkMode(event.target.checked);
    };
    

    return (
        <div className='navbar'>
            <div className='logo'>
                <NavLink to="/" id="main">MoCode</NavLink>
            </div>
            <div id="switch">
                    <Switch onChange={handleThemeChange} color="default" checked={isDarkMode}></Switch>
            </div>
            <div className='links'>
                <NavLink to="/home" id="home" className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}>Home</NavLink>
                <NavLink to="/profile" id="profile" className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}>Profile</NavLink>
            </div>
        </div>
    );
}

export default NavBar;
