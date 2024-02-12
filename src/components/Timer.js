import React, { useState, useEffect } from 'react';
import './Timer.css';
import Pin from "../extra/pin.svg"
import CloseIcon1 from "../extra/close-1.svg"
import CloseIcon2 from "../extra/close-2.svg"
import PauseIcon from "../extra/pause.svg"
import PlayIcon from "../extra/play.svg"

function Timer({ isRunning, problemId, problemName, resetTimerEmit, updateTimerTimeEmit, startTimerEmit, pauseTimerEmit}) {
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const [closeBtn, setcloseBtn] = useState(CloseIcon2);
  const [isCloseClicked, setIsCloseClicked] = useState(false);

  const [startPauseBtn, setstartPauseBtn] = useState(PlayIcon)
  

  let interval;
  // Inside Timer component's useEffect that updates time
useEffect(() => {
  let interval;
  if (isRunning && problemId) {
      setstartPauseBtn(PauseIcon)
      interval = setInterval(() => {
          setTime(prevTime => {
              const newTime = prevTime + 1;
              updateTimerTimeEmit(newTime); // Update time in Home component
              return newTime;
          });
      }, 1000);
  }
  return () => clearInterval(interval);
}, [isRunning, problemId, updateTimerTimeEmit]); // Include updateTimerTime in dependency array


  useEffect(() => {
    if (!isRunning) {
      setTimerActive(false);
      clearInterval(interval);
      setstartPauseBtn(PlayIcon)
    }
  }, [isRunning]);

  useEffect(() => {
    if (!problemId) {
      setTime(0);
      setTimerActive(false);
    }
  }, [problemId]);

  const formatTime = () => {
    const getSeconds = `0${time % 60}`.slice(-2);
    const minutes = `${Math.floor(time / 60)}`;
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(time / 3600)}`.slice(-2);

    return `${getHours}:${getMinutes}:${getSeconds}`;
  };


  const handleCloseClick = () => {
    setTime(0);
    setTimerActive(false);
    resetTimerEmit(null, true); // Indicating the reset call is from Timer

  };

  const handleStartPauseClick = () => {
    if (problemId) {

    
        if (startPauseBtn == PlayIcon) {
          startTimerEmit(problemId, problemName)
          // setstartPauseBtn(PauseIcon)
        }
        else {
          pauseTimerEmit(problemId)
            setstartPauseBtn(PlayIcon)
        }
    }

};


  const handleCloseHoverEnter = () => {
        
        setcloseBtn(CloseIcon1);
};

const handleCloseHoverLeave= () => {
        setcloseBtn(CloseIcon2);
    
};


  return (
    <div className='timer'>
    
        <div id="cur-problem">
          <img id="pin"src={Pin}></img>
          <h2 id="problem">{problemName ? problemName : "None"}</h2>
        </div>
        <div id="time">{formatTime()}</div>
        <div id="all-buttons">
          <img
            id="start-pause-button"
            onClick={handleStartPauseClick}
            src={startPauseBtn}
        />
        <img
            id="close-button"
            src={closeBtn}
            onMouseEnter={handleCloseHoverEnter} 
            onMouseLeave={handleCloseHoverLeave} 
            onClick={handleCloseClick} 
          />
      </div>
      
      
    </div>
  );
}

export default Timer;
