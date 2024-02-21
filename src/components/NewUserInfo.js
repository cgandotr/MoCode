import React, { useState, useContext, useEffect } from "react";
import './NewUserInfo.css';
import { db } from './../firebase';
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { AuthContext } from '../AuthContext';
import { orbit } from 'ldrs'


function NewUserInfo() {
    const [leetcodeUsername, setLeetcodeUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [ellipsis, setEllipsis] = useState('');
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        let ellipsisInterval;
        if (isLoading) {
            ellipsisInterval = setInterval(() => {
                setEllipsis((prev) => (prev.length < 3 ? prev + '.' : ''));
            }, 500); // Update ellipsis every 500ms
        }

        return () => clearInterval(ellipsisInterval); // Clean up on unmount or isLoading change
    }, [isLoading]);

    const isValidUsername = () => {
        return new Promise((resolve) => {
            setLoadingMessage("Checking Username");
            setTimeout(() => resolve(true), 3000); // Simulate a 3-second check
        });
    };

    const fetchProblems = () => {
        return new Promise((resolve) => {
            setLoadingMessage("Fetching Problems");
            setTimeout(() => resolve(true), 3000); // Simulate a 3-second fetch
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!currentUser?.__id) {
            alert("No user logged in.");
            return;
        }

        setIsLoading(true);

        // First, check if the username is valid
        const usernameValid = await isValidUsername();
        if (!usernameValid) {
            alert("Invalid username.");
            setIsLoading(false);
            return;
        }

        // Then, fetch problems for the user
        const problemsFetched = await fetchProblems();
        if (!problemsFetched) {
            alert("Failed to fetch problems.");
            setIsLoading(false);
            return;
        }

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
                setIsLoading(false);
            }
        }, 3000); // Simulate a delay before Firestore update
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <l-orbit size="35" speed="1.5" id="load" color="white"></l-orbit>
                <h3>{loadingMessage}{ellipsis}</h3>
            </div>
        );
    }

    return (
        <div className="new-user-info">
            <h1 id="main-text">Please Enter Your LeetCode Username</h1>
            <form id="form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    id = "uname"
                    value={leetcodeUsername}
                    onChange={(e) => setLeetcodeUsername(e.target.value)}
                    placeholder="LeetCode Username"
                    required
                />
                <button type="submit" id="submit-btn">Submit</button>
            </form>
        </div>
    );
}

export default NewUserInfo;