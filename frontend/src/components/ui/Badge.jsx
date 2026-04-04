import React from 'react';

export default function Badge({ 
  state = 'neutral', 
  icon,
  children, 
  className = '' 
}) {
  const states = {
    safe: "bg-brand-surface text-brand",
    warning: "bg-warn-surface text-[#854F0B]",
    risky: "bg-danger-surface text-[#993C1D]", 
    danger: "bg-[#FCEBEB] text-[#A32D2D]",
    neutral: "bg-[#F1EFE8] text-[#444441]"
  };

  return (
    <span className={`inline-flex items-center justify-center gap-[6px] px-[10px] py-1 rounded-full font-body font-medium text-[12px] ${states[state] || states.neutral} ${className}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
