import { useContext , useEffect, useState, React} from 'react';

import { AuthContext } from '../AuthContext'; // Adjust the path to your AuthContext
import './ProblemRec.css';
import './Timer'
import NewIcon from "../extra/new.svg";
import CompleteIcon1 from "../extra/complete-1.svg"
import CompleteIcon2 from "../extra/complete-2.svg";
import RepeatIcon from "../extra/repeat.svg";
import PauseIcon from "../extra/pause.svg"
import PlayIcon from "../extra/play.svg"
import InCompleteIcon1 from "../extra/incomplete-1.svg"
import InCompleteIcon2 from "../extra/incomplete-2.svg"

import ConfirmStatus from './ConfirmStatus'; // Adjust path as necessary

import { db } from '../firebase';
import { doc, setDoc, Timestamp, getDoc } from 'firebase/firestore';

import Tooltip from '@mui/material/Tooltip';

const statusImages = {
    "Not Complete": NewIcon,
    "Complete": CompleteIcon1,
    "InComplete": InCompleteIcon1,
    "Repeat": RepeatIcon
};

const categoryColors = {
    "Arrays & Hashing":  "#d65a5a",
    "Two Pointers": "#d6855a",
    "Sliding Window": "#d6b35a",
    "Stack": "#b1d65a",
    "Binary Search": "#5ad666",
    "Linked List": "#757dd1",
    "Trees": "#5a96d6",
    "Tries": "#5a68d6",
    "Heap / Priority Queue": "#815ad6",
    "Backtracking": "#bd5ad6",
    "Graphs": "#d65ab3",
    "Advanced Graphs": "#d65a64",
    "1-D Dynamic Programming": "#5B60D0",
    "2-D Dynamic Programming": "#5B60D0",
    "Greedy": "#5B60D0",
    "Intervals": "#5B60D0",
    "Math & Geometry": "#5B60D0",
    "Bit Manipulation": "#5B60D0",
    "JavaScript": "#5B60D0",
};

const difficultyColors = {
    "Easy":  "#63c742",
    "Medium": "#e8932c",
    "Hard": "#D05B5B"
};

const buttonOptions = {
    "Start":  PlayIcon,
    "Pause": PauseIcon,
    "Complete": CompleteIcon2,
    "CompleteClicked": CompleteIcon1,
    "InCompleted": InCompleteIcon2,
    "InCompletedClicked": InCompleteIcon1
};

let externalWindow = null;


