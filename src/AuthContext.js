import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from './firebase'; // Adjust the path as necessary
import { doc, setDoc, Timestamp, getDoc } from "firebase/firestore"; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await fetchUser(user);
            } else {
                // User is signed out
                setCurrentUser(null);
                setLoading(false);
            }
        });

        // Define the async function inside useEffect
        const fetchUser = async (user) => {
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    // Set the currentUser state to the user data
                    setCurrentUser(userDoc.data());
                } else {
                    // Handle case where user is authenticated but not in Firestore
                    console.log("User is authenticated but not found in Firestore.");
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
