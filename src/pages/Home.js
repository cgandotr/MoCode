import React, { useState, useEffect, useContext } from "react";
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SignIn from '../components/SignIn'
import NewUserInfo from '../components/NewUserInfo'
import Problem from '../components/Problem'
import './Home.css'
import { AuthContext } from '../AuthContext';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db, app } from './../firebase'
import { doc, setDoc, Timestamp, getDoc } from "firebase/firestore"; 
import RecButton from '../extra/rec-icon.svg'

function Home() {
    const { currentUser } = useContext(AuthContext);

    return (
        <div className="Home">
            <NavBar />
            {currentUser ? (
                currentUser.leetcodeUserName ? (
                    <div className="loggedIn">
                    <h2 id="welcome">Welcome Back {currentUser.name}!</h2>
                        <div id="recommended">
                         <div id="problems">
                            {currentUser.reccommended.map((problem, index) => (
                                <Problem id={problem} parent="recommend"></Problem>
                            ))}
                        </div>
                    </div>
                </div>
                ) : (
                    <NewUserInfo/>
                )
            ) : (
                <SignIn />
            )}
            <Footer />
        </div>
    );   
}

export default Home;
