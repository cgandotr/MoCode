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
isUsernameValid(username)
----------------------------------------------
Attempts to verify the validity of a LeetCode username by fetching recent submission data.
----------------------------------------------
inputs:
    string: username - The LeetCode username to verify.
outputs:
    mixed: Returns recent submissions object if the username is valid and the API call succeeds, 
           or False if the username is invalid, the API call fails, or the API is down.
----------------------------------------------
Details:
- Calls an external API (currently down as of 3/11/24) to fetch recent submissions for the given username.
- Validates the username based on the API response status and the presence of errors in the response data.
- If valid, returns the recent submissions data; otherwise, returns False.
- Wrapped in a try-catch to handle and log any errors during the API call, defaulting to False in case of exceptions.
----------------------------------------------
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
populateNewUserHistory(userId, submissions)
----------------------------------------------
Integrates a user's LeetCode submission history into their profile on the platform.
----------------------------------------------
inputs:
    string: userId - The unique identifier of the user within the system.
    object: submissions - A collection of submission objects retrieved from the LeetCode API.
outputs:
    - None. Updates the user's history directly in the database.
----------------------------------------------
Details:
- Iterates over the provided submissions, matching each with a corresponding question in the local database.
- For each matching submission, records its completion status and timestamp into the user's history.
- This function is crucial for initializing or updating a user's problem-solving history after they update their LeetCode username.
- Currently non-operational due to an external API dependency being down as of 3/11/24.
----------------------------------------------
Note: This function ensures the user's history reflects their actual problem-solving journey on LeetCode, facilitating personalized problem recommendations and tracking progress.
----------------------------------------------
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
generateQuestions(userData, userProblems)
----------------------------------------------
Generates and assigns a new set of problems for the user, updating their profile with the recommendations.
----------------------------------------------
inputs:
    object: userData - Contains information about the user, such as ID and current problem recommendations.
    object: userProblems - The current set of problems associated with the user, including their statuses and completion history.
outputs:
    - None directly. Updates the user's profile with new problem recommendations through side effects.
