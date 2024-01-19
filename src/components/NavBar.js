import React from "react";

function NavBar() {
    return (
        <div className='navbar'>
            <div className='logo'>MoCode</div>
            <ul className='menu'>
                <li><a href="/">Home</a></li>
                <li><a href="/profile">Profile</a></li>
            </ul>
        </div>
    )
}

export default NavBar;