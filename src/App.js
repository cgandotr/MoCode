import React, { useState, useEffect } from 'react';

import './App.css';
import NavBar from '../src/components/NavBar';
import Footer from '../src/components/Footer';
import SignIn from '../src//components/SignIn'

function App() {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const texts = ["jobOffer;", "happiness;", "salaryRaise;", "passCSE115A;"];

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
      <div className="intro">
        <div id="left">
          <h1 id="logo">MoCode</h1>
          <h2 id="liner">Get Your Offer Letter!</h2>
        </div>
        <div class="code-box">
    <code>
        if (MoCode) &#123;<br></br><span id="animatedText">&nbsp;&nbsp;return {text}</span><br></br>&#125;
    </code>
</div>


      </div>
      <SignIn></SignIn>
      <Footer></Footer>
    </div>
  );
}

export default App;
