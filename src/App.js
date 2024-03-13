import React, { useState, useEffect } from 'react';

import './App.css';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Contact from './components/Contact';
import QandA from './components/QandA';
import Button from '@mui/lab/LoadingButton';
import { useNavigate } from 'react-router-dom';


function App() {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const texts = ["jobOffer;", "happiness;", "salaryRaise;"];

  let navigate = useNavigate();

  const redirectToPage = () => {
    navigate('/home'); // Replace '/yourTargetPath' with the path you want to navigate to
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentText = texts[textIndex];
      let updatedText = currentText;

      if (isDeleting) {
        updatedText = currentText.substring(0, charIndex - 1);
        setCharIndex(charIndex - 1);
      } else {
        updatedText = currentText.substring(0, charIndex + 1);
        setCharIndex(charIndex + 1);
      }

      setText(updatedText);

      if (!isDeleting && updatedText === currentText) {
        // Switch to deleting after a pause
        setTimeout(() => setIsDeleting(true), 1500); // Pause before deleting
      } else if (isDeleting && updatedText === '') {
        setIsDeleting(false);
        setTextIndex((textIndex + 1) % texts.length); // Move to the next text
        setCharIndex(0); // Reset character index

      }
    }, isDeleting ? 100 : 100); // Speed of typing and deleting

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
              <Button id="get-started-btn"
                              size="small" onClick={redirectToPage}>
                                Get Started

                              </Button>
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
