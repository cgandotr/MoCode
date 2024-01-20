import React from "react";
import { NavLink } from "react-router-dom";
import './NavBar.css';

function NavBar() {
    return (
        <div className='navbar'>
            <div className='logo'>
                <NavLink to="/" id="main">MoCode</NavLink>
            </div>
            <div className='links'>
                <NavLink to="/home" id="home" className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}>Home</NavLink>
                <NavLink to="/profile" id="profile" className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}>Profile</NavLink>
            </div>
        </div>
    );
}

export default NavBar;
