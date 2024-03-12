import React, { useState, useContext } from "react";
import './NewUserInfo.css';

/* AuthContext Imports */
import { AuthContext } from '../AuthContext';

/* Firebase Imports */
import { db } from './../firebase';
import { doc, setDoc } from "firebase/firestore";

/* MUI Library Imports */
import Alert from '@mui/material/Alert';
import Button from '@mui/lab/LoadingButton';

/* Custom Functions Imports */
import { isUsernameValid, populateNewUserHistory, generateQuestions } from "../functions";

/* Custom Components Imports */
import LoadingPage from "./LoadingPage";


function NewUserInfo() {
    /*
    AuthContext Variables
    */
    const { currentUser, userProblems, setLoadingMessage, setLoadingPage, loadingPage } = useContext(AuthContext);
    
    /*
    State for leetcode username based on user input
    */
    const [leetcodeUsername, setLeetcodeUsername] = useState('');

    /*
    State for showing failure alert
        Shown when leetcode username isn't valid
    */
    const [showFailureAlert, setShowFailureAlert] = useState(false);


    /*
    showTemporaryFailureAlert()
    ------------------------------------
    Function that shows failure alert for 2s
    ------------------------------------
    */
    const showTemporaryFailureAlert = () => {
        setShowFailureAlert(true);
        setTimeout(() => {
            setShowFailureAlert(false);
        }, 2000);
    };

    /*
    handleSubmit()
    ------------------------------------
    Function that handles new user initialization
    Called by button w/ id = "submit-btn" for leetcode username input
    ------------------------------------
    */
    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // Ensure user is logged in (via google auth)
        if (!currentUser?.__id) {
            alert("No user logged in.");
            return;
        }
        
        // 1. Check if leetcode username is valid
        // 3/11/24 - Leetcode API down -> returns true always
        setLoadingPage(true);
        setLoadingMessage("Checking Username");
        
        const usernameValid = await isUsernameValid(leetcodeUsername);
        if (usernameValid === false) {
            showTemporaryFailureAlert();
            setLoadingPage(false);
            return;
        }
        
        // 2. Fetch history for Leetcode
        // 3/11/24 - Leetcode API down -> return (does nothing)
        setLoadingMessage("Fetching History");
        await populateNewUserHistory(currentUser.__id, usernameValid);
        
        // 3. Generate Questions
        //  Recs 3 problems
        setLoadingMessage("Generating Questions");
        await generateQuestions(currentUser, userProblems);
    
        setLoadingMessage("Updating Username");

        // Once we initialize New User we not update user for LeetCodeUserName
        try {
            await setDoc(doc(db, 'users', currentUser.__id), {
                leetcodeUserName: leetcodeUsername,
            }, { merge: true });
        } catch (error) {
            console.error("Error updating user info:", error);
            alert("Failed to update user information.");
        }
        
        setTimeout(async () => {
            setLoadingPage(false); 
        }, 1000); 

    };
    
    /* Display Loading Page if true */
    if (loadingPage) {
        return <LoadingPage/>
    }

    return (
        <div className="new-user-info">
            <h3 id="main-text">Please Enter Your LeetCode Username</h3>
            <form id="form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    id = "uname"
                    value={leetcodeUsername}
                    onChange={(e) => setLeetcodeUsername(e.target.value)}
                    placeholder="LeetCode Username"
                    required
                />
                <Button  id="submit-btn" type="submit" size="small">Submit</Button>
            </form>
            {showFailureAlert && (
                <div className="alert-container">
                    <Alert className="alert" variant="filled" severity="error">
                    Invalid LeetCode Username
                    </Alert>
                </div>
            )}
        </div>
    );
}

export default NewUserInfo;