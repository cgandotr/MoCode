import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from './firebase';
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"; 
import problemsJSON from './problems.json'; 


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProblems, setUserProblems] = useState([]);
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await fetchUserAndProblems(user);
            } else {
                setCurrentUser(null);
                setUserProblems([]);
                setProblems([]);
                setLoading(false);
            }
        });

        const fetchUserAndProblems = async (user) => {
            setLoading(true);
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setCurrentUser(userDoc.data());
                    await fetchProblemsForUser(user.uid);
                } else {
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchProblemsForUser = async (userId) => {
            const userProblemsRef = collection(db, "userProblems");
            const q = query(userProblemsRef, where("__userId", "==", userId));
            const userProblemsSnapshot = await getDocs(q);
            const fetchedUserProblems = userProblemsSnapshot.docs.map(doc => doc.data());
            setUserProblems(fetchedUserProblems);
            console.log('Fetched user problems:', fetchedUserProblems);


            // Fetch each problem based on userProblems
            const filteredProblems = problemsJSON.filter(problem => 
                fetchedUserProblems.some(userProblem => userProblem.problemLink === problem.link)
            );
            console.log('problems', filteredProblems)
            setProblems(filteredProblems);
        };

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, userProblems, problems, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
