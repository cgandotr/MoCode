import React, { useState, useEffect, useContext } from "react";
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SignIn from '../components/SignIn'
import NewUserInfo from '../components/NewUserInfo'
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
    const { currentUser } = useContext(AuthContext);
    const { userProblems, setUserProblems } = useContext(AuthContext);

    const statusOrder = ["Not Complete", "Repeat", "InComplete", "Complete"];

    const recommendedProblems = (currentUser?.recommended?.map(recommendedId =>
        userProblems.find(problem => problem.__id === recommendedId)
    ) || []).sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));


    

    return (
        <div className="Home">
            <NavBar />
            {currentUser ? (
                currentUser.leetcodeUserName ? (
                    <div id="logged-in">
                        <h2 id="welcome">Welcome Back {currentUser.name}!</h2>
                        {/* <div id="rec-btn">Recommend</div> */}
                        <div id="recommended">
                            <div id="problems">
                                {recommendedProblems.map((problem, index) => (
                                    <Problem id={problem.__id} parent="recommend"></Problem>
                                ))}
                            </div>
                        </div>

                        <div id="side-bar">
                            <Timer className="timer"></Timer>
                            <Stats className="stats"></Stats>
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

