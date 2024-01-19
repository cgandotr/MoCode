import React from "react";
import { NavLink } from "react-router-dom";
import './NavBar.css';

function NavBar() {
    return (
        <div className='navbar'>
            <div className='logo'>MoCode</div>
            <div className='links'>
                <NavLink to="/" id="home" className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}>Home</NavLink>
                <NavLink to="/profile" id="profile" className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}>Profile</NavLink>
            </div>
        </div>
    );
}

export default NavBar;
