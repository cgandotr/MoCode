import { useContext , useEffect, useState} from 'react';
import { AuthContext } from '../AuthContext'; // Adjust the path to your AuthContext
import './ProblemHistory.css';

import CompleteIcon1 from "../extra/complete-1.svg"
import CompleteIcon2 from "../extra/complete-2.svg";
import InCompleteIcon1 from "../extra/incomplete-1.svg"
import InCompleteIcon2 from "../extra/incomplete-2.svg"

import { db } from '../firebase';
import { doc, setDoc, Timestamp, getDoc } from 'firebase/firestore';

const statusImages = {
    "Complete": CompleteIcon1,
    "InComplete": InCompleteIcon1,
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




const ProblemHistory = ({ id, parent, history_status, history_dateCompleted, history_timeDuration}) => {
    
    const { userProblems, problems } = useContext(AuthContext);

   
    const currentUserProblem = userProblems.find(up => up.__id === id);
    const currentProblem = currentUserProblem ? problems.find(p => p.link === currentUserProblem.problemLink) : null;

    
    if (!currentUserProblem || !currentProblem) {
        return null;
    }

  

  function formatTime(timeInSeconds) {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
  
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
                    <img id="status" className="history" src={statusImages[history_status]} alt={`Status: ${history_status}`} />
                    <h3 id="title" className="history" >{currentProblem.title}</h3>
                </div>
                
                <h4 id="difficulty" className='history' style={{ backgroundColor: difficultyColors[currentProblem.difficulty] }}>
                    {currentProblem.difficulty}
                </h4>
                <h4 id="category" className='history' style={{ backgroundColor: categoryColors[currentProblem.category] }}>
                    {currentProblem.category}
                </h4>
            </div>
            
            <div id="user-stats">
                 <h4 id="duration" className='history'> 
                    {formatTime(history_timeDuration)}
                </h4>
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