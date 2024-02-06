import React, { useContext } from "react";
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SignIn from '../components/SignIn';
import Problem from '../components/Problem';
import History from '../components/History';

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

    const problems = [
        {
            "title": "Two Sum",
            "link": "https://leetcode.com/problems/two-sum/",
            "difficulty": "Easy",
            "category": "Arrays & Hashing"
        },
        {
            "title": "Add Two Numbers",
            "link": "https://leetcode.com/problems/add-two-numbers/",
            "difficulty": "Medium",
            "category": "Linked List"
        },
        {
            "title": "Valid Palindrome",
            "link": "https://leetcode.com/problems/valid-palindrome/",
            "difficulty": "Easy",
            "category": "Two Pointers"
        }
    ]



    return (
        <div className="Profile">
            <NavBar></NavBar>
            {currentUser ? (
                <div id="loggedIn">
                    <div id="profileMetaData">
                        <img id="profileIcon" src={currentUser.photo}></img>
                        <div id="info">
                            <h2>{currentUser.name}</h2>
                            <h3>{currentUser.email}</h3>
                        </div>
                        <div id="logOut">
                            <button id="logOutBtn" onClick={googleLogoutFnc}>Log Out</button>
                        </div>
                    </div>
                    <div id="submission-history">
                        <History problems={problems} />
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
