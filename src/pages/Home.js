import React, { useState, useEffect, useContext } from "react";
import './Home.css'

/* Custom Components Imports */
import NavBar from '../components/NavBar';
import SignIn from '../components/SignIn'
import NewUserInfo from '../components/NewUserInfo'
import ProblemRec from '../components/ProblemRec'
import Stats from '../components/Stats'
import Timer from '../components/Timer'
import LoadingPage from "../components/LoadingPage";

/* AuthContext Imports */
import { AuthContext } from '../AuthContext';

/* Custom Functions Imports */
import { generateQuestions } from "../functions";

/* MUI Library Imports */
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/lab/LoadingButton';

/* Custom imports */
import { statusOrder } from "../index";


/*
Home
------------------------------------
Home Component of our Webite
Contains ProblemRec, Stats, and Timer for returning user
Redirects new user for SignIn process
------------------------------------
*/
function Home() {
    /*
    AuthContext Variables
    */
    const { currentUser, userProblems, loadingProblems, setLoadingProblems, loadingPage } = useContext(AuthContext);

    /*
    States for Timer
    ------------------------------------
        Timer Running State
        Problem ID controlling Timer State
        Pronlem Name controlling Timer State
        Timer Reset State
        Time of Timer State
    */
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timerProblemId, settimerProblemId] = useState(null);
    const [timerProblemName, settimerProblemName] = useState(null);
    const [timerReset, setTimerReset] = useState(false);
    const [timerTime, setTimerTime] = useState(0);

    /*
    recommendedProblems
    ------------------------------------
    Array of userProblems where their __id is inside currentUser.recommended
    Sorted by status
        Submitted Problems float to the bottom
    */
    const recommendedProblems = (
        currentUser?.recommended
          ?.filter(recommendedId => recommendedId && userProblems.some(problem => problem.__id === recommendedId)) // Filter out empty or not found IDs
          .map(recommendedId =>
            userProblems.find(problem => problem.__id === recommendedId)
          ) || []
      ).sort((a, b) => statusOrder.indexOf(a.status[0]) - statusOrder.indexOf(b.status[0]));
      
    /*
    updateTimerTime(newTime)
    ------------------------------------
    Function to update timer time from Timer component
    ------------------------------------
    */
    const updateTimerTime = (newTime) => {
        setTimerTime(newTime);
    };

    /*
    startTimerFnc(problemId, problemName)
    ------------------------------------
    Function to start the timer for a specific problem

    Is called/emitted from Timer and ProblemRec Components
    Alters shared state of Timer
    ------------------------------------
    */
    const startTimerFnc = (problemId, problemName) => {
        /* If there is no 'current owner' of the timer */
        /* Then set the owner and start the timer */
        if (timerProblemId == null) {
            setIsTimerRunning(true);
            settimerProblemId(problemId);
            settimerProblemName(problemName);
        }
        /* Else there is an owner */
        else {
            /* Check if callee is owner */
            /* Then allow it to control Timer */
            if (problemId == timerProblemId) { 
                setIsTimerRunning(true);
            }
        }
    }

    /*
    pauseTimerFnc(problemId)
    ------------------------------------
    Function to pause the timer for a specific problem

    Is called/emitted from Timer and ProblemRec Components
    Alters shared state of Timer
    ------------------------------------
    */
    const pauseTimerFnc = (problemId) => {
        /* Check if callee is owner */
        /* Then allow it to control Timer */
        if (problemId == timerProblemId) {
            setIsTimerRunning(false);
        }
    };

    /*
    resetTimerFnc(problemId, fromTimer)
    ------------------------------------
    Function to reset the timer for a specific problem

    Is called/emitted from Timer and ProblemRec Components
    Alters shared state of Timer
    ------------------------------------
    */
    const resetTimerFnc = (problemId, fromTimer = false) => {
        /* If from Timer, we dont need to check owner */
        /* If from Problem itself, check if callee is owner */
        if (fromTimer || problemId === timerProblemId) {
            setIsTimerRunning(false);
            settimerProblemId(null);
            settimerProblemName(null);
            setTimerReset(true);
        }
    };

    /*
    handleRecommendClick()
    ------------------------------------
    Function that handles recommend button clicks
    In charge of calling function to generate questions
    ------------------------------------
    */
    const handleRecommendClick = async () => {
        try {
            setLoadingProblems(true)
            await generateQuestions(currentUser, userProblems);
            setLoadingProblems(false)
        } catch (error) {
          console.error('Error updating recommended problems: ', error);
        }
    };
     
    return (
        <div className="Home">
            <NavBar/>
            {/* If theres a current user */}
            {/*     We want to display the Home page for a returning user */}
            {/*     If leetcodeUserName == "", then we consider the current User a new user */}
            {/*         Redirect them to NewUserInfo to fill in username */}
            {/* If no current user */}
            {/*     We display loading page if it should be displayed */}
            {/*     Else we display Sign In Page */}
            {currentUser ? (
                currentUser.leetcodeUserName ? (
                    <div id="home-content">
                        <div id="home-main">
                            <div id="left-main-header">
                                <h2 id="welcome">Welcome Back {currentUser.name}!</h2>
                                <Button id="rec-btn"
                                size="small"
                                onClick={handleRecommendClick}>
                                    <span id="rec-word">Recommend</span>
                                </Button>
                            </div>
                            <div id="problems-main">
                                {/* If we are not currently loading problems, display the recommended problems */}
                                {/* If loading problems (from generating them) display skeleton */}
                                {!loadingProblems ? (
                                    recommendedProblems.map((problem, index) => (
                                        <ProblemRec 
                                            key={problem.__id} 
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
                                updateTimerTimeEmit={updateTimerTime}
                            />
                            <Stats className="stats"></Stats>
                        </div>
                    </div>
                ) : (
                    <NewUserInfo/>
                )
            ) : (
                loadingPage ? <LoadingPage />  : <SignIn />
            )}
        </div>
    );
}


export default Home;

