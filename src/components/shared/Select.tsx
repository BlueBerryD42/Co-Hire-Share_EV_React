// src/components/shared/Select.tsx
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select: React.FC<SelectProps> = ({ className, children, ...props }) => {
  return (
    <select
      className={`block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${className || ''}`}
      {...props}
    >
      {children}
    </select>
  );
};

export default Select;
