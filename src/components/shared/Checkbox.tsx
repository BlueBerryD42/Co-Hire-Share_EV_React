// src/components/shared/Checkbox.tsx
import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, className, ...props }) => {
  return (
    <div className={`flex items-center ${className || ''}`}>
      <input
        type="checkbox"
        className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
        {...props}
      />
      {label && (
        <label htmlFor={props.id} className="ml-2 block text-sm text-neutral-900">
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
