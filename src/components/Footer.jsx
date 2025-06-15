import { Link, useLocation } from 'react-router-dom';
import { Home, Flame, Trophy, User, MessageCircle, Bell } from 'lucide-react';

export default function FooterNav() {
  const location = useLocation();

  const navItems = [
    { to: '/', icon: <Home className='w-6 h-6' />, label: 'Home' },
    { to: '/streak', icon: <Flame className='w-6 h-6' />, label: 'Streak' },
    { to: '/leaderboard', icon: <Trophy className='w-6 h-6' />, label: 'Ranks' },
    { to: '/messages', icon: <MessageCircle className='w-6 h-6' />, label: 'Messages' },
    { to: '/notifications', icon: <Bell className='w-6 h-6' />, label: 'Notifications' },
    { to: '/profile', icon: <User className='w-6 h-6' />, label: 'Profile' },
  ];

  return (
    <footer className='fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-dark-grey border-t border-gray-200 dark:border-gray-700 shadow-md md:hidden'>
      <nav className='flex justify-between items-center h-16 px-2'>
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center transition-colors duration-150 ${
              location.pathname === item.to
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            {item.icon}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
