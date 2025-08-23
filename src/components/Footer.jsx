import { Link, useLocation } from "react-router-dom";
import { Home, Flame, Trophy, User, MessageCircle, Bell } from "lucide-react";
import { useEffect } from "react";
import { lookInSession } from "../common/session";
import { useState } from "react";
import { useContext } from "react";
import { userContext } from "../App";

export default function FooterNav() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const { userAuth, setUserAuth } = useContext(userContext);
  const { new_notification_available,hasUnread } = userAuth || {};


  const navItems = [
    { to: "/", icon: <Home className='w-6 h-6' />, label: "Home" },
    { to: "/dashboard/social-circle", icon: <Flame className='w-6 h-6' />, label: "Streak" },
    {
      to: "/dashboard/leaderboard",
      icon: <Trophy className='w-6 h-6' />,
      label: "Ranks",
    },
    {
      to: user ? "/messages" : "",
      icon:(
        <div className='relative'>
          <MessageCircle className='w-6 h-6' />
          {hasUnread && (
            <span className='bg-red w-3 h-3 rounded-full absolute z-10 top-0 left-3'></span>
          )}
        </div>
      ),
      label: "Messages",
    },
    {
      to: user ? "/dashboard/notifications" : "/signup",
      icon: (
        <div className='relative'>
          <Bell className='w-6 h-6' />
          {new_notification_available && (
            <span className='bg-red w-3 h-3 rounded-full absolute z-10 top-0 left-3'></span>
          )}
        </div>
      ),
      label: "Notifications",
    },
    {
      to: user ? `/user/${user}` : "/signin",
      icon: <User className='w-6 h-6' />,
      label: "Profile",
    },
  ];

  useEffect(() => {
    const data = lookInSession("user");
    const parsedData = data ? JSON.parse(data) : null;
    setUser(parsedData?.username || null);
    // console.log("User in session:", parsedData?.username);
  }, [location.pathname]);
  return (
    <footer className='fixed bottom-0  inset-x-0 z-50 bg-white  shadow-md md:hidden'>
      <nav className='flex justify-between items-center h-16 px-2'>
        {navItems.map((item,i) => (
          <Link
            key={i}
            to={item.to}
            className={`flex flex-col items-center justify-center transition-colors duration-150 ${
              location.pathname === item.to ? "text-purple" : "text-dark-grey"
            }`}
          >
            {item.icon}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
