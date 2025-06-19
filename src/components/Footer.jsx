import { Link, useLocation } from "react-router-dom";
import { Home, Flame, Trophy, User, MessageCircle, Bell } from "lucide-react";
import { useEffect } from "react";
import { lookInSession } from "../common/session";
import { useState } from "react";

export default function FooterNav() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  const navItems = [
    { to: "/", icon: <Home className='w-6 h-6' />, label: "Home" },
    { to: "/streak", icon: <Flame className='w-6 h-6' />, label: "Streak" },
    {
      to: "/dashboard/leaderboard",
      icon: <Trophy className='w-6 h-6' />,
      label: "Ranks",
    },
    {
      to: "/messages",
      icon: <MessageCircle className='w-6 h-6' />,
      label: "Messages",
    },
    {
      to: "/dashboard/notifications",
      icon: <Bell className='w-6 h-6' />,
      label: "Notifications",
    },
    {
      to: user ?`/user/${user}` : "//",
      icon: <User className='w-6 h-6' />,
      label: "Profile",
    },
  ];

  useEffect(() => {
    const data = lookInSession("user");
    const parsedData = data ? JSON.parse(data) : null;
    setUser(parsedData?.username || null);
    console.log("User in session:", parsedData?.username);
    

  }, [location.pathname]);
  return (
    <footer className='fixed bottom-0  inset-x-0 z-50 bg-white  shadow-md md:hidden'>
      <nav className='flex justify-between items-center h-16 px-2'>
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center transition-colors duration-150 ${
              location.pathname === item.to
                ? "text-purple"
                : "text-dark-grey"
            }`}
          >
            {item.icon}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
