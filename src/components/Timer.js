import React, { useState, useEffect } from 'react';
import './Timer.css';

/* Custom imports */
import Pin from "../extra/pin.svg"
import CloseIcon1 from "../extra/close-1.svg"
import CloseIcon2 from "../extra/close-2.svg"
import PauseIcon from "../extra/pause.svg"
import PlayIcon from "../extra/play.svg"


/*
Timer
------------------------------------
Timer Component for Playing Problems
Used in 'Home' Component
------------------------------------
inputs:
  isRunning (input that indicates timer should be running)
  problemid (the id of the userProblem that is sending actions to timer)
  problemName (the name of the problem that is sending actions to timer)
    

outputs:
  resetTimerEmit(id, true) (emits reset action from timer (true indicates from timer); takes in userProblem.__id)
  updateTimerTimeEmit(int) (emits updated time) (time in seconds)
  startTimerEmit(id, title) (emits start action from timer; takes in userProblem.__id, problem.title)
  pauseTimerEmit(id) (emits pause action from timer; takes in userProblem.__id)
*/
function Timer({ isRunning, problemId, problemName, resetTimerEmit, updateTimerTimeEmit, startTimerEmit, pauseTimerEmit}) {
  /*
  States for Time
  */
  const [time, setTime] = useState(0);

  /*
  State for Start/Pause Button
  ------------------------------------
  Image State
  */
  const [startPauseBtn, setstartPauseBtn] = useState(PlayIcon)

  /*
  State for Close Button
  ------------------------------------
  Image State
  */
  const [closeBtn, setcloseBtn] = useState(CloseIcon2);


  let interval;
  /*
  useEffect()
  ------------------------------------
  Here we update the Timer every second
  We only run if external source is telling us to
    and we have a problem that initiated the action
  ------------------------------------
  */
  useEffect(() => {
    if (isRunning && problemId) {
        setstartPauseBtn(PauseIcon)
        interval = setInterval(() => {
            setTime(prevTime => {
                const newTime = prevTime + 1;
                updateTimerTimeEmit(newTime);
                return newTime;
            });
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, problemId, updateTimerTimeEmit]);

  /*
  useEffect()
  ------------------------------------
  Here we clear the interval and reset out button if paused
  ------------------------------------
  */
  useEffect(() => {
    if (!isRunning) {
      clearInterval(interval);
      setstartPauseBtn(PlayIcon)
    }
  }, [isRunning]);

  /*
  useEffect()
  ------------------------------------
  Here we clear the timer if we are no longer being controlled
  ------------------------------------
  */
  useEffect(() => {
    if (!problemId) {
      setTime(0);
    }
  }, [problemId]);

  /*
  formatTime()
  ------------------------------------
  Function that formates the time for display
  Note time is in seconds
  ------------------------------------
  */
  const formatTime = () => {
    const getSeconds = `0${time % 60}`.slice(-2);
    const minutes = `${Math.floor(time / 60)}`;
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(time / 3600)}`.slice(-2);

    return `${getHours}:${getMinutes}:${getSeconds}`;
  };

  /*
  handleCloseClick()
  ------------------------------------
  Function that handles closing the timer
  ------------------------------------
  */
  const handleCloseClick = () => {
    setTime(0);
    /* Indicating the reset call is from Timer */
    resetTimerEmit(null, true);
  };

  /*
 handleStartPauseClick()
  ------------------------------------
  Function that handles start/pause button from timer
  We only want to start/play if we are currently being controlled 
  ------------------------------------
  */
  const handleStartPauseClick = () => {
    if (problemId) {
      if (startPauseBtn == PlayIcon) {
        startTimerEmit(problemId, problemName)
      }
      else {
        pauseTimerEmit(problemId)
        setstartPauseBtn(PlayIcon)
      }
    }
};

  /*
  handleCloseHoverEnter()
  handleCloseHoverLeave=()
  ------------------------------------
  Function that handles hovering over Close Icon
  Basically update the image for styling purposes
  ------------------------------------
  */
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
          <img id="start-pause-button" onClick={handleStartPauseClick} src={startPauseBtn}/>
          <img id="close-button" src={closeBtn} onMouseEnter={handleCloseHoverEnter} onMouseLeave={handleCloseHoverLeave} onClick={handleCloseClick} />
        </div>
    </div>
  );
}

export default Timer;
