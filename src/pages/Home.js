import React, { useState, useEffect, useContext } from "react";
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SignIn from '../components/SignIn'
import NewUserInfo from '../components/NewUserInfo'
import ProblemRec from '../components/ProblemRec'
import Stats from '../components/Stats'
import Timer from '../components/Timer'
import './Home.css'
import { AuthContext } from '../AuthContext';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db, app } from './../firebase'
import { doc, setDoc, Timestamp, getDoc, writeBatch } from "firebase/firestore";
import RecButton from '../extra/rec-icon.svg'
import { generateQuestions, nextSpacialRepetitionProblems, generateRecommendations } from "../functions";
import Skeleton from '@mui/material/Skeleton';

import Button from '@mui/lab/LoadingButton';


function Home() {
    const { currentUser } = useContext(AuthContext);
    const { userProblems, setUserProblems, loadingProblems, setLoadingProblems } = useContext(AuthContext);

    const statusOrder = ["Not Complete", "Repeat", "InComplete", "Complete"];

    const recommendedProblems = (
        currentUser?.recommended
          ?.filter(recommendedId => recommendedId && userProblems.some(problem => problem.__id === recommendedId)) // Filter out empty or not found IDs
          .map(recommendedId =>
            userProblems.find(problem => problem.__id === recommendedId)
          ) || []
      ).sort((a, b) => statusOrder.indexOf(a.status[0]) - statusOrder.indexOf(b.status[0]));
      
    // State to control the timer
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timerProblemId, settimerProblemId] = useState(null);
    const [timerProblemName, settimerProblemName] = useState(null);
    const [timerReset, setTimerReset] = useState(false);
    const [timerTime, setTimerTime] = useState(0); // Store the current timer time

    // Function to update timer time from Timer component
    const updateTimerTime = (newTime) => {
        setTimerTime(newTime);
    };

    // Function to start the timer for a specific problem
    const startTimerFnc = (problemId, problemName) => {
        if (timerProblemId == null) {
            setIsTimerRunning(true);
            settimerProblemId(problemId);
            settimerProblemName(problemName);
            console.log(timerProblemName)
        }
        else {
            if (problemId == timerProblemId) { 
                setIsTimerRunning(true);
            }
        }
    }
    // Function to stop the timer
    const pauseTimerFnc = (problemId) => {
        if (problemId == timerProblemId) {
            setIsTimerRunning(false);
        }
    };

    const resetTimerFnc = (problemId, fromTimer = false) => {
        if (fromTimer || problemId === timerProblemId) {
            setIsTimerRunning(false);
            settimerProblemId(null);
            settimerProblemName(null);
            setTimerReset(true);

        }
    };

    const handleRecommendClick = async () => {
        try {
            console.log("b/f generate " + currentUser, userProblems)
            setLoadingProblems(true)
        
            // nextSpacialRepetitionProblems(userProblems, 3);
            // await generateQuestions
            // console.log(generateRecommendations(userProblems))

          await generateQuestions(currentUser, userProblems); // Commit the batch
          setLoadingProblems(false)
          console.log(loadingProblems)
          console.log("a/f generate " + currentUser, userProblems)


          // Optionally, update local state here if needed for immediate UI reflection
        } catch (error) {
          console.error('Error updating recommended problems: ', error);
        }
      };
  

    return (
        <div className="Home">
            <NavBar/>
            {currentUser ? (
                currentUser.leetcodeUserName ? (
                    <div id="logged-in">
                        <h2 id="welcome">Welcome Back {currentUser.name}!</h2>
      
                        
                            
                        <div id="recommended">
                            <Button id="rec-btn"
                            size="small"
                            onClick={handleRecommendClick}
                          
                            >
                            <span id="rec-word">Recommend</span>
                            </Button>

                        

                            <div id="problems-main">
                            {!loadingProblems ? (
                                recommendedProblems.map((problem, index) => (
                                    <ProblemRec 
                                        key={problem.__id} // Add a key for list rendering
                                        id={problem.__id} 
                                        startTimerEmit={startTimerFnc} 
                                        pauseTimerEmit={pauseTimerFnc} 
                                        resetTimerEmit={resetTimerFnc} 
                                        timerControl={timerProblemId==null || timerProblemId == problem.__id}
                                        timerResetLister={timerReset}
                                        onTimerResetAcknowledged={() => setTimerReset(false)}
                                        timerTime={timerTime}
                                        timerRunningListener={isTimerRunning}
                                    />
                            
                                ))
                            ) : (
                                <>
                                    {Array.from({ length: 3 }).map((_, index) => (
                                        <Skeleton 
                                        key={index}
                                        sx={{ bgcolor: 'var(--boxes-background)' , width: '100%', marginBottom: '10', borderRadius: '5px'}}
                                        variant="rectangular"
                                        height={175}
                                        />
                                    ))}
                                </>
                                                        
                            )}
                            
                            </div>
                        </div>
                          
                        <div id="side-bar">
                            <Timer
                                className="timer"
                                isRunning={isTimerRunning}
                                problemId={timerProblemId}
                                problemName={timerProblemName}
                                startTimerEmit={startTimerFnc} 
                                pauseTimerEmit={pauseTimerFnc} 
                                resetTimerEmit={resetTimerFnc} 
                                updateTimerTimeEmit={updateTimerTime} // Pass the function to update timer time

                            />
                            <Stats className="stats"></Stats>
                        </div>
                    </div>
                ) : (
                    <NewUserInfo/>
                )
            ) : (
                <SignIn />
            )}
            <Footer id="food" />
        </div>
    );
}


export default Home;

