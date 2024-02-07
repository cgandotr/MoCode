import React, { useEffect, useState } from 'react';
import './Timer.css';

function Timer({ isRunning }) {
  const [time, setTime] = useState(0);
  const [reset, setreset] = useState(true);
  
  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1); // Increment time every second
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = () => {
    const getSeconds = `0${time % 60}`.slice(-2);
    const minutes = `${Math.floor(time / 60)}`;
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(time / 3600)}`.slice(-2);

    return `${getHours}:${getMinutes}:${getSeconds}`;
  };

  return (
    <div className='timer'>
      {formatTime()}
    </div>
  );
}

export default Timer;
