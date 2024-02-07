import React, { useContext } from "react";
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SignIn from '../components/SignIn'
import NewUserInfo from '../components/NewUserInfo'
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
                 currentUser.leetcodeUserName ? (
                <div id="loggedIn">
                    <div id="profileMetaData">
                        <img id="profileIcon" src={currentUser.photo}></img>
                        <div id="info">
                             <h2>{currentUser.name}</h2>
                             <h3>{currentUser.email}</h3>
                        </div>
                        <div id="logOut">
                            <button id="logOutBtn"onClick={googleLogoutFnc}>Log Out</button>
                        </div>
                    </div>
                    <div id="history">
                        <h2 id="history-title">Submission History</h2>
                        <div id="problems">
                        {currentUser.history.map((problem, index) => (
                                    <Problem id={problem} parent="history"></Problem>
                                ))}
                        </div>
                    </div>
                </div>
                ) : (
                    <NewUserInfo/>
                )
            ) : (
               <SignIn></SignIn>
            )}
            <Footer></Footer>
        </div>
    );   
}

export default Profile;
