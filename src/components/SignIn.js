import React, { useState, useEffect, useContext } from "react";
import './SignIn.css';
import { auth, db, app } from './../firebase'
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, Timestamp, getDoc } from "firebase/firestore"; 
import { AuthContext } from '../AuthContext';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate



function SignIn() {
    // Grab Current User
    const { currentUser, setCurrentUser } = useContext(AuthContext);
    const navigate = useNavigate(); // Create navigate instance
    const location = useLocation(); // Get current location


    const googleLoginFnc = async (e) => {
        if (currentUser) {
            navigate('/home'); // Redirect if already logged in
        } else {
            const provider = new GoogleAuthProvider();
            return signInWithPopup(auth, provider).then(async (result) => {
                console.log("success");
                const userRef = doc(db, "users", result.user.uid);
                
                // Check if user already exists in Firebase
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    // Create a new document for new user
                    await setDoc(userRef, {
                        __id: result.user.uid,
                        name: result.user.displayName,
                        email: result.user.email,
                        photo: result.user.photoURL,
                        history: ["GdiDgvCKNTkJzHOBKVq6"],
                        reccommended: ["GdiDgvCKNTkJzHOBKVq6", "232"]
                    });
                } else {
                    // User already exists, you can handle this case if needed
                    console.log("User already exists in Firebase.");
                }
                navigate('/home'); // Redirect to dashboard or another route
            }).catch((error) => {
                console.log(error);
            });
        }
    }
    



    return (
        <div className="SignIn">  
            <h1 id="main-text">Sign In</h1>
            <button id="googleButton" onClick={googleLoginFnc}></button>
        </div>
    );   
}

export default SignIn;
