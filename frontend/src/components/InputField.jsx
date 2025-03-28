import React from 'react';

const InputField = ({ type, placeholder, icon, value, onChange,disabled,id,label,error,style }) => {
  return (
    <div className="space-y-2 mb-4">
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-foreground"
      >
        {label}
      </label>
    <div className="relative">
    {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
      <input
        style={style}
        id={id}
        type={type}
        className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
    {error && (
        <p className="text-red-600 text-xs text-destructive animate-slide-down">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField
