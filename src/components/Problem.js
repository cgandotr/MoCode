import { useContext , useState} from 'react';
import { AuthContext } from '../AuthContext'; // Adjust the path to your AuthContext
import './Problem.css';
import '../components/Timer'
import NewIcon from "../extra/new.svg";
import CompleteIcon1 from "../extra/complete-1.svg"
import CompleteIcon2 from "../extra/complete-2.svg";
import RepeatIcon from "../extra/repeat.svg";
import PauseIcon from "../extra/pause.svg"
import PlayIcon from "../extra/play.svg"
import InCompleteIcon1 from "../extra/incomplete-1.svg"
import InCompleteIcon2 from "../extra/incomplete-2.svg"

import ConfirmStatus from '../components/ConfirmStatus'; // Adjust path as necessary

import { db } from '../firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

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


function Problem({ id , parent, header}) {
    
    const { userProblems, problems } = useContext(AuthContext);

    const [completeBtn, setcompleteBtn] = useState(CompleteIcon2);
    const [isCompleteClicked, setIsCompleteClicked] = useState(false);

    const [startPauseBtn, setstartPauseBtn] = useState(PlayIcon)

    const [incompleteBtn, setincompleteBtn] = useState(InCompleteIcon2)
    const [isInCompleteClicked, setIsInCompleteClicked] = useState(false);

    const [isTimerRunning, setIsTimerRunning] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(() => () => {});
    const [source, setSource] = useState('');



    // console.log('User Problems:', userProblems);
    // console.log('Problems:', problems);

    const currentUserProblem = userProblems.find(up => up.__id === id);
    const currentProblem = currentUserProblem ? problems.find(p => p.link === currentUserProblem.problemLink) : null;

    // console.log('Current User Problem:', currentUserProblem);
    // console.log('Current Problem:', currentProblem);

    const modeClass = parent === "history" ? "history-mode" : "";

    
    if (!currentUserProblem || !currentProblem) {
        return null;
    }

    const externalUrl = currentProblem.link; // Replace with your actual URL

    const handleStartPauseClick = () => {
        // If the external window is open and not closed, focus on it
        if (currentUserProblem.status != "Complete" && currentUserProblem.status != "InComplete") {
            setIsTimerRunning(prevState => !prevState);

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
                            clearInterval(checkWindowClosed);
                        }
                    }, 1000); // Check every 1 second, adjust as needed
                }
            }
            else {
                setstartPauseBtn(PlayIcon)
            }
    }
    };
    

    const handleCompleteHoverEnter = () => {
    // If not clicked, allow hover to switch to icon 2
    if (!isCompleteClicked) {
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
    if (!isInCompleteClicked) {
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
    if (currentUserProblem.status != "Complete" && currentUserProblem.status != "InComplete") {
        setSource('Complete');
        setModalAction(() => () => {
            setIsCompleteClicked(!isCompleteClicked);
            // Update the completeBtn and Firebase document here
            // Toggle directly to icon 2 on click, regardless of hover state
            if (!isCompleteClicked) {
                // Setting as complete
                // setcompleteBtn(CompleteIcon1);
                setDoc(doc(db, 'userProblems', id), { status: "Complete", dateCompleted: Timestamp.now() }, { merge: true });
            } else {
                // setcompleteBtn(CompleteIcon2);
            }
        });
        setShowModal(true);
    }
    }
    // If not confirmed, do nothing (you can also revert the icon if needed)


const handleInCompleteClick = () => {
    if (currentUserProblem.status != "Complete" && currentUserProblem.status != "InComplete") {
        setSource('Incomplete');
        setModalAction(() => () => {
            setIsInCompleteClicked(!isInCompleteClicked);
            // Toggle directly to icon 2 on click, regardless of hover state
            if (!isInCompleteClicked) {
                // Setting as incomplete
                // setincompleteBtn(InCompleteIcon1);
                setDoc(doc(db, 'userProblems', id), { status: "InComplete", dateCompleted: Timestamp.now() }, { merge: true });
            } else {
                // setincompleteBtn(InCompleteIcon2);
            }
        })
        setShowModal(true);

    }
};

    

    return (
        <div className={`problem ${modeClass}`}>
             <ConfirmStatus
            isOpen={showModal} 
            onConfirm={() => { 
                modalAction();
                setShowModal(false);
            }} 
            onCancel={() => setShowModal(false)} 
            source={source}
        />
            <div id="problem-metadata" className={modeClass}>
                <div className={`title-status-container ${modeClass}`}>
                    <img id="status" src={statusImages[currentUserProblem.status]} alt={`Status: ${currentUserProblem.status}`} />
                    <h3 id="title">{currentProblem.title}</h3>
                </div>
                <h4 id="difficulty" style={{ backgroundColor: difficultyColors[currentProblem.difficulty] }}>
                    {currentProblem.difficulty}
                </h4>
                <h4 id="category" style={{ backgroundColor: categoryColors[currentProblem.category] }}>
                    {currentProblem.category}
                </h4>
            </div>
            {parent === "recommend" && (
                <div id="buttons">
                    <img id="start-pause" onClick={handleStartPauseClick} src={startPauseBtn} alt="Start/Pause" />
                    <img 
                        id="incomplete" 
                        onMouseEnter={handleInCompleteHoverEnter} 
                        onMouseLeave={handleInCompleteHoverLeave} 
                        onClick={handleInCompleteClick} 
                        src={incompleteBtn} 
                        alt="Incomplete" 
                    />
                    <img 
                        id="complete" 
                        onMouseEnter={handleCompleteHoverEnter} 
                        onMouseLeave={handleCompleteHoverLeave} 
                        onClick={handleCompleteClick} 
                        src={completeBtn} 
                        alt="Complete" 
                    />
            
                </div>
            )}
            {parent === "history" && (
                <h4 id="date-completed">
                    {currentUserProblem.dateCompleted.toDate().toLocaleDateString("en-US", {
                        month: 'long', 
                        day: 'numeric',
                    })}
                </h4>
            )}
        </div>
    );
}

export default Problem;