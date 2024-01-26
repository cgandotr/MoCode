import React, { useState, useEffect, useContext } from "react";
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SignIn from '../components/SignIn'
import './Home.css'
import { AuthContext } from '../AuthContext';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db, app } from './../firebase'
import { doc, setDoc, Timestamp, getDoc } from "firebase/firestore"; 

function Home() {
    const { currentUser, setCurrentUser } = useContext(AuthContext);

    const googleLoginFnc = async (e) => {
        const provider = new GoogleAuthProvider()
        return signInWithPopup(auth, provider).then(async (result) => {
            console.log("success")
            await setDoc(doc(db, "users", result.user.uid), {
                __id: result.user.uid,
                name: result.user.displayName,
                email: result.user.email,
                photo: result.user.photoURL
            });
            
        
        }).catch((error) => {
            console.log(error)
        })
    }

    return (
        <div className="Home">
            <NavBar></NavBar>
            {currentUser ? (
                <div className="loggedIn">
                    <h2>Welcome Back {currentUser.name}!</h2>
                </div>
            ) : (
                <SignIn></SignIn>
            )}
            <Footer></Footer>
        </div>
    );   
}

export default Home