import { useCallback, useEffect, useState } from 'react';

export default function Countdown({ timeStamp }) {
  const calculateTimeLeft = useCallback(() => {
    if (!timeStamp) {
      return undefined;
    }
    const difference = timeStamp - +new Date();
    let timeLeft = undefined;

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  }, [timeStamp]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const intervalRef = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(intervalRef);
  }, [setTimeLeft, calculateTimeLeft]);

  var daysString = `${timeLeft.days.toLocaleString('en-US', {
    minimumIntegerDigits: 1,
    useGrouping: false,
  })}d`;

  var hoursString = `${timeLeft.hours.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  })}`;

  var minutesString = `${timeLeft.minutes.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  })}`;

  var secondsString = `${timeLeft.seconds.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  })}`;

  var countdown = `${daysString} ${hoursString}:${minutesString}:${secondsString}`;

  return countdown;
}
