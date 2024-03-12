import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import reportWebVitals from './reportWebVitals';
import './index.css';

/* Custom Components Imports */
import App from './App';
import Profile from './pages/Profile';
import Home from './pages/Home';

/* AuthContext Imports */
import { AuthProvider } from './AuthContext';

/* Custom imports */
import NewIcon from "../src/extra/new.svg";
import CompleteIcon1 from '../src/extra/complete-1.svg'
import InCompleteIcon1 from "../src/extra/incomplete-1.svg"
import RepeatIcon from "../src/extra/repeat.svg";


/* Global Constants */

export const difficultyColors = {
  "Easy":  "#63c742",
  "Medium": "#e8932c",
  "Hard": "#D05B5B"
};

export const categoryColors = {
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

export const statusImages = {
  "Not Complete": NewIcon,
  "Complete": CompleteIcon1,
  "InComplete": InCompleteIcon1,
  "Repeat": RepeatIcon
};

export const statusOrder = ["Not Complete", "Repeat", "InComplete", "Complete"];

export const difficultyOrder = ["Easy", "Medium", "Hard"];

/* Router/Navigation Links */
const router = createBrowserRouter([
  {
    path: "",
    element: <App/>,
  },
  {
    path: "home",
    element: <Home/>,
  },
  {
    path: "profile",
    element: <Profile/>,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);

reportWebVitals();
