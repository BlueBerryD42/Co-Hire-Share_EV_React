// src/components/shared/Label.tsx
import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label: React.FC<LabelProps> = ({ className, children, ...props }) => {
  return (
    <label
      className={`block text-sm font-medium text-neutral-700 mb-1 ${className || ''}`}
      {...props}
    >
      {children}
    </label>
  );
};

export default Label;
