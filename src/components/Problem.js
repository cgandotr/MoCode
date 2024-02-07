import { useContext , useState} from 'react';
import { AuthContext } from '../AuthContext'; // Adjust the path to your AuthContext
import './Problem.css';
import '../components/Timer'
import NewIcon from "../extra/new_icon.svg";
import CompleteIcon1 from "../extra/complete_icon.svg"
import CompleteIcon2 from "../extra/complete2_icon.svg";
import RepeatIcon from "../extra/repeat_icon.svg";
import PauseIcon from "../extra/pause_icon.svg"
import PlayIcon from "../extra/play_icon.svg"
import InCompleteIcon1 from "../extra/incomplete_icon.svg"
import InCompleteIcon2 from "../extra/incomplete2_icon.svg"

const statusImages = {
    "Not Complete": NewIcon,
    "Complete": CompleteIcon1,
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
    "Start":  "#5BD060",
    "Pause": "#D0855B0",
    "Complete": CompleteIcon2,
    "CompleteClicked": CompleteIcon1,
    "InCompleted": "#D05B5B",
    "InCompletedClicked": "#D05B5B"
};

let externalWindow = null;


function Problem({ id , parent, header}) {
    
    const { userProblems, problems } = useContext(AuthContext);
    const [completeBtn, setcompleteBtn] = useState(CompleteIcon2)
    const [startPauseBtn, setstartPauseBtn] = useState(PlayIcon)
    const [incompleteBtn, setincompleteBtn] = useState(InCompleteIcon1)
    console.log(header)
    const [isTimerRunning, setIsTimerRunning] = useState(false);


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
    };
    

    const handleCompleteClick = () => {
        if (completeBtn == CompleteIcon2) {
            setcompleteBtn(CompleteIcon1)
        }
        else {
            setcompleteBtn(CompleteIcon2)
        }
        
    };

    const handleInCompleteClick = () => {
        if (incompleteBtn == InCompleteIcon2) {
            setincompleteBtn(InCompleteIcon1)
        }
        else {
            setincompleteBtn(InCompleteIcon2)
        }
        
    };
    

    return (
        <div className={`problem ${modeClass}`}>
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
                    <img id="incomplete" onClick={handleInCompleteClick} src={incompleteBtn} alt="Incomplete" />
                    <img id="complete" onClick={handleCompleteClick} src={completeBtn} alt="Complete" />
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