import { useState, useEffect } from 'react';

type Props = {
  interval?: number; // Number of millisecond interval
  counts?: number; // How many time to run
  callback?: false | any;
  onStop?: false | any;
};

const countsReached = (props: any): boolean => {
  const { counter, counts } = props;
  if (counts === 0) return false;
  return counter >= counts;
};

export default function useTimer(props: Props = {}) {
  const {
    interval = 1000,
    counts = 0,
    callback = false,
    onStop = false,
  } = props;
  const [counter, setCounter] = useState(0);
  const [timer, setTimer]: [number, any] = useState(0);
  const [nRun, setNRun] = useState(0);

  const stopTimer = () => {
    clearInterval(timer);
    if (onStop) onStop(counter);
  };

  const reset = () => {
    setCounter(() => 0);
    setNRun((curr) => curr + 1);
  };

  if (countsReached({ counter, counts })) stopTimer();

  useEffect(() => {
    const timerId = setInterval(() => {
      setCounter((prev) => {
        const current = prev + 1;
        if (callback) callback(current);
        return current;
      });
    }, interval);
    setTimer(() => timerId);

    return () => clearInterval(timerId);
  }, [nRun]);

  return [counter, {
    stopTimer,
    reset,
    timer,
  }] as const;
}
