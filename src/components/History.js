import React from "react";
import './History.css';
import Tag from "./Tag.js"

const categoryColors = {
    "Arrays & Hashing": "#d65a5a",
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
    "Easy": "#63c742",
    "Medium": "#e8932c",
    "Hard": "#D05B5B"
};

const History = ({ problems }) => {
    return (
        <div className="history-container">
            <h3>Submission History</h3>

            <div className="history-list-header">
                <div>Title</div>
                <div>Difficulty</div>
                <div>Category</div>
                <div>Date</div>
            </div>

            {problems.map((problem, index) => (
                <div key={index} className="problem-card">
                    <div><a href={problem.link} target="_blank">{problem.title}</a></div>
                    <Tag color={difficultyColors[problem.difficulty]} content={problem.difficulty} />
                    <Tag color={categoryColors[problem.category]} content={problem.category} />
                    <div>Date (placeholder)</div>
                </div>
            ))}
        </div>
    );
};

export default History;