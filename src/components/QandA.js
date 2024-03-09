import React from "react";
import './QandA.css';

function QandA() {
    const questions = [
        {
            'question': 'What is MoCode?',
            'answer': "MoCode is a specialized app for software developers to enhance their technical interview skills through personalized LeetCode recommendations."
        },
        {
            'question': 'How does MoCode personalize question recommendations?',
            'answer': "MoCode's algorithm personalizes recommendations by employing spaced repetition for review questions, and for new challenges, it selects based on your favorite topics and difficulty level."
        },
        {
            'question': 'How does MoCode help users prepare for technical interviews?',
            'answer': "MoCode curates questions from popular technical interviews, offering insights through statistics to track and foster your growth effectively."
        },
    ];

    return (
        <div className="QandA">
            <h3 id="FAQ">FAQ</h3>
            {questions.map((item, index) => (
                <div id="QandA-item" key={index}>
                    <h3 id="Q">{item.question}</h3>
                    <h4 id="A">{item.answer}</h4>
                </div>
            ))}
        </div>
    );
}

export default QandA;
