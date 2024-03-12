import functions from "./functions";
import { calculateScoreNew } from "./functions";
import { recentStatistics } from "./functions";
import { fetchQuestions } from "./functions";
import { calculateScoreRepeat } from "./functions";
import { calculateProbability } from "./functions";
import { weightedRandomSelect } from "./functions";

describe(functions, () => {
    it("test that testing environment is working", () => {
        expect(1).toBe(1);
    });
});

test("calculateScoreNew", () => {
    const problem = {
        category: 'Math',
        difficulty: 'Easy',
    };
    const averageDifficulty = 2;
    const recentCategories = ['Science', 'History'];
    expect(calculateScoreNew(problem, averageDifficulty, recentCategories)).toBeCloseTo(0.25)
});

test('recent Statistics should return an array with two elements', () => {
    const userProblems = [
        // Mock Data for User Problems
        { status: ["Completed"], dateCompleted: [{ toDate: () => new Date() }], problemLink: "some-link" }
    ];

    const problems = [
        // Mock Data for Problems
        { link: "some-link", difficulty: "Medium", category: "Math" }
        // You may need to add more entries to match your function's logic
    ];

    //fill in random categories
    global.categories = ["Math", "Science", "English", "History", "Geography", "Art", "Music"];
    global.difficultyToNum = { "Easy": 1, "Medium": 2, "Hard": 3 };

    const result = recentStatistics(userProblems, problems);

    // Check that the result is an array
    expect(Array.isArray(result)).toBe(true);
    // Check that the result has exactly two elements
    expect(result.length).toBe(2);
    // Check that the second element of the result is also an array
    expect(Array.isArray(result[1])).toBe(true);
    // Optionally, check that the first element is a number (representing average difficulty)
    expect(typeof result[0]).toBe('number');
});

//mock the environment problems.json file
jest.mock('./problems.json', () => ({
    question1: "What is 2 + 2?",
    question2: "Where is Santa Cruz?"
}), { virtual: true });


describe('fetchQuestions based off of mock data', () => {
    it('should return the mocked problems JSON', () => {
        const expected = {
            question1: "What is 2 + 2?",
            question2: "Where is Santa Cruz?"
        };
        const questions = fetchQuestions();
        expect(questions).toEqual(expected);
    });

});

describe('calculateScoreRepeat', () => {
    // Mocking current date
    const baseTime = new Date('2023-01-01T12:00:00');
    jest.useFakeTimers().setSystemTime(baseTime);

    it('should return a higher score for a recently attempted problem', () => {
        const userProblem = {
            dateCompleted: [new Date('2022-12-31T12:00:00').toISOString()], // 1 day ago
            status: ["Complete"],
        };
        const score = calculateScoreRepeat(userProblem);
        expect(score).toBeGreaterThan(1); // Expecting a score higher due to recent completion
    });

    it('should return a lower score for a problem attempted a long time ago', () => {
        const userProblem = {
            dateCompleted: [new Date('2022-11-01T12:00:00').toISOString()], // ~60 days ago
            status: ["Complete"],
        };
        const score = calculateScoreRepeat(userProblem);
        expect(score).toBeLessThan(1.5); // Expecting a lower score due to the time elapsed
    });

});

test("test calculateProbability ensure that it is working", () => {
    //test one value to make sure math function is working probability
    expect(calculateProbability(0.8, 4)).toBeCloseTo(0.31)
})

describe('weightedRandomSelect', () => {
    // Mock problems and allProblems arrays for testing
    const problems = [
        { link: 'problem1', normalizedWeight: 0.2 },
        { link: 'problem2', normalizedWeight: 0.3 },
        { link: 'problem3', normalizedWeight: 0.5 },
    ];
    const allProblems = [
        { link: 'problem1', name: 'Problem 1' },
        { link: 'problem2', name: 'Problem 2' },
        { link: 'problem3', name: 'Problem 3' },
    ];

    beforeEach(() => {
        // Reset Math.random mock before each test
        jest.spyOn(Math, 'random').mockRestore();
    });

    it('should return the correct number of selected problems', () => {
        // Mock Math.random 
        jest.spyOn(Math, 'random').mockReturnValue(0.1);
        const selected = weightedRandomSelect(problems, 2, allProblems);
        //should return count problems
        expect(selected.length).toBe(2);
    });

    it('should not return duplicate problems', () => {
        // Mock Math.random
        jest.spyOn(Math, 'random').mockReturnValue(0.1);
        const selected = weightedRandomSelect(problems, 3, allProblems);
        //use set to check for duplicates
        const uniqueSelected = new Set(selected.map(problem => problem.link));
        expect(selected.length).toBe(uniqueSelected.size);
    });
});