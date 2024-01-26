import React, { useContext } from "react";
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SignIn from '../components/SignIn'
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
                <div className="loggedIn">
                    <div id="profileMetaData">
                        <img id="profileIcon" src={currentUser.photo}></img>
                        <h2>{currentUser.name}</h2>
                        <h2>{currentUser.email}</h2>
                    </div>

                    <button onClick={googleLogoutFnc}>Sign Out</button>
                </div>
            ) : (
               <SignIn></SignIn>
            )}
            <Footer></Footer>
        </div>
    );   
}

export default Profile;
