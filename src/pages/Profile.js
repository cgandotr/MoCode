import React, { useContext, useState, useEffect } from "react";
import './Profile.css';

/* Custom Components Imports */
import NavBar from '../components/NavBar';
import SignIn from '../components/SignIn'
import NewUserInfo from '../components/NewUserInfo'
import ProblemHistory from '../components/ProblemHistory'
import LoadingPage from "../components/LoadingPage";

/* Custom imports */
import LeetCodeIcon from '../extra/leetcode-icon.png'; 

/* Firebase Imports */
import { auth, db } from './../firebase'
import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore"; 

/* AuthContext Imports */
import { AuthContext } from '../AuthContext';

/* MUI Library Imports */
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

/* Custom imports */
import { statusOrder, difficultyOrder } from "../index";


/*
Profile
------------------------------------
Profile Component of our Webite
Contains ProblemHistory for returning user
Redirects new user for SignIn process
------------------------------------
*/
function Profile() {
    /*
    AuthContext Variables
    */
    const { currentUser, problems, userProblems, loadingPage } = useContext(AuthContext);

    /*
    States for Editing Profile
    ------------------------------------
        currently editing state
        current name that is being edited state
        current leetcodeusername that is being edited state
    */
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(currentUser?.name || "");
    const [editedLeetCodeUsername, setEditedLeetCodeUsername] = useState(currentUser?.leetcodeUserName || "");

    /*
    State for Sort By
    */
    const [sortBy, setSortBy] = useState('dateCompleted');

    /*
    State for sorted History Problems
    */
    const [sortedHistoryProblems, setSortedHistoryProblems] = useState([]);

    /*
    State for showing failure alert
        Shown when error updating users profile
    */
    const [showFailureAlert, setShowFailureAlert] = useState(false); 

    /*
    State for showing success alert
        Shown when successfully update user profile
    */
    const [showSuccessAlert, setShowSuccessAlert] = useState(false); 

    /*
    handleSortByChange()
    ------------------------------------
    Function to handle the change of sorting criteria
    ------------------------------------
    */
   const handleSortByChange = (event) => {
        setSortBy(event.target.value);
        console.log(sortBy)
    };

    /*
    useEffect()
    ------------------------------------
    Here we work on getting our sorted history user problems

    First we collect all flattened submitted problems
    Remember status, dateComplted, timeDuration are all arrays w/ equal lengths
    Thus the index i for these arrays indicate the ith time the user has seen attempted this problem

    After flattening we filter based on status being Complete or InComplete
        This tells us its a history problem
    Then we sort by the sorting indicated by our Select component
    ------------------------------------
    */
    useEffect(() => {
        /* Flatten all problems into a single list */
        const allSubmissions = userProblems.reduce((acc, problem) => {
            const submissions = problem.status.map((status, index) => ({
                ...problem,
                status: [problem.status[index]],
                dateCompleted: [problem.dateCompleted[index]],
                timeDuration: [problem.timeDuration[index]],
            }));
            return [...acc, ...submissions];
        }, []);

        /* Filter and sort submissions based on selected criteria */
        const filteredAndSorted =  allSubmissions.filter(submission =>
            submission.status[0] === "Complete" || submission.status[0] === "InComplete")
            .sort((a, b) => {
            
            /* matching problems for current userProblems that we are sorting */
            const problemA = problems.find(p => p.link === a.problemLink);
            const problemB = problems.find(p => p.link === b.problemLink); 

            /* Return differnt order based on what we are sorting by */
            switch (sortBy) {
                case 'status':
                    return statusOrder.indexOf(a.status[0]) - statusOrder.indexOf(b.status[0]);
                case 'title':
                    return (problemA?.title || "").localeCompare(problemB?.title || "");
                case 'difficulty':
                    return difficultyOrder.indexOf(problemA?.difficulty) - difficultyOrder.indexOf(problemB?.difficulty);
                case 'category':
                    if (problemA?.category === problemB?.category) return 0;
                    return (problemA?.category || "").localeCompare(problemB?.category || "");
                case 'timeDuration':
                    return (a.timeDuration[0] || 0) - (b.timeDuration[0] || 0);
                case 'dateCompleted':
                default:
                    const aDate = a.dateCompleted[0]?.toDate() || new Date(0);
                    const bDate = b.dateCompleted[0]?.toDate() || new Date(0);
                    return bDate - aDate;
            }
        });
        /* Set State of Sorted History Problems */
        setSortedHistoryProblems(filteredAndSorted);
    }, [userProblems, sortBy]);

    /*
    googleLogoutFnc()
    ------------------------------------
    Function that handles user clicking Log Out
    ------------------------------------
    */
    const googleLogoutFnc = async (event) => {
        signOut(auth).then(() => {
            console.log('Sign out successful');
        }).catch((error) => {
            console.error('Sign out error:', error);
        });
    };

    /*
    toggleEditMode()
    ------------------------------------
    Changes State of Editing Mode on Click
    ------------------------------------
    */
    const toggleEditMode = () => {
        setIsEditing(!isEditing);
        if (isEditing) {
            setEditedName(currentUser?.name || '');
            setEditedLeetCodeUsername(currentUser?.leetcodeUserName || '');
        }
    };
    
    /*
    saveChanges()
    ------------------------------------
    Updates changes to Edit Profile to firebase
    ------------------------------------
    */
    const saveChanges = async () => {
        /* If user left one or more blank, indicate error */
        if (!editedName.trim() || !editedLeetCodeUsername.trim()) {
            showTemporaryFailureAlert();
            return;
        }
        
        /* Update new info to currentUser document */
        const userDocRef = doc(db, 'users', currentUser.__id);
        try {
            await updateDoc(userDocRef, {
                name: editedName,
                leetcodeUserName: editedLeetCodeUsername,
            });
            setIsEditing(false); 
            /* Indicate successful update */
            showTemporarySuccessAlert();
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };
        
    /*
    useEffect()
    ------------------------------------
    Here we update our edited names and leetcodeusername States
    Upon Start
    ------------------------------------
    */
    useEffect(() => {
        if (currentUser) {
            setEditedName(currentUser.name || "");
            setEditedLeetCodeUsername(currentUser.leetcodeUserName || "");
        }
    }, [currentUser]);
    
    /*
    showTemporaryFailureAlert()
    ------------------------------------
    Function that shows failure alert for 2s
    ------------------------------------
    */
    const showTemporaryFailureAlert = () => {
        setShowFailureAlert(true);
        setTimeout(() => {
            setShowFailureAlert(false);
        }, 2000);
    };

    /*
    showTemporarySuccessAlert()
    ------------------------------------
    Function that shows success alert for 2s
    ------------------------------------
    */
    const showTemporarySuccessAlert = () => {
        setShowSuccessAlert(true); 
        setTimeout(() => {
            setShowSuccessAlert(false); 
        }, 2000);
    };


    return (
        <div className="Profile">
            <NavBar></NavBar>   
            {/* If theres a current user */}
            {/*     We want to display the Profile page for a returning user */}
            {/*     If leetcodeUserName == "", then we consider the current User a new user */}
            {/*         Redirect them to NewUserInfo to fill in username */}
            {/* If no current user */}
            {/*     We display loading page if it should be displayed */}
            {/*     Else we display Sign In Page */}
            {currentUser ? (
                currentUser.leetcodeUserName ? (
                <div id="profile-content">
                    <div id="profile-side-bar">
                        <div id="main-info">
                            <img id="profile-img" src={currentUser.photo}></img>
                            <div id="info">
                                <h3 id="info-name">
                                    {!isEditing ? currentUser.name : <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} />}
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
                                {!isEditing ? currentUser.leetcodeUserName : <input type="text" value={editedLeetCodeUsername} onChange={(e) => setEditedLeetCodeUsername(e.target.value)} />}
                            </h3>
                        </div>
                        <div id="log-out">
                            <Button id="log-out-btn" variant="contained" color="primary" type="submit" onClick={googleLogoutFnc}>Log Out</Button>
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
                                        '.MuiOutlinedInput-notchedOutline': { borderColor: 'var(--faint-font-color)' },
                                        '.MuiSvgIcon-root': { color: 'var(---faint-font-color)', },
                                        color: 'var(--main-font-color)', 
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--faint-font-color)' },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--main-font-color)' }
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
        </div>
    );   
}

export default Profile;
