import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '', 
  ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 focus:ring-indigo-500",
    secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 focus:ring-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 dark:border-gray-700 dark:focus:ring-gray-500",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-white dark:focus:ring-gray-500",
    icon: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2 rounded-full"
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3"
  };

  const finalClass = `${baseStyle} ${variants[variant]} ${variant !== 'icon' ? sizes[size] : ''} ${className}`;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={finalClass}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;