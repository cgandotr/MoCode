import { useContext , useState} from 'react';
import { AuthContext } from '../AuthContext'; // Adjust the path to your AuthContext
import './Problem.css';
import NewIcon from "../extra/new_icon.svg";
import CompleteIcon1 from "../extra/complete_icon.svg";
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
    "Arrays & Hashing":  "#5B60D0",
    "Linked List": "#C05BD0"
};

const difficultyColors = {
    "Easy":  "#5BD060",
    "Medium": "#D0855B0",
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


function Problem({ id , parent}) {
    
    const { userProblems, problems } = useContext(AuthContext);
    const [completeBtn, setcompleteBtn] = useState(CompleteIcon2)
    const [startPauseBtn, setstartPauseBtn] = useState(PlayIcon)
    const [incompleteBtn, setincompleteBtn] = useState(InCompleteIcon1)


    console.log('User Problems:', userProblems);
    console.log('Problems:', problems);

    const currentUserProblem = userProblems.find(up => up.__id === id);
    const currentProblem = currentUserProblem ? problems.find(p => p.link === currentUserProblem.problemLink) : null;

    console.log('Current User Problem:', currentUserProblem);
    console.log('Current Problem:', currentProblem);


    if (!currentUserProblem || !currentProblem) {
        return null;
    }

    const externalUrl = currentProblem.link; // Replace with your actual URL

    const handleStartPauseClick = () => {
        // If the external window is open and not closed, focus on it
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
        <div className='problem'>
            <div className="title-status-container">
                <img id="status" src={statusImages[currentUserProblem.status]} alt={`Status: ${currentUserProblem.status}`} />
                <div id="title">{currentProblem.title}</div>
            </div>
            <div id="difficulty" style={{ backgroundColor: difficultyColors[currentProblem.difficulty] }}>
                {currentProblem.difficulty}
            </div>
            <div id="category" style={{ backgroundColor: categoryColors[currentProblem.category] }}>
                {currentProblem.category}
            </div>
            {parent === "reccommend" && (
            <div id="buttons">
                <img id="start-pause" onClick={handleStartPauseClick} src={startPauseBtn}></img>
                <img id="incomplete" onClick={handleInCompleteClick} src={incompleteBtn}></img>
                <img id="complete" onClick={handleCompleteClick} src={completeBtn}></img>

            </div>)
            
             }
        </div>
    );
    
}

export default Problem;