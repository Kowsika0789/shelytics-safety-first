import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map, User, Shield, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/map', icon: Map, label: 'Map' },
  { path: '/safety', icon: Shield, label: 'Safety' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const BottomNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card/80 backdrop-blur-xl border-t border-border px-4 pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center gap-1 p-2 min-w-[64px]"
            >
              <motion.div
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  isActive ? "bg-primary/10" : "bg-transparent"
                )}
                whileTap={{ scale: 0.9 }}
              >
                <Icon
                  className={cn(
                    "w-6 h-6 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </motion.div>
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  layoutId="activeNav"
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
