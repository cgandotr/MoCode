import React, { useContext } from "react";
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SignIn from '../components/SignIn'
import NewUserInfo from '../components/NewUserInfo'
import ProblemHistory from '../components/ProblemHistory'


import LeetCodeIcon from '../extra/leetcode-icon.png'; // Import SVG
import './Profile.css';
import { auth, db, app } from './../firebase'
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, Timestamp, getDoc } from "firebase/firestore"; 
import { AuthContext } from '../AuthContext';



function Profile() {
    // Grab Current User
    const { currentUser, setCurrentUser } = useContext(AuthContext);
    const { userProblems, setUserProblems } = useContext(AuthContext);

    console.log(userProblems)

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

    // Flatten all submissions into a single list for rendering
    const allSubmissions = userProblems.reduce((acc, problem) => {
        const submissions = problem.status.map((status, index) => ({
            ...problem,
            status: [problem.status[index]],
            dateCompleted: [problem.dateCompleted[index]],
            timeDuration: [problem.timeDuration[index]],
        }));
        return [...acc, ...submissions];
    }, []);

    console.log(allSubmissions)

     // Sort the submissions by dateCompleted
     const historyProblems = allSubmissions.filter(submission => submission.status[0] === "Complete" || submission.status[0] === "InComplete")
     .sort((a, b) => b.dateCompleted[0].toDate() - a.dateCompleted[0].toDate());



    return (
        <div className="Profile">
            <NavBar></NavBar>   
            {currentUser ? (
                 currentUser.leetcodeUserName ? (
                <div id="loggedIn">
                    <div id="profile-side-bar">
                        <div id="main-info">
                            <img id="profile-img" src={currentUser.photo}></img>
                            <div id="info">
                                <h3>{currentUser.name}</h3>
                                <h4>{currentUser.email}</h4>
                                <button id="edit-btn">Edit Profile</button>
                            </div>
                        </div>
                        <div id="info-extra">
                            <img id="leetcode-icon" src={LeetCodeIcon}></img> 
                            <h3 id="leetcode-username">{currentUser.leetcodeUserName}</h3>
                        </div>
                        <div id="log-out">
                            <button id="log-out-btn" onClick={googleLogoutFnc}>Log Out</button>
                        </div>
                    </div>

                    <div id="history">
                        <h2 id="history-title">Submission History</h2>
                        <div id="problems">
                        {historyProblems.map((problem, index) => (
                                    <ProblemHistory
                                    id={problem.__id}
                                    history_status={problem.status[0]}
                                    history_dateCompleted={problem.dateCompleted[0]}
                                    history_timeDuration={problem.timeDuration[0]}
                                    ></ProblemHistory>
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
