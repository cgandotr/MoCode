import React, { useState, useContext, useEffect } from "react";

import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from './firebase';
import { doc, collection, query, where, onSnapshot, Timestamp, getDocs, addDoc, updateDoc, deleteDoc, getDoc } from "firebase/firestore"; // Corrected import
import { AuthContext } from './AuthContext';
import problemsJSON from './problems.json';


/*
----------------------------------------------------------------------------------------------------------------------------
BEGIN
EXPORTED FUNCTIONS
*/

/*
Checks if LeetCode UserName is Valid
------------------------------------
string: LeetCode UserName -> boolean: False,
                             object: Recent Submissions from Valid LeetCode Username
*/
export async function isUsernameValid(username) {
    return true;
    try {
        const response = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${username}`);
        if (response.status !== 200) {
            return false;
        }

        const data = await response.json();
        if (data.errors) {
            return false;
        }

        const submissions = data.recentSubmissions;
        return submissions;

    } catch (error) {
        console.error("Error checking username validity:", error);
        return false; 
    }
}

/*
Populates User History
    Should be called whenever user updates
    LeetCode Username
----------------------------------------------
string: userId,
object: submission history
*/
export async function populateNewUserHistory(userId, submissions) {
    return;
    const questions = await fetchQuestions();

    for (const sub of submissions) {
        const matchingQuestion = questions.find(question => question.title === sub.title);
        
        if (matchingQuestion) {
            const timeStamp = Timestamp.fromMillis(sub.timestamp * 1000);
            const status = sub.statusDisplay === "Accepted" ? "Complete" : "InComplete";
            const timeDuration = null;
            await addUserProblemEntry(userId, matchingQuestion, timeStamp, status, timeDuration);
        }
        else {
        }
    }
    return;
}

/*
Generates New Questions for User
    Called whenever user requests new questions
    Called when creating new user
----------------------------------------------
object: userData,
object: userProblems
*/
export async function generateQuestions(userData, userProblems) {
    // deleteUP(userData.__id)
    const userProblemsDeleted = await flushPreviousQuestions(userData, userProblems);
    userProblems = userProblems.filter(up => !userProblemsDeleted.includes(up.__id));

    const selectedQuestions = generateProblems(userProblems, 3);

    const problems = []
    for (const question of selectedQuestions) {
        const isRepeat = !userProblemsDeleted.some(up => up.problemLink === question.link) && userProblems.some(up => up.problemLink === question.link)
        const status = isRepeat ? "Repeat" : "Not Complete";

        const problemId = await addUserProblemEntry(userData.__id, question, null, status, null);
        problems.push(problemId)
    }
    await updateUserRecommendedArray(userData.__id, problems);

}

/*
END
EXPORTED FUNCTIONS
----------------------------------------------------------------------------------------------------------------------------
*/


/*
----------------------------------------------------------------------------------------------------------------------------
BEGIN
HELPER FUNCTIONS
*/


/*
Fetch ALL Questions (from)
*/
function fetchQuestions() {
    return problemsJSON;
}

// deleteUP(userData.__id)
async function deleteUP(userId) {
    // Search for User Problems
    const userProblemsRef = collection(db, "userProblems");
    const q = query(userProblemsRef, where('__userId', '==', userId));
    const querySnapshot = await getDocs(q);
  
    // Loop through the documents and delete them
    const deletionPromises = [];
    querySnapshot.forEach((doc) => {
      // Add the delete promise to an array
      deletionPromises.push(deleteDoc(doc.ref));
    });
  
    // Wait for all deletions to complete
    await Promise.all(deletionPromises);
  
    console.log(`All problems for user ${userId} have been deleted.`);
  }



/*
----------------------------------------------------------------------------------------------------------------------------
BEGIN
FIREBASE FUNCTIONS
*/


/*
Add user problem and save it into firebase
*/
async function addUserProblemEntry(userId, question, timeStamp, status, timeDuration) {
    const userProblemsRef = collection(db, "userProblems");
    const q = query(userProblemsRef, where('__userId', '==', userId), where('problemLink', '==', question.link));
    const querySnapshot = await getDocs(q);
    let docId;

    if (!querySnapshot.empty) {
        const docToUpdateRef = querySnapshot.docs[0].ref;
        const docToUpdate = querySnapshot.docs[0].data();
        
        // Check if the most recent dateCompleted is not null and if the timeStamp does not already exist
        const mostRecentIsNotNull = docToUpdate.dateCompleted[0] !== null;
        const timestampExists = timeStamp !== null && docToUpdate.dateCompleted?.some(existingTimestamp => 
            existingTimestamp !== null && existingTimestamp.toDate().getTime() === timeStamp.toDate().getTime()
        );
        
        if (mostRecentIsNotNull && !timestampExists) {
            // Prepend new data to the existing arrays only if the most recent dateCompleted is not null
            const newDateCompleted = [timeStamp, ...docToUpdate.dateCompleted];
            const newStatus = [status, ...docToUpdate.status];
            const newTimeDuration = [timeDuration, ...docToUpdate.timeDuration];

            await updateDoc(docToUpdateRef, {
                dateCompleted: newDateCompleted,
                status: newStatus,
                timeDuration: newTimeDuration
            });
        }

        docId = docToUpdate.__id;
    } else {
        // No existing entry found; create a new one
        const userProblem = {
            __userId: userId,
            dateCompleted: [timeStamp],
            problemLink: question.link,
            status: [status],
            timeDuration: [timeDuration]
        };

        const docRef = await addDoc(userProblemsRef, userProblem);

        await updateDoc(doc(db, "userProblems", docRef.id), {
            __id: docRef.id
        });

        docId = docRef.id;
    }
    return docId;
}



async function flushPreviousQuestions(userData, userProblems) {
    let deleted = []
    try {
        // Iterate over recommended userProblem IDs
        for (let userProblemId of userData.recommended) {
            console.log(userProblemId)
            // Find the userProblem object using the userProblemId
            const userProblem = userProblems.find(up => up.__id === userProblemId);

            if (userProblem) {
                // If user first time seeing problem and didnt attempt, delete it
                if (userProblem.dateCompleted.length == 1 && userProblem.dateCompleted[0] == null) {
                    const userProblemRef = doc(db, "userProblems", userProblem.__id);
                    
                    // Delete the document
                    await deleteDoc(userProblemRef);
                    deleted.push(userProblem)
                }
                
            } else {
                console.log(`No user problem found for ID: ${userProblemId}`);
            }
        }
        return deleted
    } catch (error) {
        console.error("Error flushing previous questions: ", error);
        throw new Error('Failed to flush previous questions.');
    }
}





async function updateUserRecommendedArray(userId, problems) {

    // Update the document with the new array
    await updateDoc(doc(db, "users", userId), {
        recommended: problems,
    });

}


/*
END
FIREBASE / RECOMMENDATION FUNCTIONS
----------------------------------------------------------------------------------------------------------------------------
*/


/*
----------------------------------------------------------------------------------------------------------------------------
BEGIN
REC PROBLEMS FUNCTIONS
*/


// Weighted random selection helper function
function weightedRandomSelect(problems, count, allProblems) {
    const selected = [];
    for (let i = 0; i < count; i++) {
        let sum = 0;
        const rand = Math.random();
        for (const problem of problems) {
            sum += problem.normalizedWeight;
            if (rand <= sum) {
                const fullProblem = allProblems.find(p => p.link === problem.link);
                if (fullProblem && !selected.includes(fullProblem)) { // Check if not already selected
                    selected.push(fullProblem);
                    break;
                }
            }
        }
    }
    return selected;
}



function generateProblems(userProblems, count) {
    const problems = fetchQuestions()

    const probabilityProblems = problems.map(problem => {
        const matchedUserProblem = userProblems.find(up => up.problemLink === problem.link);
        let score = 0.0
        // User Has Seen Problem Before
        if (matchedUserProblem) {
            score = calculateScoreRepeat(matchedUserProblem);
        }
        else {
            let [averageDifficulty, recentCategories] = recentStatistics(userProblems)
            score = calculateScoreNew(problem, averageDifficulty, recentCategories)
        }

        const probability = calculateProbability(score, 4);
        return { link: problem.link, probability }; // Ensure weight is not NaN
    });

    // Normalize Probability
    const totalProb = probabilityProblems.reduce((acc, problem) => acc + problem.probability, 0);
    const normalizedProblems = probabilityProblems.map(problem => ({
        ...problem,
        normalizedWeight: totalProb > 0 ? problem.probability / totalProb : 0, // Avoid division by zero
    }));

    // Perform weighted random selection
    const selectedProblems = weightedRandomSelect(normalizedProblems, count, problems);
    return selectedProblems;
}

// Calculate Probability Based on Score
function calculateProbability(score, k) {
    return 1 / (1 + Math.exp(-k * (score - 1)));
  }

 
// Calculate Score based on Repeated Question
function calculateScoreRepeat(userProblem) {
    const currentDate = new Date();

    // Initialize both scores with a minimum value of 0.25
    let recencyScore = 0.50;
    let frequencyScore = 0.25;

    if (userProblem.dateCompleted[0]) {
        const lastAttemptDate = new Date(userProblem.dateCompleted[0]); 
        if (!isNaN(lastAttemptDate.getTime())) { 
            const hoursSinceLastAttempt = (currentDate - lastAttemptDate) / (1000 * 60 * 60);
            recencyScore = Math.max(0.50, 1 - (hoursSinceLastAttempt / (24 * 60))); // Normalizing over 60 days
        }
    }
    frequencyScore = Math.max(0.25, 1 - (Math.min(userProblem.dateCompleted.length, 15) / 15)); 
    // [.75, 2]
    return recencyScore + frequencyScore;
}

const categories = ["Arrays & Hashing", "Two Pointers", "Sliding Window", "Stack", "Binary Search", "Linked List", "Trees", "Tries", "Heap / Priority Queue", "Backtracking", "Graphs", "Advanced Graphs", "1-D Dynamic Programming", "2-D Dynamic Programming", "Greedy", "Intervals", "Math & Geometry", "Bit Manipulation", "JavaScript"]

const difficultyToNum = {
    "Easy": 1,
    "Medium": 3,
    "Hard": 6
}

// Calculate Score based on New Question
function calculateScoreNew(problem, averageDifficulty, recentCategories) {
    let categoryScore = recentCategories.includes(problem.category) ? 1 : 0.25;
    let difficultyScore = Math.max(0.0, Math.min(4, 1 - Math.abs(difficultyToNum[problem.difficulty] - averageDifficulty)));
     // [.25, 5]
    return  categoryScore + difficultyScore;
}

// Top 10 stats for category and difficulty
function recentStatistics(userProblems, problems) {
    let recentCategories = new Set();
    let totalDifficulty = 0;
    let averageDifficulty;

    // Define a slice of the first 7 categories for random selection
    const defaultCategories = categories.slice(0, 7);

    let recentlyCompletedProblems = userProblems
        .filter(up => up.status[0] === "Completed")
        .sort((a, b) => b.dateCompleted[0].toDate() - a.dateCompleted[0].toDate())
        .slice(0, 10);

    // If there are fewer than 10 recently completed problems, fill the gap with "fake" entries
    if (recentlyCompletedProblems.length < 10) {
        const missingCount = 10 - recentlyCompletedProblems.length;
        for (let i = 0; i < missingCount; i++) {
            const randomCategoryIndex = Math.floor(Math.random() * defaultCategories.length);
            const randomCategory = defaultCategories[randomCategoryIndex];
            // Create a "fake" problem entry with Medium difficulty and a randomly picked category
            recentlyCompletedProblems.push({
                category: randomCategory,
                difficulty: "Easy",
                // Mimic structure of a real problem entry if needed
            });
        }
    }

    // Process all (real and "fake") recently completed problems
    recentlyCompletedProblems.forEach(up => {
        if (up.hasOwnProperty('problemLink')) {
            const matchingProblem = problems.find(p => p.link === up.problemLink);
            if (matchingProblem) {
                totalDifficulty += difficultyToNum[matchingProblem.difficulty];
                recentCategories.add(matchingProblem.category);
            }
        } else {
            // Handle the "fake" problems
            totalDifficulty += difficultyToNum[up.difficulty];
            recentCategories.add(up.category);
        }
    });

    averageDifficulty = totalDifficulty / recentlyCompletedProblems.length;

    return [averageDifficulty, Array.from(recentCategories)];
}


/*
END
REC PROBLEMS FUNCTIONS
----------------------------------------------------------------------------------------------------------------------------
*/


/*
----------------------------------------------------------------------------------------------------------------------------
BEGIN
OLD FUNCTIONS
*/


// async function defaultPrioritiesString() {
//     const questions = await fetchQuestions();

//     // Use map to transform each question into a string "link:0.50"
//     const priorities = questions.map(question => `${question.link}=0.50`);

//     // Join all the priority strings with a comma
//     return priorities.join(',');
// }


// function recommendRepeatProblems(userProblems, count) { // Default k to 1 if not specified
//     const problems = fetchQuestions(); // Assume this fetches the full list of questions
//     const currentDate = new Date();

//     const weightedProblems = userProblems.map(problem => {
//         let recencyScore = 0.5; // Default to a neutral value
//         let frequencyScore = 0.5; // Default to a neutral value

//         if (problem.dateCompleted[0]) {
//             const lastAttemptDate = new Date(problem.dateCompleted[0]);
//             if (!isNaN(lastAttemptDate.getTime())) { // Ensure lastAttemptDate is a valid date
//                 const hoursSinceLastAttempt = (currentDate - lastAttemptDate) / (1000 * 60 * 60);
//                 recencyScore = Math.max(0, 1 - (hoursSinceLastAttempt / (24 * 30))); // Recency score calculation
//                 frequencyScore = 1 - (Math.min(problem.dateCompleted.length, 10) / 10); // Frequency score calculation, capped at 10
//             }
//         }

//         // Calculate weight using logistic function
//         const logisticInput = -k * (recencyScore + frequencyScore - 1);
//         const weight = 1 / (1 + Math.exp(logisticInput));

//         return { link: problem.problemLink, weight: isNaN(weight) ? 0 : weight }; // Ensure weight is not NaN
//     });

//     // Normalize the weights
//     const totalWeight = weightedProblems.reduce((acc, problem) => acc + problem.weight, 0);
//     const normalizedProblems = weightedProblems.map(problem => ({
//         ...problem,
//         normalizedWeight: totalWeight > 0 ? problem.weight / totalWeight : 0, // Avoid division by zero
//     }));

//     // Perform weighted random selection
//     const selectedProblems = weightedRandomSelect(normalizedProblems, count, problems);
    
//     return selectedProblems;
// }


// function recommendRepeatProblems(userProblems, count) {
//     const problems = fetchQuestions(); // Assume this fetches the full list of questions
//     const currentDate = new Date();

//     // const eligibleUserProblems = userProblems;
//     // // .filter(problem => {
//     // //     if (!problem.dateCompleted[0]) {
//     // //         return true; // Always include problems without a completion date
//     // //     } else {
//     // //         const lastAttemptDate = new Date(problem.dateCompleted[0]);
//     // //         const hoursSinceLastAttempt = (currentDate - lastAttemptDate) / (1000 * 60 * 60);
//     // //         return hoursSinceLastAttempt >= 24; // Exclude problems completed within the last 24 hours
//     // //     }
//     // // });

//     const weightedProblems = userProblems.map(problem => {
//         let recencyScore = 0.0;
//         let frequencyScore = 0.0;

//         if (problem.dateCompleted[0]) {
//             // Calculate recency score
//             const lastAttemptDate = new Date(problem.dateCompleted[0]);
//             const hoursSinceLastAttempt = (currentDate - lastAttemptDate) / (1000 * 60 * 60);
//             recencyScore = Math.max(0, 1 - (hoursSinceLastAttempt / (24 * 30))); // Example: Recency within a month scales from 1 to 0

//             // Calculate frequency score
//             frequencyScore = 1 - (problem.dateCompleted.length / 10); // Assuming max frequency score decreases as attempts increase, capped at 10 attempts
//         } else {
//             // Medium base score for null completion dates, assuming neutral frequency and recency
//             recencyScore = 0.5;
//             frequencyScore = 0.5;
//         }

//         // Combine recency and frequency scores
//         let combineScore = (recencyScore + frequencyScore)

//         // Apply logistic function transformation to adjust probability
//         const weight = 1 / (1 + Math.exp(-k * (recencyScore + frequencyScore - 0.5)));
//         return { link: problem.problemLink, weight };
//     });

//     // Then, normalize the weights to sum to 1
//     const totalWeight = weightedProblems.reduce((acc, problem) => acc + problem.weight, 0);
//     const normalizedProblems = weightedProblems.map(problem => ({
//         ...problem,
//         normalizedWeight: problem.weight / totalWeight
//     }));
//     console.log(normalizedProblems, count, problems)
//     // Perform weighted random selection based on normalized weights
//     const selectedProblems = weightedRandomSelect(normalizedProblems, count, problems);
//     console.log(selectedProblems)
//     return selectedProblems;
// }


// function recommendNewProblems(userProblems, count) {
//     const problems = fetchQuestions(); 
//     let targetCategoriesSet = new Set();
//     let totalDifficultyNum = 0;
//     let averageDifficultyNum = 0;

//     const recentlyCompletedProblems = userProblems
//         .filter(up => up.status[0] === "Completed")
//         .sort((a, b) => b.dateCompleted[0].toDate() - a.dateCompleted[0].toDate())
//         .slice(0, 10);

//     if (recentlyCompletedProblems.length > 0) {
//         recentlyCompletedProblems.forEach(up => {
//             const matchingProblem = problems.find(p => p.link === up.problemLink);
//             if (matchingProblem) {
//                 totalDifficultyNum += difficultyToNum[matchingProblem.difficulty];
//                 targetCategoriesSet.add(matchingProblem.category);
//             }
//         });

//         averageDifficultyNum = totalDifficultyNum / recentlyCompletedProblems.length;
//     } else {
//         averageDifficultyNum = difficultyToNum["Easy"];
//         targetCategoriesSet = new Set(categories);
//     }

//     const attemptedProblemLinks = new Set(userProblems.map(problem => problem.problemLink));
//     const unattemptedProblems = problems.filter(problem => !attemptedProblemLinks.has(problem.link));

//     // Calculate weights for unattempted problems
//     const weightedProblems = unattemptedProblems.map(problem => {
//         let categoryScore = targetCategoriesSet.has(problem.category) ? 1 : 0;
//         let difficultyScore = 1 - Math.abs(difficultyToNum[problem.difficulty] - averageDifficultyNum);
//         let weight = 1 / (1 + Math.exp(-k * (categoryScore + difficultyScore - 0.5)));

//         return { link: problem.link, weight };
//     });

//     // Normalize weights to sum to 1
//     const totalWeight = weightedProblems.reduce((acc, problem) => acc + problem.weight, 0);
//     const normalizedProblems = weightedProblems.map(problem => ({
//         ...problem,
//         normalizedWeight: problem.weight / totalWeight
//     }));

//     console.log(normalizedProblems, count, problems)

//     // Perform weighted random selection
//     const selectedProblems = weightedRandomSelect(normalizedProblems, count, problems);

//     // Return selected problems
//     console.log(selectedProblems)
//     return selectedProblems;
// }


// const spacialP = 0.8;
// export function generateRecommendations(userProblems, count) {
//     const problems = fetchQuestions(); 
//     let targetCategoriesSet = new Set();
//     let totalDifficultyNum = 0;
//     let averageDifficultyNum = 0;

//     const recentlyCompletedProblems = userProblems
//         .filter(up => up.status[0] === "Completed")
//         .sort((a, b) => b.dateCompleted[0].toDate() - a.dateCompleted[0].toDate())
//         .slice(0, 10);

//     if (recentlyCompletedProblems.length > 0) {
//         recentlyCompletedProblems.forEach(up => {
//             const matchingProblem = problems.find(p => p.link === up.problemLink);
//             if (matchingProblem) {
//                 totalDifficultyNum += difficultyToNum[matchingProblem.difficulty];
//                 targetCategoriesSet.add(matchingProblem.category);
//             }
//         });

//         averageDifficultyNum = totalDifficultyNum / recentlyCompletedProblems.length;
//     } else {
//         averageDifficultyNum = difficultyToNum["Easy"];
//         targetCategoriesSet = new Set(categories);
//     }

//     const attemptedProblemLinks = new Set(userProblems.map(problem => problem.problemLink));
//     const unattemptedProblems = problems.filter(problem => !attemptedProblemLinks.has(problem.link));

//     // Calculate weights for unattempted problems
//     const weightedProblems = unattemptedProblems.map(problem => {
//         let categoryScore = targetCategoriesSet.has(problem.category) ? 1 : 0;
//         let difficultyScore = 1 - Math.abs(difficultyToNum[problem.difficulty] - averageDifficultyNum);
//         let weight = 1 / (1 + Math.exp(-k * (categoryScore + difficultyScore - 0.5)));

//         return { link: problem.link, weight };
//     });

//     // Normalize weights to sum to 1
//     const totalWeight = weightedProblems.reduce((acc, problem) => acc + problem.weight, 0);
//     const normalizedProblems = weightedProblems.map(problem => ({
//         ...problem,
//         normalizedWeight: problem.weight / totalWeight
//     }));

//     console.log(normalizedProblems, count, problems)

//     // Perform weighted random selection
//     const selectedProblems = weightedRandomSelect(normalizedProblems, count, problems);

//     // Return selected problems
//     console.log(selectedProblems)
//     return selectedProblems;
    
// }



//   export function nextSpacialRepetitionProblems(userProblems, count) {
//     // Current date to calculate recency
//     const currentDate = new Date();
  
//     // Define the weight for date priority (adjust this to shift emphasis between recency and frequency)
//     let datePriorityWeight = 0.5; // Example: 0.5 equally weighs both factors
  
//     // Sort problems based on a weighted combination of recency and frequency
//     const sortedProblems = userProblems.sort((a, b) => {
//       // Check for null most recent completion date and assign low priority
//       const hasRecentA = a.dateCompleted[0] !== null;
//       const hasRecentB = b.dateCompleted[0] !== null;
  
//       if (!hasRecentA && hasRecentB) return 1; // A is deprioritized
//       if (hasRecentA && !hasRecentB) return -1; // B is deprioritized
  
//       // Calculate the recency factor (days since last seen) for non-null dates
//       const recencyA = hasRecentA ? (currentDate - new Date(a.dateCompleted[0])) / (1000 * 3600 * 24) : 0;
//       const recencyB = hasRecentB ? (currentDate - new Date(b.dateCompleted[0])) / (1000 * 3600 * 24) : 0;
  
//       // Calculate priority based on recency and frequency
//       const priorityA = (datePriorityWeight * recencyA) + ((1 - datePriorityWeight) * a.dateCompleted.length);
//       const priorityB = (datePriorityWeight * recencyB) + ((1 - datePriorityWeight) * b.dateCompleted.length);
  
//       // Sort by ascending priority
//       return priorityA - priorityB;
//     });
  
//     // Return the IDs of the top 'count' sorted problems based on the calculated priority
//     return sortedProblems.slice(0, count); // Ensure to map to problem.id for the return
//   }

//   export function recentDifficultyAttempts(userProblems) {
//     // Assuming fetchQuestions is defined and returns the problems array
//     const problems = fetchQuestions(); // Correctly call fetchQuestions to get problems

//     const difficultyScale = { Easy: 0, Medium: 0.5, Hard: 1 };

//     const completedProblems = userProblems.filter(us => us.status[0] === "Complete");

//     // Correctly sort by dateCompleted[0] in descending order
//     const sortedByDateCompleted = completedProblems.sort((a, b) => {
//         const dateB = new Date(b.dateCompleted[0]); // Note the swapped names
//         const dateA = new Date(a.dateCompleted[0]);
//         return dateB - dateA; // Descending order
//     });

//     // Take the last (most recent) 10 completed problems
//     const lastCompleted = sortedByDateCompleted.slice(0, 10);

//     // Pad with 'Easy' if less than 10
//     const paddedLastCompleted = lastCompleted.length < 10
//         ? [...lastCompleted, ...Array(10 - lastCompleted.length).fill({ problemLink: null })]
//         : lastCompleted;

//     const difficulties = paddedLastCompleted.map(us => {
//         const matchingProblem = problems.find(p => p.link === us.problemLink);
//         return matchingProblem ? difficultyScale[matchingProblem.difficulty] : difficultyScale['Easy']; // Default to 'Easy' if not found
//     });

//     // Calculate the average difficulty based on paddedLastCompleted
//     const averageDifficulty = difficulties.reduce((acc, difficulty) => acc + difficulty, 0) / paddedLastCompleted.length;
    
//     return averageDifficulty;
// }
  

// function convertPrioritiesStringToObject(prioritiesString) {
//     // Split the string to get an array of "link:priority" pairs
//     const pairs = prioritiesString.split(',');

//     // Initialize an empty object to hold the link-priority mappings
//     const prioritiesObject = {};

//     // Iterate over each pair
//     pairs.forEach(pair => {
//         // Split each pair by ":" to separate the link and its priority
//         const [link, priority] = pair.split('=');

//         // Convert priority to float and add the link (as string) and priority (as float) to the object
//         prioritiesObject[link] = parseFloat(priority);
//     });

//     return prioritiesObject;
// }

// function convertPrioritiesObjectToString(prioritiesObject) {
//     // Convert the priorities object into an array of "link:priority" strings
//     const pairs = Object.entries(prioritiesObject).map(([link, priority]) => `${link}=${priority}`);

//     // Join the pairs with a comma to form the final string
//     return pairs.join(',');
// }


// function calculateProbability(oldProbability) {
//     console.log(oldProbability)
//     console.log(1 / (1 + Math.exp(-k * (oldProbability - 1))))
//     return 1 / (1 + Math.exp(-k * (oldProbability - 1)));
//   }




// async function generateQuestionsBasedOnProbability(prioritiesObject, count) {
//     const questions = await fetchQuestions();
//     // Convert prioritiesObject values to an array of numbers for totalWeight calculation
//     let totalWeight = Object.values(prioritiesObject).reduce((acc, priority) => acc + parseFloat(priority), 0);
//     let selectedQuestions = [];

//     questions.sort((a, b) => {
//         // Get the priority for question a and b, or default to 0.5 if not found in prioritiesObject
//         const priorityA = prioritiesObject[a.url] !== undefined ? prioritiesObject[a.url] : 0.5;
//         const priorityB = prioritiesObject[b.url] !== undefined ? prioritiesObject[b.url] : 0.5;
      
//         // Compare the two priorities to determine the order
//         return priorityB - priorityA;
//       });
//       const sortedEntries = Object.entries(prioritiesObject)
//       .sort((a, b) => a[1] - b[1]); // Sort the array by the second element (the number) of each pair
      
//     // Convert the array back into an object
//     const sortedObject = Object.fromEntries(sortedEntries);
//     console.log( "entry" + sortedEntries);
//       console.log(questions); // Sorted questions based on priority

//     for (let i = 0; i < count; i++) {
//         let randomNum = Math.random() * totalWeight;
//         let sum = 0;
//         for (let j = 0; j < questions.length; j++) {
//             // Use question's link to look up its priority in the prioritiesObject
//             const questionPriority = parseFloat(prioritiesObject[questions[j].link] || "0");
//             sum += questionPriority;
//             if (randomNum <= sum) {
//                 selectedQuestions.push(questions[j]);
//                 break;
//             }
//         }
//     }
//     return selectedQuestions;
// }

// async function adjustProbability(userData, matchingQuestion, status) {
//     try {
        
//         const prioritiesObject = convertPrioritiesStringToObject(userData.priorities);
//         // console.log(prioritiesObject)
//         // Initialize the priority if the link is not found
//         if (!(matchingQuestion.link in prioritiesObject)) {
//             prioritiesObject[matchingQuestion.link] = 0.50; // Default priority
//         }

//         // Adjust priority based on status
//         if (status === "Complete") {
//             prioritiesObject[matchingQuestion.link] = calculateProbability(prioritiesObject[matchingQuestion.link]);
//         } else if (status === "InComplete") {
//             prioritiesObject[matchingQuestion.link] = calculateProbability(prioritiesObject[matchingQuestion.link]);
//         }
//         // No change for other statuses
//         // console.log("NEW " + prioritiesObject[matchingQuestion.link])

//         const prioritiesNewString = convertPrioritiesObjectToString(prioritiesObject);
//         // console.log(userData.__id)
//         const userDocRef = doc(db, "users", userData.__id);

//         // Update the document with the new priorities string
//         await updateDoc(userDocRef, {
//             priorities: prioritiesNewString
//         });
//     } catch (error) {
//         console.error("Error adjusting user priorities: ", error);
//         throw new Error('Failed to adjust user priorities.');
//     }
// }


/*
END
OLD FUNCTIONS
----------------------------------------------------------------------------------------------------------------------------
*/
