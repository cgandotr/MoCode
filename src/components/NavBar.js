import React from "react";
import { Link } from "react-router-dom";
import './NavBar.css';

function NavBar() {
    return (
        <div className='navbar'>
            <div className='logo'>MoCode</div>
            <div className='links'>
                <Link to="/" id="home">Home</Link>
                <Link to="/profile" id="profile">Profile</Link>
            </div>
        </div>
    )
}

export default NavBar;