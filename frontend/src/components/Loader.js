import React from 'react';

const Loader = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4', 
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`loader ${sizeClasses[size]} ${className}`}></div>
  );
};

export default Loader;