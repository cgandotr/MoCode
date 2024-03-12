import { useContext , useEffect, useState, React} from 'react';
import './ProblemRec.css';

/* AuthContext Imports */
import { AuthContext } from '../AuthContext'; // Adjust the path to your AuthContext

/* Custom imports */
import CompleteIcon1 from "../extra/complete-1.svg"
import CompleteIcon2 from "../extra/complete-2.svg";
import PauseIcon from "../extra/pause.svg"
import PlayIcon from "../extra/play.svg"
import InCompleteIcon1 from "../extra/incomplete-1.svg"
import InCompleteIcon2 from "../extra/incomplete-2.svg"

/* Global Variables from Index */
import { difficultyColors, categoryColors, statusImages } from '../index';

/* Firebase Imports */
import { db } from '../firebase';
import { doc, setDoc, Timestamp, getDoc } from 'firebase/firestore';

/* MUI Library Imports */
import Tooltip from '@mui/material/Tooltip';

/* Custom Components Imports */
import './Timer'
import ConfirmStatus from './ConfirmStatus';

/* External Window for leetcode problem */
let externalWindow = null;


/*
ProblemRec
------------------------------------
Problem Component for Recommended Display
Used in 'Home' Component
------------------------------------
inputs:
    id (the id of the userProblem passed in)
    timerControl (boolean; indicates if current problem has control over timer)
    timerResetListener (boolean; indicates if timer has been reseted or not by external means)
    onTimerResetAcknowledged (function; we call when we acknoledged reset was changed)
    timerTime (int; time in seconds from timer)
    timerRunningListener (boolean; indicates if timer is running from external means)

outputs:
    startTimerEmit(id, title) (emits start action from problem component; takes in userProblem.__id, problem.title)
    pauseTimerEmit(id) (emits pause action from problem component; takes in userProblem.__id)
    resetTimerEmit(id) (emits reset action from problem component; takes in userProblem.__id)
*/
const ProblemRec = ({ id, startTimerEmit, pauseTimerEmit, resetTimerEmit , timerControl, timerResetLister, onTimerResetAcknowledged, timerTime, timerRunningListener}) => {
    /*
    AuthContext Variables
    */
    const { userProblems, problems } = useContext(AuthContext);

    /*
    States for Complete Button
    ------------------------------------
        Image State
        Clicked State
    */
    const [completeBtn, setcompleteBtn] = useState(CompleteIcon2);
    const [isCompleteClicked, setIsCompleteClicked] = useState(false);

    /*
    States for InComplete Button
    ------------------------------------
        Image State
        Clicked State
    */
    const [incompleteBtn, setincompleteBtn] = useState(InCompleteIcon2)
    const [isInCompleteClicked, setIsInCompleteClicked] = useState(false);

    /*
    State for Start/Pause Button
    ------------------------------------
        Image State
    */
    const [startPauseBtn, setstartPauseBtn] = useState(PlayIcon)

    /*
    States for Confirm Modal
    ------------------------------------
        Show Modal State
        Modal Action State
        Modal Source State
    */
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(() => () => {});
    const [source, setSource] = useState('');

    /*
    States for disable/enable actions
    ------------------------------------
        Allow State
    */
    const [allowCompleteActions, setAllowCompleteActions] = useState(true); // Example state, adjust based on your logic

    /*
    currentUserProblem
    ------------------------------------
    links the userProblem matching the id passed in
    */
    const currentUserProblem = userProblems.find(up => up.__id === id);

    /*
    currentProblem
    ------------------------------------
    links the Problem matching the currentUserProblem
    */
    const currentProblem = currentUserProblem ? problems.find(p => p.link === currentUserProblem.problemLink) : null;

    /*
    useEffect()
    ------------------------------------
    Here we configure the Allow Complete Actions State
    Basically we allow a user to allow actions for the problem if the problem isn't set Complete or InComplete
    Or if they have timerControl

    Thus we can disable some problems if they are done or if another problem has control over the timer
    ------------------------------------
    */
    useEffect(() => {
        if (currentUserProblem.status[0] != "Complete" && currentUserProblem.status[0] != "InComplete" && timerControl) {
            setAllowCompleteActions(true);
        }
        else {
            setAllowCompleteActions(false);
        }
    }, [currentUserProblem.status[0], timerControl]);

    /*
    useEffect()
    ------------------------------------
    Here we configure our problem Start/Pause button based on timerResetListener
    Basically we observe if the timer was resetted by external components and adjust our component
    ------------------------------------
    */
    useEffect(() => {
        if (timerResetLister) {
            setstartPauseBtn(PlayIcon);
            onTimerResetAcknowledged();
        }
    }, [timerResetLister, onTimerResetAcknowledged]);

    /*
    useEffect()
    ------------------------------------
    Here we configure our problem Start/Pause button based on timerRunningListener
    We observe if timer state changes from running/paused by external components and asjust our component
    ------------------------------------
    */
    useEffect(() => {
        if (timerControl) {
            if (!timerRunningListener) {
                setstartPauseBtn(PlayIcon)
            }
            else {
                setstartPauseBtn(PauseIcon)
            }
        }
    }, [timerRunningListener]);
    
    
    /* Render null if not able to find matching userProblem or Problem */
    if (!currentUserProblem || !currentProblem) {
        return null;
    }

    /* externalUrl (leetcode problem link) */
    const externalUrl = currentProblem.link;

    /*
    handleSubmit()
    ------------------------------------
    Function that handles start/pause button action
    Called by img w/ id="start-pause"
    ------------------------------------
    */
    const handleStartPauseClick = () => {
        /* Check if user is allowed to complete actions */
        if (allowCompleteActions) {
            /* Button is currently Paused -> Player wants to Play Button */
            if (startPauseBtn == PlayIcon) {
                /* If leetcode window is open then just redirect user there */
                if (externalWindow && !externalWindow.closed) {
                    externalWindow.focus();
                }
                /* Leetcode window doesnt exist, so open it */
                else {
                    externalWindow = window.open(externalUrl, '_blank');

                    /* Check periodically if the external window has been closed */
                    const checkWindowClosed = setInterval(() => {
                        if (externalWindow.closed) {
                            setstartPauseBtn(PlayIcon);
                            pauseTimerEmit(currentUserProblem.__id);
                            clearInterval(checkWindowClosed);
                        }
                    }, 500); 
                }

                /* Update img on Button */
                setstartPauseBtn(PauseIcon);
                /* Emit/Output that we started Problem; i.e. we started problem */
                startTimerEmit(currentUserProblem.__id, currentProblem.title);
                
            }
            /* Button is currently Playing -> Player wants to Pause Button */
            else {
                /* Update img on Button */
                setstartPauseBtn(PlayIcon)
                /* Emit/Output that we stopped Problem; i.e. we paused */
                pauseTimerEmit(currentUserProblem.__id);
            }
        }
    };
    
    /*
    handleCompleteHoverEnter()
    handleCompleteHoverLeave()
    ------------------------------------
    Function that handles hovering over Complete Button
    Basically update the image for styling purposes
    ------------------------------------
    */
    const handleCompleteHoverEnter = () => {
        if (allowCompleteActions && !isCompleteClicked) {
            setcompleteBtn(CompleteIcon1);
        }
    };

    const handleCompleteHoverLeave = () => {
        if (!isCompleteClicked) {
            setcompleteBtn(CompleteIcon2);
        }
    };
    
    /*
    handleInCompleteHoverEnter()
    handleInCompleteHoverLeave()
    ------------------------------------
    Function that handles hovering over InComplete Button
    Basically update the image for styling purposes
    ------------------------------------
    */
    const handleInCompleteHoverEnter = () => {
        if (allowCompleteActions && !isInCompleteClicked) {
            setincompleteBtn(InCompleteIcon1);
        }
    };

    const handleInCompleteHoverLeave = () => {
        if (!isInCompleteClicked) {
            setincompleteBtn(InCompleteIcon2);
        }
    };

    /*
    handleCompleteClick()
    ------------------------------------
    Function that handles clicking Complete Button
    Only Preform if User Confirms on Modal
    ------------------------------------
    */
    const handleCompleteClick = () => {
        /* Check if user is allowed to complete actions */
        if (allowCompleteActions) {
            /* Initialize Modal */
            setSource('Complete');
            setModalAction(() => async () => {
                setIsCompleteClicked(!isCompleteClicked);
                if (!isCompleteClicked) {
                    /* Update UserProblem */
                    const docRef = doc(db, 'userProblems', currentUserProblem.__id);
                    try {
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            /* Extract Existing status, dateCompleted, timeDuration Array */
                            let currentStatus = docSnap.data().status || [];
                            let currentDateCompleted = docSnap.data().dateCompleted || [];
                            let currentTimeDuration = docSnap.data().timeDuration || [];
            
                            /* Modify Index 0 */
                            currentStatus[0] = "Complete";
                            currentDateCompleted[0] = Timestamp.now();
                            currentTimeDuration[0] = timerTime;
            
                            /* Update Document */
                            await setDoc(docRef, { 
                                status: currentStatus, 
                                dateCompleted: currentDateCompleted, 
                                timeDuration: currentTimeDuration 
                            }, { merge: true });

                        } else {
                            console.log("Document does not exist!");
                        }
                    } catch (error) {
                        console.error("Error updating document: ", error);
                    }
                    /* Emit Reset Timer */
                    resetTimerEmit(currentUserProblem.__id);
                }
            });
            setShowModal(true);
        }
    }


    /*
    handleInCompleteClick()
    ------------------------------------
    Function that handles clicking InComplete Button
    Only Preform if User Confirms on Modal
    ------------------------------------
    */
    const handleInCompleteClick = () => {
        /* Check if user is allowed to complete actions */
        if (allowCompleteActions) {
            /* Initialize Modal */
            setSource('Incomplete');
            setModalAction(() => async () => {
                setIsInCompleteClicked(!isInCompleteClicked);
                if (!isInCompleteClicked) {
                    /* Update UserProblem */
                    const docRef = doc(db, 'userProblems', currentUserProblem.__id);
                    try {
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            /* Extract Existing status, dateCompleted, timeDuration Array */
                            let currentStatus = docSnap.data().status || [];
                            let currentDateCompleted = docSnap.data().dateCompleted || [];
                            let currentTimeDuration = docSnap.data().timeDuration || [];
            
                            /* Modify Index 0 */
                            currentStatus[0] = "InComplete";
                            currentDateCompleted[0] = Timestamp.now();
                            currentTimeDuration[0] = timerTime;
            
                            /* Update Document */
                            await setDoc(docRef, { 
                                status: currentStatus, 
                                dateCompleted: currentDateCompleted, 
                                timeDuration: currentTimeDuration 
                            }, { merge: true });
            
                        } else {
                            console.log("Document does not exist!");
                        }
                    } catch (error) {
                        console.error("Error updating document: ", error);
                    }
                    /* Emit Reset Timer */
                    resetTimerEmit(currentUserProblem.__id);
                }
            });
            setShowModal(true);
        }
    }

    
    return (
        <div className='problem' id="rec">
            <ConfirmStatus isOpen={showModal} onConfirm={() => { modalAction(); setShowModal(false); }} onCancel={() => setShowModal(false)} source={source}/>
            <div id="problem-metadata" className='rec'>
                <div className={`title-status-container`}>
                    <Tooltip title={`Problem Status: ${currentUserProblem.status[0]}`}>
                        <img id="status" src={statusImages[currentUserProblem.status[0]]} alt={`Status: ${currentUserProblem.status[0]}`} />
                     </Tooltip>
                    <Tooltip title={currentProblem.title}>
                        <h3 id="title">{currentProblem.title}</h3>
                    </Tooltip>
                </div>
                <Tooltip title={`Difficulty Level`}>
                    <h4 id="difficulty" style={{ backgroundColor: difficultyColors[currentProblem.difficulty] }}>
                        {currentProblem.difficulty}
                    </h4>
                </Tooltip>
                <Tooltip title={`Category`}>
                    <h4 id="category" style={{ backgroundColor: categoryColors[currentProblem.category] }}>
                        {currentProblem.category}
                    </h4>
                </Tooltip>
            </div>
            <div id="buttons">
                    <img
                        id="start-pause"
                        onClick={handleStartPauseClick}
                        src={startPauseBtn}
                        alt="Start/Pause"
                        className={allowCompleteActions ? 'active' : ''}
                    />
                    <img 
                        id="incomplete" 
                        onMouseEnter={handleInCompleteHoverEnter} 
                        onMouseLeave={handleInCompleteHoverLeave} 
                        onClick={handleInCompleteClick} 
                        src={incompleteBtn} 
                        alt="Incomplete" 
                        className={allowCompleteActions ? 'active' : ''} enterDelay={3000}
                    />
                    <img 
                        id="complete" 
                        onMouseEnter={handleCompleteHoverEnter} 
                        onMouseLeave={handleCompleteHoverLeave} 
                        onClick={handleCompleteClick} 
                        src={completeBtn} 
                        alt="Complete" 
                        className={allowCompleteActions ? 'active' : ''}
                    />
            </div>
        </div>
    );
}

export default ProblemRec;