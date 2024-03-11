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
import LoadingPage from "../components/LoadingPage";
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';


function Profile() {
    // Grab Current User
    const { currentUser, setCurrentUser, problems, userProblems, setUserProblems, loadingPage } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(currentUser?.name || "");
    const [editedLeetCodeUsername, setEditedLeetCodeUsername] = useState(currentUser?.leetcodeUserName || "");

    const [sortBy, setSortBy] = React.useState('dateCompleted');
    const [showFailureAlert, setShowFailureAlert] = useState(false); // State to control the visibility of the failure alert
    const [showSuccessAlert, setShowSuccessAlert] = useState(false); // State to control the visibility of the failure alert

   // Function to handle the change of sorting criteria
   const handleSortByChange = (event) => {
    setSortBy(event.target.value);
    console.log(sortBy)
    
};

// Derived state for sorted problems based on selected criteria
const [sortedHistoryProblems, setSortedHistoryProblems] = useState([]);

const statusOrder = ["Not Complete", "InComplete", "Complete"];
const difficultyOrder = ["Easy", "Medium", "Hard"];


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
    // console.log(allSubmissions)

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
            return difficultyOrder.indexOf(problemA?.difficulty) - difficultyOrder.indexOf(problemB?.difficulty);

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
        // console.log(filteredAndSorted)

    setSortedHistoryProblems(filteredAndSorted);
}, [userProblems, sortBy]);

    const googleLogoutFnc = async (e) => {
        signOut(auth).then(() => {
            // Sign-out successful.
            console.log('Sign out successful');
        }).catch((error) => {
            // An error happened.
            console.error('Sign out error:', error);
        });
    };

    
    const toggleEditMode = () => {
        setIsEditing(!isEditing);
        // Reset values if cancelling edit
        if (isEditing) {
            setEditedName(currentUser?.name || '');
            setEditedLeetCodeUsername(currentUser?.leetcodeUserName || '');
        }
    };
    
    const saveChanges = async () => {
        if (!editedName.trim() || !editedLeetCodeUsername.trim()) {
            showTemporaryFailureAlert();
            return;
        }
    
        const userDocRef = doc(db, 'users', currentUser.__id);
        try {
            await updateDoc(userDocRef, {
                name: editedName,
                leetcodeUserName: editedLeetCodeUsername,
            });
            setIsEditing(false); // Exit editing mode
            showTemporarySuccessAlert(); // Show success alert only after successful update
        } catch (error) {
            console.error('Error updating profile:', error);
            // Consider showing an error alert here
        }
    };
    
    
    useEffect(() => {
        if (currentUser) {
            setEditedName(currentUser.name || "");
            setEditedLeetCodeUsername(currentUser.leetcodeUserName || "");
        }
    }, [currentUser]);
    
    const showTemporaryFailureAlert = () => {
        setShowFailureAlert(true); // Show the alert

        // Set a timeout to hide the alert after 2 seconds
        setTimeout(() => {
            setShowFailureAlert(false); // Hide the alert
        }, 2000);
    };

    const showTemporarySuccessAlert = () => {
        setShowSuccessAlert(true); // Show the alert

        // Set a timeout to hide the alert after 2 seconds
        setTimeout(() => {
            setShowSuccessAlert(false); // Hide the alert
        }, 2000);
    };


    return (
        <div className="Profile">
            <NavBar></NavBar>   
            {currentUser ? (
                 currentUser.leetcodeUserName ? (
                <div id="profile-content">
                    <div id="profile-side-bar">
                        <div id="main-info">
                            <img id="profile-img" src={currentUser.photo}></img>
                            <div id="info">
                                <h3 id="info-name">
                                    {!isEditing ? currentUser.name :
                                        <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} />
                                    }
                                </h3>
                                <h4 id="info-email">{currentUser.email}</h4>
                                {!isEditing ?
                                    <Button id="edit-btn" variant="contained" color="primary" onClick={toggleEditMode}>
                                        Edit Profile
                                    </Button>
                                    :
                                    <Button id="save-btn" variant="contained" color="primary" onClick={saveChanges}>
                                        Save Changes
                                    </Button>
                                }
                            </div>
                        </div>
                        <div id="info-extra">
                            <img id="leetcode-icon" src={LeetCodeIcon} alt="LeetCode Icon" />
                            <h3 id="leetcode-username">
                                {!isEditing ? currentUser.leetcodeUserName :
                                    <input type="text" value={editedLeetCodeUsername} onChange={(e) => setEditedLeetCodeUsername(e.target.value)} />
                                }
                            </h3>
                        </div>
                        <div id="log-out">
                            <Button id="log-out-btn" variant="contained" color="primary" type="submit" onClick={googleLogoutFnc}>
                                Log Out
                            </Button>
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

                                    height: '40px',
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
                    {showFailureAlert && (
                        <div className="alert-container">
                            <Alert className="alert" variant="filled" severity="error">
                            Please Fill Out All Fields
                            </Alert>
                        </div>
                    )}
                    {showSuccessAlert && (
                        <div className="alert-container">
                            <Alert className="alert" variant="filled" severity="success">
                                Successfully Saved Profile
                            </Alert>
                        </div>
                    )}

                </div>
                ) : (
                    <NewUserInfo/>
                )
            ) : (
                loadingPage ? <LoadingPage />  : <SignIn />
            )}
            {/* <Footer></Footer> */}
        </div>
    );   
}

export default Profile;
