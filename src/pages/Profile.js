import React, { useContext, useState, useEffect } from "react";
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import SignIn from '../components/SignIn'
import NewUserInfo from '../components/NewUserInfo'
import ProblemHistory from '../components/ProblemHistory'


import LeetCodeIcon from '../extra/leetcode-icon.png'; // Import SVG
import './Profile.css';
import { auth, db, app } from './../firebase'
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, Timestamp, getDoc, updateDoc } from "firebase/firestore"; 
import { AuthContext } from '../AuthContext';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


function Profile() {
    // Grab Current User
    const { currentUser, setCurrentUser, problems } = useContext(AuthContext);
    const { userProblems, setUserProblems } = useContext(AuthContext);
    const [editMode, setEditMode] = useState(false);
    const [editedName, setEditedName] = useState(currentUser?.name);
    const [editedEmail, setEditedEmail] = useState(currentUser?.email);

    const [sortBy, setSortBy] = React.useState('dateCompleted');

   // Function to handle the change of sorting criteria
   const handleSortByChange = (event) => {
    setSortBy(event.target.value);
    console.log(sortBy)
    
};

// Derived state for sorted problems based on selected criteria
const [sortedHistoryProblems, setSortedHistoryProblems] = useState([]);

const statusOrder = ["Not Complete", "Repeat", "InComplete", "Complete"];


useEffect(() => {
    // Flatten all submissions into a single list
     const allSubmissions = userProblems.reduce((acc, problem) => {
        const submissions = problem.status.map((status, index) => ({
            ...problem,
            status: [problem.status[index]],
            dateCompleted: [problem.dateCompleted[index]],
            timeDuration: [problem.timeDuration[index]],
        }));
        return [...acc, ...submissions];
    }, []);
    console.log(allSubmissions)

    // Filter and sort submissions based on selected criteria
    const filteredAndSorted =  allSubmissions.filter(submission => submission.status[0] === "Complete" || submission.status[0] === "InComplete")
    .sort((a, b) => {
        const problemA = problems.find(p => p.link === a.problemLink);
    const problemB = problems.find(p => p.link === b.problemLink); // Corrected to b.problemLink
    switch (sortBy) {
        case 'status':
            return statusOrder.indexOf(a.status[0]) - statusOrder.indexOf(b.status[0]);
        case 'title':
            return (problemA?.title || "").localeCompare(problemB?.title || "");
        case 'difficulty':
            // Assuming 'difficulty' is a string like 'Easy', 'Medium', 'Hard'
            if (problemA?.difficulty === problemB?.difficulty) return 0;
            return (problemA?.difficulty || "").localeCompare(problemB?.difficulty || "");
        case 'category':
            // Assuming 'category' is a string
            if (problemA?.category === problemB?.category) return 0;
            return (problemA?.category || "").localeCompare(problemB?.category || "");
        case 'timeDuration':
            return (a.timeDuration[0] || 0) - (b.timeDuration[0] || 0);
            case 'dateCompleted':
            default:
                // Assuming dateCompleted is stored as Firebase Timestamp and needs to be converted to Date object
                const aDate = a.dateCompleted[0]?.toDate() || new Date(0); // Use epoch date as fallback
                const bDate = b.dateCompleted[0]?.toDate() || new Date(0);
                return bDate - aDate;
        }
    });
        console.log(filteredAndSorted)

    setSortedHistoryProblems(filteredAndSorted);
}, [userProblems, sortBy]);

    const googleLogoutFnc = async (e) => {
        signOut(auth).then(() => {
            // Sign-out successful.
            setCurrentUser(null); // dont need
            console.log('Sign out successful');
        }).catch((error) => {
            // An error happened.
            console.error('Sign out error:', error);
        });
    };

    
    const toggleEditMode = () => {
        setEditMode(!editMode);
    };

    // Handle changes to form inputs
    const handleNameChange = (event) => {
        setEditedName(event.target.value);
    };

    const handleEmailChange = (event) => {
        setEditedEmail(event.target.value);
    };

    // Update user profile in Firestore
    const updateUserProfile = async () => {
        if (!currentUser) return;

        const userRef = doc(db, "users", currentUser.uid); // Assuming 'users' is your collection
        await updateDoc(userRef, {
            name: editedName,
            email: editedEmail,
        });

        // Update local user info
        setCurrentUser({
            ...currentUser,
            name: editedName,
            email: editedEmail,
        });

        // Exit edit mode
        setEditMode(false);
    };
  


    return (
        <div className="Profile">
            <NavBar></NavBar>   
            {currentUser ? (
                 currentUser.leetcodeUserName ? (
                <div id="loggedIn">
                    <div id="profile-side-bar">

                        <div id="main-info">
                            <img id="profile-img" src={currentUser.photo}></img>
                            <div id="info">
                            {editMode ? (
                                    <>
                                        <input type = "text" value={editedName} onChange={handleNameChange} />
                                        <input type = "text" value={editedEmail} onChange={handleEmailChange} />
                                    </>
                                ) : (
                                    
                                    <>
                                        <h3 id="info-name">{currentUser.name}</h3>
                                        <h4 id="info-email">{currentUser.email}</h4>
                                    </>
                                )}
                                {/*<h3 id="info-name">{currentUser.name}</h3>
                                <h4 id="info-email">{currentUser.email}</h4>*/}
                                {/*<button id="edit-btn" >Edit Profile</button>*/}
                                <button id="edit-btn" onClick={editMode ? updateUserProfile : toggleEditMode}>
                                    {editMode ? 'Save Changes' : 'Edit Profile'}
                                </button>
                            </div>
                        </div>
                        <div id="info-extra">
                            <img id="leetcode-icon" src={LeetCodeIcon}></img> 
                            <h3 id="leetcode-username">{currentUser.leetcodeUserName}</h3>
                        </div>
                        <div id="log-out">
                            <button id="log-out-btn" onClick={googleLogoutFnc}>Log Out</button>
                        </div>
                    </div>

                    <div id="history">
                        <div id="history-header">
                            <h2 id="history-title">Submission History</h2>
                        
                            <FormControl id="sort-by">
                            <InputLabel id="sort-by-select-label" sx={{ color: 'var(--main-font-color)'}}>Sort By</InputLabel>
                            <Select
                                labelId="sort-by-select-label"
                                id="sort-by-select"
                                value={sortBy}
                                onChange={handleSortByChange}
                                label="Sort By"
                                sx={{

                                    height: '50px',
                                    '.MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'var(--faint-font-color)',
                                    },
                                    '.MuiSvgIcon-root': { // This targets the dropdown icon
                                        color: 'var(---faint-font-color)',
                                    },
                                    color: 'var(--main-font-color)', // This changes the text color
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'var(--faint-font-color)', // Changes outline color on hover
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'var(--main-font-color)', // Changes outline color when focused
                                    }
                                }}
                            >       
                                
                                <MenuItem value="status">Status</MenuItem>
                                <MenuItem value="title">Title</MenuItem>
                                <MenuItem value="difficulty">Difficulty</MenuItem>
                                <MenuItem value="category">Category</MenuItem>
                                <MenuItem value="timeDuration">Time Duration</MenuItem>
                                <MenuItem value="dateCompleted">Date Completed</MenuItem>
                                    
                            </Select>
                        </FormControl>
                    </div>
                        <div id="problems">
                        {sortedHistoryProblems.map((problem, index) => (
                                    <ProblemHistory 
                                    id={problem.__id}
                                    history_status={problem.status[0]}
                                    history_dateCompleted={problem.dateCompleted[0]}
                                    history_timeDuration={problem.timeDuration[0]}
                                    ></ProblemHistory>
                                ))}
                        </div>
                    </div>
                </div>
                ) : (
                    <NewUserInfo/>
                )
            ) : (
               <SignIn></SignIn>
            )}
            <Footer></Footer>
        </div>
    );   
}

export default Profile;
