import React from 'react';

export default function ProgressBar({ 
  value = 0, 
  color = 'bg-brand', 
  className = '' 
}) {
  const clampedProgress = Math.min(100, Math.max(0, value));

  return (
    <div className={`h-2 rounded-[4px] bg-app-border w-full overflow-hidden ${className}`}>
      <div 
        className={`h-full ${color} transition-all duration-600 ease-in-out`}
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
}