----------------------------------------------
Details:
- Begins by flushing previously recommended but unattempted problems to keep recommendations fresh and relevant.
- Filters out the flushed problems from the local userProblems list to ensure accuracy in subsequent steps.
- Generates a new set of recommended problems based on the user's history and the outcomes of the flushing process.
- Each new recommendation is processed to determine if it is a repeat or a completely new challenge for the user.
- Adds these new recommendations to the user's profile, ensuring the user is presented with up-to-date and appropriate challenges.
- Designed to be invoked when a user requests new problems or upon new user creation, facilitating personalized learning paths.
----------------------------------------------
Note: This process integrates multiple steps of problem recommendation, from selection to user profile update, ensuring a dynamic and tailored problem-solving experience.
----------------------------------------------
*/
export async function generateQuestions(userData, userProblems) {
    /* Flush existing recommended problems */
    const userProblemsDeleted = await flushPreviousQuestions(userData, userProblems);
    /* update local userProblems */
    userProblems = userProblems.filter(up => !userProblemsDeleted.includes(up.__id));

    /* Generate 3 new rec problems */
    const selectedQuestions = generateProblems(userProblems, 3);

    /* Add UserProblem Entry (prepare it to be added to user) */
    const problems = []
    for (const question of selectedQuestions) {
        const isRepeat = !userProblemsDeleted.some(up => up.problemLink === question.link) && userProblems.some(up => up.problemLink === question.link)
        const status = isRepeat ? "Repeat" : "Not Complete";
        const problemId = await addUserProblemEntry(userData.__id, question, null, status, null);
        problems.push(problemId)
    }

    /* Once prepared, update User to see new problems */
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
fetchQuestions()
----------------------------------------------
Retrieves a list of coding problems.
----------------------------------------------
Inputs: None.
Outputs:
    Returns an array of problem objects loaded from a local JSON file.
----------------------------------------------
Details:
    This function is used to load the entire set of coding problems that users can be given as recommendations.
    Problems are predefined and stored in problems.json.
*/
function fetchQuestions() {
    return problemsJSON;
}

/*
deleteUP(userId)
----------------------------------------------
Deletes all UserProblems for a User
----------------------------------------------
deleteUP(userData.__id)
----------------------------------------------
*/
async function deleteUP(userId) {
    /* Search for User Problems */
    const userProblemsRef = collection(db, "userProblems");
    const q = query(userProblemsRef, where('__userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    /* Loop through the documents and delete them */
    const deletionPromises = [];
    querySnapshot.forEach((doc) => {
        /* Add the delete promise to an array */
      deletionPromises.push(deleteDoc(doc.ref));
    });
    
    /* Wait for all deletions to complete */
    await Promise.all(deletionPromises);
}


/*
----------------------------------------------------------------------------------------------------------------------------
BEGIN
FIREBASE FUNCTIONS
*/

/*
addUserProblemEntry(userId, question, timeStamp, status, timeDuration)
----------------------------------------------
Adds a user problem entry to Firebase.
----------------------------------------------
Inputs:
    userId (string): The unique identifier for the user.
    question (object): The problem object that the user attempted or is recommended.
    timeStamp (Timestamp): The timestamp of that we want to prepend.
    status (string): The status we want to prepend.
    timeDuration (date): The duration we want to prepend.
Outputs:
    Returns the document ID of the added or updated problem entry.
Details:
    Checks if an entry already exists for the given user and problem.
    If so, updates the existing entry with the new attempt details.
    If not, creates a new document in the userProblems collection in Firebase.
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


/*
flushPreviousQuestions(userData, userProblems)
----------------------------------------------
Flushes previously recommended but unattempted questions for a user.
----------------------------------------------
inputs:
    object: userData - Data containing user-specific information, including their recommended problem list.
    object: userProblems - A collection of problem objects associated with the user, detailing each problem's status and other metadata.
outputs:
    array: An array of deleted user problem objects that were recommended but not attempted by the user.
----------------------------------------------
Details:
- Iterates over the user's recommended problems.
- Checks if each problem was seen but not attempted by the user (i.e., `dateCompleted` is `null`).
- Deletes unattempted problems from the Firebase database.
- This function ensures the user's recommendation list remains fresh and relevant by removing old, unattempted recommendations before adding new ones.
- Essential for maintaining the quality of problem recommendations, aligning challenges with the user's current skill level and interests.
----------------------------------------------
*/
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


/*
updateUserRecommendedArray(userId, problems)
----------------------------------------------
Updates the recommended problems array for a user in the database.
----------------------------------------------
inputs:
    string: userId - The unique identifier for the user.
    array: problems - An array of problem IDs to set as the new list of recommended problems for the user.
outputs:
    - None. The function directly updates the user's document in the database with the new recommended problems.
----------------------------------------------
Details:
- This function is responsible for updating the list of recommended problems associated with a user in the Firebase database.
- It replaces the existing 'recommended' field in the user's document with the new array of problem IDs passed to the function.
- Essential for ensuring the user has access to the latest set of recommended problems tailored to their progress and preferences.
----------------------------------------------
*/
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


/*
weightedRandomSelect(problems, count, allProblems)
----------------------------------------------
Selects a specified number of problems randomly, weighted by their normalized weights.
----------------------------------------------
inputs:
    array: problems - An array of problem objects with a 'normalizedWeight' property for each.
    number: count - The number of problems to select.
    array: allProblems - The complete array of all problem objects from which the selection is made.
outputs:
    array: A subset of 'allProblems', randomly selected based on the weighted probability derived from 'problems'.
----------------------------------------------
Details:
- Utilizes a weighted random selection algorithm to pick a specified number of unique problems from the complete set.
- Each problem's chance of being selected is influenced by its 'normalizedWeight', ensuring a biased random selection that accounts for specified weights.
- Ensures that the same problem is not selected more than once in the output array.
- This function is crucial for generating problem sets that reflect a desired distribution, such as difficulty levels or problem types, based on dynamic user data or predefined criteria.
----------------------------------------------
*/
function weightedRandomSelect(problems, count, allProblems) {
    const selected = [];
    for (let i = 0; i < count; i++) {
        let sum = 0;
        const rand = Math.random();
        for (const problem of problems) {
            sum += problem.normalizedWeight;
            if (rand <= sum) {
                const fullProblem = allProblems.find(p => p.link === problem.link);
                if (fullProblem && !selected.includes(fullProblem)) { 
                    selected.push(fullProblem);
                    break;
                }
            }
        }
    }
    return selected;
}


/*
generateProblems(userProblems, count)
----------------------------------------------
Generates a new set of problems for the user, taking into account their past interactions and preferences.
----------------------------------------------
inputs:
    array: userProblems - A collection of problems the user has previously interacted with, including attempts and completions.
    number: count - The number of new problems to generate for the user.
outputs:
    array: A list of newly selected problem objects tailored to the user's skill level and problem-solving history.
----------------------------------------------
Details:
- This function generates a tailored set of problems for the user by analyzing their past problem interactions.
- For each problem in the database, it calculates a score based on whether the user has seen the problem before and their recent activity.
- Scores are converted to probabilities, which are then normalized to ensure they sum to 1, allowing for weighted random selection.
- Uses the `weightedRandomSelect` function to select problems based on these normalized probabilities, ensuring a personalized and varied problem set.
- The function dynamically adapts to the user's progress, focusing on areas where the user may need more practice or exposure to new topics.
----------------------------------------------
*/
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
        return { link: problem.link, probability };
    });

    // Normalize Probability
    const totalProb = probabilityProblems.reduce((acc, problem) => acc + problem.probability, 0);
    const normalizedProblems = probabilityProblems.map(problem => ({
        ...problem,
        normalizedWeight: totalProb > 0 ? problem.probability / totalProb : 0,
    }));

    // Perform weighted random selection
    const selectedProblems = weightedRandomSelect(normalizedProblems, count, problems);
    return selectedProblems;
}

