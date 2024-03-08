import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from './firebase';
import { doc, collection, query, where, onSnapshot } from "firebase/firestore"; // Corrected import
import problemsJSON from './problems.json';
import LoadingPage from './components/LoadingPage';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProblems, setUserProblems] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loadingPage, setLoadingPage] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading'); // Added loading message state
  const [loadingProblems, setLoadingProblems] = useState(false);


  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Set up real-time listener for the user document
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeUserDoc = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            setCurrentUser(userData); // Update the currentUser state with real-time data.
            updateTheme(userData.displayMode || "Light"); // Dynamically update the theme.
            fetchProblemsForUser(user.uid); // Fetch problems for the user.
          } else {
            setCurrentUser(null); // Handle the case where the user document doesn't exist.
          }
        }, (error) => {
          console.error("Error fetching user data:", error);
        });

        // Clean up: unsubscribe from the user document listener when the auth state changes.
        return unsubscribeUserDoc;
      } else {
        // If the user is not logged in, reset states and unsubscribe from any listeners.
        setCurrentUser(null);
        setUserProblems([]);
        setProblems([]);
        updateTheme("Dark"); // Optionally reset to default theme.
      }
    });

    // Clean up: unsubscribe from the auth state listener when the component unmounts.
    return () => unsubscribeAuth();
  }, []);

  // useEffect(() => {
  //   if (currentUser?.__id) {
  //     console.log(currentUser)
  //     const userDocRef = doc(db, "users", currentUser.__id);
  //     const unsubscribeUserDoc = onSnapshot(userDocRef, (doc) => {
  //       if (doc.exists()) {
  //         const userData = doc.data();
  //         setCurrentUser(userData); // Update with detailed user data
  //         fetchProblemsForUser(userData.__id); // Assuming userData.__id is correct, adjust if needed
  //       } else {
  //         console.log("No such document!");
  //       }
  //     });

  //     return () => unsubscribeUserDoc();
  //   }
  // }, [currentUser?.leetCodeUserName]);


  const fetchProblemsForUser = (userId) => {
    const userProblemsRef = collection(db, "userProblems");
    const q = query(userProblemsRef, where("__userId", "==", userId));

    // Set up real-time listener for the user's problems
    const unsubscribeProblems = onSnapshot(q, (snapshot) => {
      const fetchedUserProblems = snapshot.docs.map(doc => ({ ...doc.data() }));
      setUserProblems(fetchedUserProblems); // Update user problems with real-time data.
      // console.log('Fetched user problems:', fetchedUserProblems);

      // Optionally, filter or process problems here before setting state
      const filteredProblems = problemsJSON.filter(problem => 
          fetchedUserProblems.some(userProblem => userProblem.problemLink === problem.link)
      );
      // console.log('Filtered problems:', filteredProblems);
      setProblems(filteredProblems);
    }, (error) => {
      console.error("Error fetching user problems:", error);
    });
  };


  const updateTheme = (displayMode) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', displayMode);
  };

       
 


  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      userProblems, 
      problems, 
      loadingPage, 
      loadingMessage, // Provide loading message through context
      setLoadingPage, // Provide the setLoadingPage function so consumers can update the loading state
      setLoadingMessage, // Provide the setLoadingMessage function so consumers can update the loading message
      loadingProblems,
      setLoadingProblems
    }}>
      {children}
    </AuthContext.Provider>
  );

};
