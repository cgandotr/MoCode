import React, { useEffect, useState } from 'react';
import './Timer.css';

function Timer({ isRunning, actionId, onAction }) {
  const [time, setTime] = useState(0);
  const [currentId, setCurrentId] = useState(null); // Store the ID that started the timer
  
  useEffect(() => {
    let interval = null;

    if (isRunning && (currentId === null || currentId === actionId)) {
      // Start or continue the timer if no ID has started the timer or if the action comes from the same ID
      if (currentId === null) {
        setCurrentId(actionId); // Set the ID that started the timer
        onAction && onAction('started', actionId); // Optional callback for when the timer is started
      }
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1); // Increment time every second
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRunning, actionId, currentId, onAction]);

  useEffect(() => {
    // Reset the timer and currentId when isRunning is false and a reset is triggered
    if (!isRunning && actionId !== currentId) {
      setTime(0);
      setCurrentId(null); // Clear the ID, allowing a new ID to control the timer
      onAction && onAction('reset', actionId); // Optional callback for when the timer is reset
    }
  }, [isRunning, actionId]);

  const formatTime = () => {
    const getSeconds = `0${time % 60}`.slice(-2);
    const minutes = `${Math.floor(time / 60)}`;
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(time / 3600)}`.slice(-2);

    return `${getHours}:${getMinutes}:${getSeconds}`;
  };

  return (
    <div className='timer'>
      <div id="time">{formatTime()}</div>
    </div>
  );
}

export default Timer;
