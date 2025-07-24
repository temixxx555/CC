"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const SocialCircle = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeUntilFriday, setTimeUntilFriday] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Check if current time is between Friday evening (6 PM) and Sunday evening (11:59 PM)
  const isAnonymousMessageAvailable = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
    const hour = now.getHours();

    // Friday evening (after 6 PM) to Sunday evening (before midnight)
    if (dayOfWeek === 5 && hour >= 18) return true; // Friday 6 PM onwards
    if (dayOfWeek === 6) return true; // All day Saturday
    if (dayOfWeek === 0) return true; // All day Sunday

    return false;
  };

  // Calculate time until next Friday 6 PM
  const calculateTimeUntilFriday = () => {
    const now = new Date();
    const nextFriday = new Date();

    // Find next Friday
    const daysUntilFriday = (5 - now.getDay() + 7) % 7;
    if (daysUntilFriday === 0 && (now.getDay() !== 5 || now.getHours() < 18)) {
      // If today is Friday but before 6 PM, target today at 6 PM
      nextFriday.setHours(18, 0, 0, 0);
    } else if (daysUntilFriday === 0) {
      // If today is Friday after 6 PM, target next Friday
      nextFriday.setDate(now.getDate() + 7);
      nextFriday.setHours(18, 0, 0, 0);
    } else {
      // Target upcoming Friday
      nextFriday.setDate(now.getDate() + daysUntilFriday);
      nextFriday.setHours(18, 0, 0, 0);
    }

    const timeDiff = nextFriday.getTime() - now.getTime();

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  // Update countdown every second
  useEffect(() => {
    if (!isAnonymousMessageAvailable()) {
      setTimeUntilFriday(calculateTimeUntilFriday());
    }
  }, [currentTime]);

  const CountdownDisplay = () => (
    <div className='text-center py-2'>
      <p className='text-sm text-gray-600 mb-2'>
        Available every Friday 6 PM - Sunday 11:59 PM
      </p>
      <div className='flex justify-center gap-2 text-sm font-mono'>
        <div className='bg-gray-100 px-2 py-1 rounded'>
          <span className='font-bold text-pink-500'>
            {timeUntilFriday.days}
          </span>
          <div className='text-xs text-gray-500'>days</div>
        </div>
        <div className='bg-gray-100 px-2 py-1 rounded'>
          <span className='font-bold text-pink-500'>
            {timeUntilFriday.hours}
          </span>
          <div className='text-xs text-gray-500'>hours</div>
        </div>
        <div className='bg-gray-100 px-2 py-1 rounded'>
          <span className='font-bold text-pink-500'>
            {timeUntilFriday.minutes}
          </span>
          <div className='text-xs text-gray-500'>min</div>
        </div>
        <div className='bg-gray-100 px-2 py-1 rounded'>
          <span className='font-bold text-pink-500'>
            {timeUntilFriday.seconds}
          </span>
          <div className='text-xs text-gray-500'>sec</div>
        </div>
      </div>
    </div>
  );

  const features = [
    {
      icon: <i className='fi fi-rr-camera text-2xl text-pink-500' />,
      title: "Face of the Week 👑",
      description: "Are you the main character or just background noise? Post and find out.",
      link: "/ranking",
    },
    {
      icon: <i className='fi fi-rr-comment-alt text-2xl text-blue-600' />,
      title: "Anonymous Message",
      link: isAnonymousMessageAvailable()
        ? "/dashboard/anonymous-message"
        : null,
      description: isAnonymousMessageAvailable()
        ? "Campus Tea, No IDs. Spill, share, or stir — it's all anonymous."
        : "Available Friday 6 PM - Sunday 11:59 PM",
      isAvailable: isAnonymousMessageAvailable(),
    },
  ];

  return (
    <div className='p-4 max-w-full mx-auto'>
      <h1 className='text-2xl font-bold mb-6 text-center'>Social Circle</h1>
      <div className='space-y-4'>
        {features.map((feature, index) => (
          <Link to={feature.link} key={index}>
            <div
              key={index}
              className={`flex items-start gap-4 bg-white shadow-md p-4 rounded-xl mb-[10px] transition-transform ${
                feature.link
                  ? "hover:scale-105 hover:shadow-xl cursor-pointer"
                  : "opacity-75 cursor-not-allowed"
              }`}
            >
              <div className='mt-1'>{feature.icon}</div>
              <div className='flex-1'>
                <h2 className='text-lg font-semibold'>{feature.title}</h2>
                <p className='text-sm text-dark-grey'>{feature.description}</p>
                {feature.title === "Anonymous Message" &&
                  !feature.isAvailable && <CountdownDisplay />}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SocialCircle;
