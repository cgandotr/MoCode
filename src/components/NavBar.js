import React, { useState, useEffect, useContext, useRef } from "react";
import { NavLink } from "react-router-dom";
import './NavBar.css';
import ProfileIcon from '../extra/profile_icon.svg';
import { AuthContext } from '../AuthContext';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

function NavBar() {
    const { currentUser } = useContext(AuthContext);
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === "Dark");
    const toggleCounter = useRef(0); // Tracks the toggle action sequence

    useEffect(() => {
        if (currentUser?.displayMode) {
            setIsDarkMode(currentUser.displayMode === "Dark");
            localStorage.setItem('theme', currentUser.displayMode);
            document.documentElement.setAttribute('data-theme', currentUser.displayMode);
        }
    }, [currentUser]);

    useEffect(() => {
        const currentToggle = ++toggleCounter.current; // Increment the counter for each toggle
        const curDisplayMode = isDarkMode ? "Dark" : "Light";
    
        // Update the theme immediately in local storage and on the document
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
        }, 500); // Adjust the delay as necessary
    
        // Cleanup function to clear pending timeout on component unmount or before next effect
        return () => {
            if (toggleCounter.currentTimeout) {
                clearTimeout(toggleCounter.currentTimeout);
            }
        };
    }, [isDarkMode, currentUser]);

    const handleThemeChange = (event) => {
        setIsDarkMode(event.target.checked);
    };
    
    return (
        <div className='navbar'>
            <div className='logo'>
                <NavLink to="/" id="main">MoCode</NavLink>
            </div>
            <div className='links'>
                <div className="theme-switch-wrapper">
                    <label className="theme-switch" htmlFor="checkbox">
                        <input type="checkbox" id="checkbox" onChange={handleThemeChange} checked={isDarkMode} />
                        <div className="slider round"></div>
                    </label>
                </div>
                <NavLink to="/home" id="home" className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}>Home</NavLink>
                <NavLink to="/profile" id="profile" className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}>
                    <img id="profile-icon" src={ProfileIcon} alt="Profile" />
                </NavLink>
            </div>
        </div>
    );
}

export default NavBar;
