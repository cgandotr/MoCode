import React from "react";
import { Link } from "react-router-dom";

function NavBar() {
    return (
        <div className='navbar'>
            <div className='logo'>MoCode</div>
            <ul className='menu'>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/profile">Profile</Link></li>
            </ul>
        </div>
    )
}

export default NavBar;