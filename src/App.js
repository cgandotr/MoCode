import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

/* Custom Components Imports */
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Contact from './components/Contact';
import QandA from './components/QandA';

/* MUI Library Imports */
import Button from '@mui/lab/LoadingButton';

/*
App
------------------------------------
Main page for our website
Displays some Graphics, FAQs, and a Contact Us
------------------------------------
*/
function App() {
  /*
  States for Code Box
  */
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  /* Texts to display */
  const texts = ["jobOffer;", "happiness;", "salaryRaise;"];

  /*
    Navigate Initialization
  */
  let navigate = useNavigate();

  /*
  redirectToPage()
  ------------------------------------
  Function that redirects user to Home Page
  ------------------------------------
  */
  const redirectToPage = () => {
    navigate('/home');
  };

  /*
  useEffect()
  ------------------------------------
  Here we work on getting the text for our code box

  Typing effect that circles around an array of texts
  For styling purposes
  ------------------------------------
  */
  useEffect(() => {
    const timeout = setTimeout(() => {
      /* Current Text */
      const currentText = texts[textIndex];
      let updatedText = currentText;

      /* Update Text based on Deleting or not */
      if (isDeleting) {
        updatedText = currentText.substring(0, charIndex - 1);
        setCharIndex(charIndex - 1);
      }
      else {
        updatedText = currentText.substring(0, charIndex + 1);
        setCharIndex(charIndex + 1);
      }
      setText(updatedText);

      if (!isDeleting && updatedText === currentText) {
        /* Switch to deleting after a pause */
        setTimeout(() => setIsDeleting(true), 1500); /* Pause before deleting */
      }
      else if (isDeleting && updatedText === '') {
        setIsDeleting(false);
        setTextIndex((textIndex + 1) % texts.length); /* Move to the next text */
        setCharIndex(0); /* Reset character index */
      }
    }, isDeleting ? 100 : 100); /* Speed of typing and deleting */
    return () => clearTimeout(timeout);
  }, [text, isDeleting, textIndex, charIndex, texts]);

  
  return (
    <div className="App">
      <NavBar></NavBar>
      <div id="app-content">
        <div className="intro">          
          <div className="code-box">
            <code>
              if (MoCode) &#123;<br></br><span id="animatedText">&nbsp;&nbsp;return {text}</span><br></br>&#125;
            </code>
          </div>
          <div id="header">
              <h1 id="head">The Best Way to Code</h1>
              <h2 id="liner">Programming Questions tailored just for you!</h2>
              <Button id="get-started-btn" size="small" onClick={redirectToPage}>Get Started</Button>
          </div>
        </div>
        <QandA></QandA>
        <Contact></Contact>
      </div>
      <Footer></Footer>
    </div>
  );
}

export default App;
