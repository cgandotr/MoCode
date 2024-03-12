import { useContext , React} from 'react';
import './ProblemHistory.css';

/* AuthContext Imports */
import { AuthContext } from '../AuthContext';

/* Custom imports */
import { difficultyColors, categoryColors, statusImages } from '../index';

/* MUI Library Imports */
import Tooltip from '@mui/material/Tooltip';


/*
ProblemHistory
------------------------------------
Problem Component for History
We flatten out our problems (since status, dateCompleted, and timeDuration are arrays)
    then feed the properties to this component
Used in 'Profile' Component
------------------------------------
inputs:
    id (the id of the userProblem passed in)
    history_status (the status of the userProblem passed in)
    history_dateCompleted (the date of completion of the userProblem passed in)
    history_dateCompleted (the time duration of the userProblem passed in)

outputs:
    -
*/
const ProblemHistory = ({ id, parent, history_status, history_dateCompleted, history_timeDuration}) => {
    /*
    AuthContext Variables
    */
    const { userProblems, problems } = useContext(AuthContext);

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


    /* Render null if not able to find matching userProblem or Problem */
    if (!currentUserProblem || !currentProblem) {
        return null;
    }

    /*
    formatTime()
    ------------------------------------
    inputs: time (int) in seconds

    outputs: formatted version of time (string)
    */
    function formatTime(timeInSeconds) {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        if (timeInSeconds == null) {
            return "null"
        }
        if (hours > 0) {
        return `${hours}hr, ${minutes}min`;
        } else {
        return `${minutes}min`;
        }
    }
    

    return (
        <div className="history" id='problem'>
            <div id="problem-metadata" className='history'>
                <div id='title-status-container' className="history">
                    <Tooltip title={`Problem Status: ${history_status}`}>
                        <img id="status" className="history" src={statusImages[history_status]} alt={`Status: ${history_status}`} />
                    </Tooltip>
                    <Tooltip title={currentProblem.title}>
                        <h3 id="title" className="history" >{currentProblem.title}</h3>
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
            <div id="user-stats">
                <h4 id="duration" className='history'>{formatTime(history_timeDuration)}</h4>
                <h4 id="date-completed" className='history'>
                    {history_dateCompleted.toDate().toLocaleDateString("en-US", {
                        month: 'long', 
                        day: 'numeric',
                    })}
                </h4>  

            </div> 
        </div>
    );
}

export default ProblemHistory;