/*
calculateProbability(score, k)
----------------------------------------------
Calculates the probability of selecting a problem based on its score.
----------------------------------------------
inputs:
    number: score - The calculated score for a problem, reflecting its relevance or difficulty level for the user.
    number: k - A scaling factor to adjust the steepness of the probability curve.
outputs:
    number: A probability value between 0 and 1, indicating the likelihood of selecting the problem.
----------------------------------------------
Details:
- This function applies the logistic function to transform a problem's score into a probability.
- The 'score' input reflects the problem's calculated relevance or suitability for the user, with higher scores indicating a greater need or suitability.
- The 'k' parameter allows adjustment of the curve's steepness, enabling fine-tuning of how score differences affect selection probability.
- The probability calculation ensures that problems with higher scores have a higher chance of being selected, but all problems remain possible choices.
- This method balances the need to focus on areas of importance with the chance of exploring a wider range of problems.
----------------------------------------------
*/
function calculateProbability(score, k) {
    return 1 / (1 + Math.exp(-k * (score - 1)));
}

/*
calculateScoreRepeat(userProblem)
----------------------------------------------
Calculates a score for a problem based on its recurrence in the user's problem-solving history, indicating its priority for repeat practice.
----------------------------------------------
inputs:
    object: userProblem - A specific problem object from the user's history, including dates of attempts and statuses.
outputs:
    number: A score ranging from 0.75 to 2, reflecting the problem's relevance based on its recency and frequency of attempts.
----------------------------------------------
Details:
- Evaluates the significance of a problem for the user by examining how recently and how frequently it has been attempted.
- 'recencyScore' contributes to the score by valuing problems attempted more recently, encouraging the reinforcement of recent learning.
- 'frequencyScore' acknowledges the need for repeated practice, increasing with the number of attempts, up to a cap, to balance between focusing on the same problems and exploring new challenges.
- The combined score, ranging from 0.75 to 2, determines the problem's priority for repetition. Scores closer to 2 indicate a higher priority for the problem to be revisited due to its recent and frequent attempts.
- This dynamic scoring mechanism ensures a tailored and adaptive learning path, promoting efficiency and effectiveness in problem-solving skills development.
----------------------------------------------
Note: The output score range is carefully designed to ensure a balanced emphasis on both recency and frequency, facilitating an optimized repetition schedule tailored to each user's unique problem-solving history.
----------------------------------------------
*/
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

/*
calculateScoreNew(problem, averageDifficulty, recentCategories)
----------------------------------------------
Calculates a suitability score for a new problem based on the user's recent problem-solving history.
----------------------------------------------
inputs:
    object: problem - Includes category and difficulty.
    number: averageDifficulty - User's recent average problem difficulty.
    array: recentCategories - Categories of recently attempted problems by the user.
outputs:
    number: Score (0.25 to 5) indicating the problem's suitability for recommendation.
----------------------------------------------
Details:
- Scores problems higher if they match the user's recent categories or closely align with their average difficulty level.
- Encourages reinforcing learning in familiar areas while providing challenges at a suitable difficulty.
- Aims for a balanced learning experience, adapting to user preferences and skill level.
----------------------------------------------
Note: The scoring range from 0.25 to 5 allows for nuanced differentiation among new problems, ensuring recommendations are both relevant and challenging.
----------------------------------------------
*/
function calculateScoreNew(problem, averageDifficulty, recentCategories) {
    let categoryScore = recentCategories.includes(problem.category) ? 1 : 0.25;
    let difficultyScore = Math.max(0.0, Math.min(4, 1 - Math.abs(difficultyToNum[problem.difficulty] - averageDifficulty)));
     // [.25, 5]
    return  categoryScore + difficultyScore;
}

/*
recentStatistics(userProblems, problems)
----------------------------------------------
Calculates the average difficulty and identifies the recent categories of problems the user has completed.
----------------------------------------------
inputs:
    array: userProblems - The user's problem-solving history.
    array: problems - The complete list of available problems.
outputs:
    array: Contains the average difficulty and a list of recent problem categories.
----------------------------------------------
Details:
- Analyzes the last 10 completed problems to determine the user's recent focus areas and difficulty level.
- Includes "fake" entries for users with fewer than 10 recent completions to standardize the dataset.
- Averages the difficulty levels and aggregates the categories of these problems.
- Provides insight into the user's recent activity, guiding personalized problem recommendations.
----------------------------------------------
Note: This function ensures that recommendations stay aligned with the user's current learning path and preferences, even with limited recent activity.
----------------------------------------------
*/
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