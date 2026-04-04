import React from 'react';

export default function Card({ 
  variant = 'default', 
  stateColor = 'border-l-brand', // Only applicable for hero variant
  children, 
  className = '', 
  ...props 
}) {
  const baseStyles = "shadow-sm border";
  
  if (variant === 'hero') {
    return (
      <div 
        className={`bg-app-card ${baseStyles} border-app-border rounded-[16px] p-7 border-l-4 ${stateColor} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (variant === 'warning') {
    return (
      <div 
        className={`bg-warn-surface ${baseStyles} border-warn rounded-[12px] p-5 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (variant === 'danger') {
    return (
      <div 
        className={`bg-danger-surface ${baseStyles} border-danger rounded-[12px] p-5 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }

  // default variant
  return (
    <div 
      className={`bg-app-card ${baseStyles} border-app-border rounded-[12px] p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
