import React, { useState, useContext, useEffect } from "react";
import './NewUserInfo.css';
import { db } from './../firebase';
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { AuthContext } from '../AuthContext';
import { CircularProgress } from '@mui/material';
import Alert from '@mui/material/Alert';
import { isUsernameValid, populateNewUserHistory, generateQuestions } from "../functions";
import LoadingPage from "./LoadingPage";


function NewUserInfo() {
    const [leetcodeUsername, setLeetcodeUsername] = useState('');
    const { currentUser, userProblems, setLoadingMessage, setLoadingPage, loadingPage } = useContext(AuthContext);

    const [showFailureAlert, setShowFailureAlert] = useState(false); // State to control the visibility of the failure alert

    // Function to show the failure alert for 2 seconds
    const showTemporaryFailureAlert = () => {
        setShowFailureAlert(true); // Show the alert

        // Set a timeout to hide the alert after 2 seconds
        setTimeout(() => {
            setShowFailureAlert(false); // Hide the alert
        }, 2000);
    };


    



    

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!currentUser?.__id) {
            alert("No user logged in.");
            return;
        }

        setLoadingPage(true);

        setLoadingMessage("Checking Username");
        const usernameValid = await isUsernameValid(leetcodeUsername);

        if (usernameValid == false) {
            showTemporaryFailureAlert();
            setLoadingPage(false);
            return;
        }

        setLoadingMessage("Fetching History");
        await populateNewUserHistory(currentUser.__id, usernameValid);
      
        setLoadingMessage("Generating Questions");
        await generateQuestions(currentUser, userProblems);

        // Update Firestore with the new username
        setTimeout(async () => {
            try {
                await setDoc(doc(db, 'users', currentUser.__id), {
                    leetcodeUserName: leetcodeUsername,
                }, { merge: true });
            } catch (error) {
                console.error("Error updating user info:", error);
                alert("Failed to update user information.");
            } finally {
                setLoadingPage(false);
            }
        }, 3000); // Simulate a delay before Firestore update
    };

    if (loadingPage) {
        return <LoadingPage/>
    }

    return (
        <div className="new-user-info">
            <h1 id="main-text">Please Enter Your LeetCode Username</h1>
            <form id="form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={leetcodeUsername}
                    onChange={(e) => setLeetcodeUsername(e.target.value)}
                    placeholder="LeetCode Username"
                    required
                />
                <button type="submit">Submit</button>
            </form>
            {showFailureAlert && (
                <Alert className="alert" variant="filled" severity="error">
                Invalid LeetCode Username
                </Alert>
            )}
        </div>
    );
}

export default NewUserInfo;