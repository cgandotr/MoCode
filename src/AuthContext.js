import React, { createContext, useState, useEffect } from 'react';

/* Firebase Imports */
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from './firebase';
import { doc, collection, query, where, onSnapshot } from "firebase/firestore"; 

/* Webscraped Problems */
import problemsJSON from './problems.json';

/* AuthContext Initialization */
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  /*
  AuthContext Variables
  ------------------------------------
  Initialization of States that are used throughout the App
  ------------------------------------
  currentUser: State of currentUser (if any)
  userProblems: State of userProblems for the currentUser (if any)
  problems: State of matching problems based on userProblems for the currentUser (if any)
  loadingPage: State of whether or not loadingPage should be shown
  loadingMessage: State of loadingMessage that is shown in loadingMessage
  loadinProblems: State of whether or not problems are loading
  */
  const [currentUser, setCurrentUser] = useState(null);
  const [userProblems, setUserProblems] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingProblems, setLoadingProblems] = useState(false);

  /*
  useEffect()
  ------------------------------------
  Here we want to fetch our states
  This is done so that we can share them with other components
  ------------------------------------
  */
  useEffect(() => {
    /* Set Loading Page as we load info */
    setLoadingPage(true)

    /* Update Info based on Auth State Change */
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      /* User is logged in via Google */
      if (user) {
        /* Get corresponding User Document from Firebase */
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeUserDoc = onSnapshot(userDocRef, (doc) => {
          /* If that document exists, update states */
          if (doc.exists()) {
            const userData = doc.data();
            setCurrentUser(userData);
            updateTheme(userData.displayMode || "Light"); 
            /* Fetch problems for the user */
            fetchProblemsForUser(user.uid);
          }
          /* Docuement doesnt exist */
          else {
            setCurrentUser(null);
          }
          /* Set Loading Page as we are done loading info */
          setLoadingPage(false)
        }, (error) => {
          console.error("Error fetching user data:", error);
        });
        /* Clean up: unsubscribe from the user document listener when the auth state changes */
        return unsubscribeUserDoc;
      }
      else {
        /* User is not logged in via Google */
        setCurrentUser(null);
        setUserProblems([]);
        setProblems([]);
        updateTheme("Dark");
        setLoadingPage(false)
      }
    });
    return () => unsubscribeAuth();
  }, []);


  /*
  fetchProblemsForUser(userId)
  ------------------------------------
  Function that sets state for both userProblems and problems
  Grabs only problems matching to userProblems
  ------------------------------------
  */
  const fetchProblemsForUser = (userId) => {
    /* Get userProblems for a user from Firebase */
    const userProblemsRef = collection(db, "userProblems");
    const q = query(userProblemsRef, where("__userId", "==", userId));

    const unsubscribeProblems = onSnapshot(q, (snapshot) => {
      const fetchedUserProblems = snapshot.docs.map(doc => ({ ...doc.data() }));
      /* Set userProblems */
      setUserProblems(fetchedUserProblems);

      /* Filter problems to get matching problems to userProblems */
      const filteredProblems = problemsJSON.filter(problem => 
          fetchedUserProblems.some(userProblem => userProblem.problemLink === problem.link)
      );

      /* Set problems */
      setProblems(filteredProblems);

      return unsubscribeProblems;
    }, (error) => {
      console.error("Error fetching user problems:", error);
    });
  };

  /*
  updateTheme(displayMode)
  ------------------------------------
  Updates the theme of our App based on DisplayMode
  ------------------------------------
  */
  const updateTheme = (displayMode) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', displayMode);
  };


  /* Ouptput States for the rest of our components */
  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      userProblems, 
      problems, 
      loadingPage, 
      loadingMessage, 
      setLoadingPage, 
      setLoadingMessage, 
      loadingProblems,
      setLoadingProblems
    }}>
      {children}
    </AuthContext.Provider>
  );
};