const ProblemRec = ({ id, startTimerEmit, pauseTimerEmit, resetTimerEmit , timerControl, timerResetLister, onTimerResetAcknowledged, timerTime, timerRunningListener, history_status, history_dateCompleted, history_timeDuration}) => {
    
    const { userProblems, problems } = useContext(AuthContext);

    const [completeBtn, setcompleteBtn] = useState(CompleteIcon2);
    const [isCompleteClicked, setIsCompleteClicked] = useState(false);

    const [startPauseBtn, setstartPauseBtn] = useState(PlayIcon)

    const [incompleteBtn, setincompleteBtn] = useState(InCompleteIcon2)
    const [isInCompleteClicked, setIsInCompleteClicked] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(() => () => {});
    const [source, setSource] = useState('');


    const [allowCompleteActions, setAllowCompleteActions] = useState(true); // Example state, adjust based on your logic

    
   
    const currentUserProblem = userProblems.find(up => up.__id === id);
    const currentProblem = currentUserProblem ? problems.find(p => p.link === currentUserProblem.problemLink) : null;

    useEffect(() => {
        if (currentUserProblem.status[0] != "Complete" && currentUserProblem.status[0] != "InComplete" && timerControl) {
            setAllowCompleteActions(true);
        }
        else {
            setAllowCompleteActions(false);
        }
      }, [currentUserProblem.status[0], timerControl]);


    useEffect(() => {
        if (timerResetLister) {
            // Change back to the "Play" button
            setstartPauseBtn(PlayIcon);

    
            // Call the acknowledgment function passed from Home
            onTimerResetAcknowledged();
        }
    }, [timerResetLister, onTimerResetAcknowledged]);

    useEffect(() => {
        if(timerControl) {

        
        if (!timerRunningListener) {
          setstartPauseBtn(PlayIcon)
        }
        else {
            setstartPauseBtn(PauseIcon)
        }
    }
      }, [timerRunningListener]);
    
    
      

    
    if (!currentUserProblem || !currentProblem) {
        return null;
    }

    const externalUrl = currentProblem.link; // Replace with your actual URL



    const handleStartPauseClick = () => {
        // If the external window is open and not closed, focus on it
        if (allowCompleteActions) {

            if (startPauseBtn == PlayIcon) {
                if (externalWindow && !externalWindow.closed) {
                    externalWindow.focus();
                    setstartPauseBtn(PauseIcon);
                } else {
                    // Open a new window and change the button to "Pause"
                    externalWindow = window.open(externalUrl, '_blank');
                    setstartPauseBtn(PauseIcon);
            
                    // Check periodically if the external window has been closed
                    const checkWindowClosed = setInterval(() => {
                        if (externalWindow.closed) {
                            setstartPauseBtn(PlayIcon);
                            pauseTimerEmit(currentUserProblem.__id);
                            clearInterval(checkWindowClosed);
                        }
                    }, 500); 
                }
                startTimerEmit(currentUserProblem.__id, currentProblem.title);

            }
            else {
                setstartPauseBtn(PlayIcon)
                pauseTimerEmit(currentUserProblem.__id);

            }
    }
    };
    

    const handleCompleteHoverEnter = () => {
    // If not clicked, allow hover to switch to icon 2
    if (allowCompleteActions && !isCompleteClicked) {
        setcompleteBtn(CompleteIcon1);
    }
};

const handleCompleteHoverLeave = () => {
    // Return to icon 1 only if it hasn't been clicked
    if (!isCompleteClicked) {
        setcompleteBtn(CompleteIcon2);
    }
};
    

const handleInCompleteHoverEnter = () => {
    // If not clicked, allow hover to switch to icon 2
    if (allowCompleteActions && !isInCompleteClicked) {
        setincompleteBtn(InCompleteIcon1);
    }
};

const handleInCompleteHoverLeave = () => {
    // Return to icon 1 only if it hasn't been clicked
    if (!isInCompleteClicked) {
        setincompleteBtn(InCompleteIcon2);
    }
};

const handleCompleteClick = () => {
    if (allowCompleteActions) {
        setSource('Complete');
        setModalAction(() => async () => {
            setIsCompleteClicked(!isCompleteClicked);
            // Update the completeBtn and Firebase document here
            // Toggle directly to icon 2 on click, regardless of hover state
            if (!isCompleteClicked) {
                // Setting as complete
                // setcompleteBtn(CompleteIcon1);
                const docRef = doc(db, 'userProblems', currentUserProblem.__id);
                try {
                    // Fetch current document
                    const docSnap = await getDoc(docRef);
        
                    if (docSnap.exists()) {
                        // Extract current arrays
                        let currentStatus = docSnap.data().status || [];
                        let currentDateCompleted = docSnap.data().dateCompleted || [];
                        let currentTimeDuration = docSnap.data().timeDuration || [];
        
                        // Ensure arrays have at least an initial element if they are empty
                        currentStatus[0] = "Complete";
                        currentDateCompleted[0] = Timestamp.now();
                        currentTimeDuration[0] = timerTime;
        
                        // Update document with modified arrays
                        await setDoc(docRef, { 
                            status: currentStatus, 
                            dateCompleted: currentDateCompleted, 
                            timeDuration: currentTimeDuration 
                        }, { merge: true });
        
                        resetTimerEmit(currentProblem.__id);
                    } else {
                        console.log("Document does not exist!");
                    }
                } catch (error) {
                    console.error("Error updating document: ", error);
                }
            

                resetTimerEmit(currentUserProblem.__id);
            } else {
                // setcompleteBtn(CompleteIcon2);
            }
        });
        setShowModal(true);
    }
    else {

    }
    }
    // If not confirmed, do nothing (you can also revert the icon if needed)


const handleInCompleteClick = () => {
    if (allowCompleteActions) {
        setSource('Incomplete');
        setModalAction(() => async () => {
            setIsInCompleteClicked(!isInCompleteClicked);
            // Toggle directly to icon 2 on click, regardless of hover state
            if (!isInCompleteClicked) {
                // Setting as complete
                // setcompleteBtn(CompleteIcon1);
                const docRef = doc(db, 'userProblems', currentUserProblem.__id);
                try {
                    // Fetch current document
                    const docSnap = await getDoc(docRef);
        
                    if (docSnap.exists()) {
                        // Extract current arrays
                        let currentStatus = docSnap.data().status || [];
                        let currentDateCompleted = docSnap.data().dateCompleted || [];
                        let currentTimeDuration = docSnap.data().timeDuration || [];
        
                        // Ensure arrays have at least an initial element if they are empty
                        currentStatus[0] = "InComplete";
                        currentDateCompleted[0] = Timestamp.now();
                        currentTimeDuration[0] = timerTime;
        
                        // Update document with modified arrays
                        await setDoc(docRef, { 
                            status: currentStatus, 
                            dateCompleted: currentDateCompleted, 
                            timeDuration: currentTimeDuration 
                        }, { merge: true });
        
                        resetTimerEmit(currentProblem.__id);
                    } else {
                        console.log("Document does not exist!");
                    }
                } catch (error) {
                    console.error("Error updating document: ", error);
                }
            

                resetTimerEmit(currentUserProblem.__id);
            } else {
                // setincompleteBtn(InCompleteIcon2);
            }
        })
        setShowModal(true);

    }
    else {

    }
};

    

  

    return (
        <div className='problem' id="rec">
            <ConfirmStatus
            isOpen={showModal} 
            onConfirm={() => { 
                modalAction();
                setShowModal(false);
            }} 
            onCancel={() => setShowModal(false)} 
            source={source}
            />
            <div id="problem-metadata" className='rec'>
                <div className={`title-status-container`}>
                    <img id="status" src={statusImages[currentUserProblem.status[0]]} alt={`Status: ${currentUserProblem.status[0]}`} />
                    <h3 id="title">{currentProblem.title}</h3>
                </div>
                <h4 id="difficulty" style={{ backgroundColor: difficultyColors[currentProblem.difficulty] }}>
                    {currentProblem.difficulty}
                </h4>
                <h4 id="category" style={{ backgroundColor: categoryColors[currentProblem.category] }}>
                    {currentProblem.category}
                </h4>
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
                        className={allowCompleteActions ? 'active' : ''}
                    />
                    <img 
                        id="complete" 
                        onMouseEnter={handleCompleteHoverEnter} 
                        onMouseLeave={handleCompleteHoverLeave} 
                        onClick={handleCompleteClick} 
                        class='shake-animation'
                        src={completeBtn} 
                        alt="Complete" 
                        className={allowCompleteActions ? 'active' : ''}
                    />
            
                </div>
            
      
        </div>
    );
}

export default ProblemRec;