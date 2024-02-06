import React, { useContext } from "react";
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SignIn from '../components/SignIn'
import Problem from '../components/Problem'

import ProfileIcon from '../extra/profile_icon.svg'; // Import SVG
import './Profile.css';
import { auth, db, app } from './../firebase'
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, Timestamp, getDoc } from "firebase/firestore"; 
import { AuthContext } from '../AuthContext';



function Profile() {
    // Grab Current User
    const { currentUser, setCurrentUser } = useContext(AuthContext);


    const googleLogoutFnc = async (e) => {
        signOut(auth).then(() => {
            // Sign-out successful.
            setCurrentUser(null); // dont need
            console.log('Sign out successful');
        }).catch((error) => {
            // An error happened.
            console.error('Sign out error:', error);
        });
    };



    return (
        <div className="Profile">
            <NavBar></NavBar>   
            {currentUser ? (
                <div id="loggedIn">
                    <div id="profileMetaData">
                        <img id="profileIcon" src={currentUser.photo}></img>
                        <div id="info">
                             <h3>{currentUser.name}</h3>
                             <h2>{"schinta"}</h2>
                        </div>
                        <div id = "links">
                            <h2>{currentUser.email}</h2>
                        </div>
                        <div id = "editProfile">
                            <button id="editProfileBtn">Edit Profile</button> 
                        </div>
                        <div id="logOut">
                            <button id="logOutBtn"onClick={googleLogoutFnc}>Log Out</button>
                        </div>
                    </div>
                    <div id="problems">
                    {currentUser.history.map((problem, index) => (
                                <Problem id={problem} parent="history"></Problem>
                            ))}
                    </div>
                </div>
            ) : (
               <SignIn></SignIn>
            )}
            <Footer></Footer>
        </div>
    );   
}

export default Profile;
