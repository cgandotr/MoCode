import React, { useContext } from "react";
import { useNavigate, useLocation } from 'react-router-dom';

import './SignIn.css';

/* AuthContext Imports */
import { AuthContext } from '../AuthContext';

/* Firebase Imports */
import { auth, db } from './../firebase'
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; 


/*
SignIn
------------------------------------
Sign In Component
Allows User To Login Using Google Authentication
------------------------------------
*/
function SignIn() {
    /*
    AuthContext Variables
    */
    const { currentUser, setCurrentUser } = useContext(AuthContext);

    /*
    Navigate Initialization
    */
    const navigate = useNavigate();

    /*
    googleLoginFnc()
    ------------------------------------
    Function that handles user clicking Sign In with Google
    Called by button w/ id="googleButton"
    ------------------------------------
    */
    const googleLoginFnc = async () => {
        /* Redirect if user is already Logged In */
        if (currentUser) {
            navigate('/home');
        }
         /* Else, Sign in w/ Google */
        else {
            const provider = new GoogleAuthProvider();
            try {
                const result = await signInWithPopup(auth, provider);
                const userRef = doc(db, "users", result.user.uid);
                
                /* Check if user already exists in Firebase */
                const docSnap = await getDoc(userRef);
                if (!docSnap.exists()) {
                    /* If not in firebase, create new document in collection users */
                    await setDoc(userRef, {
                        __id: result.user.uid,
                        name: result.user.displayName,
                        email: result.user.email,
                        photo: result.user.photoURL,
                        displayMode: "Dark",
                        leetcodeUserName: "",
                        recommended: [],
                    });
                }

                /* Update Current User */
                setCurrentUser(result.user);
            } catch (error) {
                console.error("Error signing in w/ Google Auth: ", error);
            }
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
