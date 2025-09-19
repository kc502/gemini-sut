import React, { useState, useRef, useEffect } from 'react';

interface CustomDropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full max-w-xs mx-auto" ref={dropdownRef}>
      <label htmlFor={label.replace(/\s+/g, '-').toLowerCase()} className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <button
        id={label.replace(/\s+/g, '-').toLowerCase()}
        type="button"
        onClick={handleToggle}
        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2.5 text-white text-left flex justify-between items-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate pr-2">{value}</span>
        <svg className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {options.map((option) => (
            <div
              key={option}
              onClick={() => handleSelect(option)}
              className={`p-2.5 text-sm cursor-pointer hover:bg-indigo-600 hover:text-white transition-colors ${option === value ? 'bg-indigo-700 text-white' : 'text-gray-300'}`}
              role="option"
              aria-selected={option === value}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;