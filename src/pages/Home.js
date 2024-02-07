import React, { useState, useEffect, useContext } from "react";
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SignIn from '../components/SignIn'
import Problem from '../components/Problem'
import Stats from '../components/Stats'
import Timer from '../components/Timer'
import './Home.css'
import { AuthContext } from '../AuthContext';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db, app } from './../firebase'
import { doc, setDoc, Timestamp, getDoc } from "firebase/firestore";
import RecButton from '../extra/rec-icon.svg'

function Home() {
    const { currentUser, setCurrentUser } = useContext(AuthContext);


    return (
        <div className="Home">
            <NavBar></NavBar>
            {currentUser ? (
                <div className="loggedIn">
                    <div id="welcome">Welcome Back {currentUser.name}!</div>
                         <div id="problems">
                         {/* <button id="rec-btn">
                            <img id="rec-btn" src={RecButton}></img>
                            Reccommend
                         </button> */}
                            {currentUser.reccommended.map((problem, index) => (
                                <Problem id={problem} parent="reccommend"></Problem>
                            ))}
                            <Timer></Timer>
                            <Stats></Stats>
                        </div>
                </div>
            ) : (
                <SignIn></SignIn>
            )}
            <Footer></Footer>
        </div>
    );
}

export default Home
