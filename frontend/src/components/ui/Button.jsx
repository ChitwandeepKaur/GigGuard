import React from 'react';

export default function Button({ 
  variant = 'primary', 
  children, 
  className = '', 
  ...props 
}) {
  const baseStyles = "font-body font-medium text-[15px] rounded-[8px] transition-colors duration-200 inline-flex items-center justify-center cursor-pointer";
  
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-light px-6 py-3",
    secondary: "bg-transparent border-[1.5px] border-brand text-brand hover:bg-brand-surface px-[23px] py-[11px]",
    danger: "bg-danger text-white hover:opacity-90 px-6 py-3"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
