'use client';

import { useState, useRef, useEffect } from 'react';

// Common UK cities + popular international — extensible
const CITIES = [
  'London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool',
  'Bristol', 'Edinburgh', 'Glasgow', 'Cardiff', 'Belfast',
  'Newcastle', 'Nottingham', 'Sheffield', 'Brighton', 'Oxford',
  'Cambridge', 'Bath', 'York', 'Norwich', 'Southampton',
  'Reading', 'Exeter', 'Aberdeen', 'Dundee', 'Swansea',
  'Paris', 'Barcelona', 'Rome', 'Amsterdam', 'Berlin',
  'Lisbon', 'Madrid', 'Prague', 'Vienna', 'Budapest',
  'New York', 'Los Angeles', 'San Francisco', 'Tokyo', 'Bangkok',
  'Dubai', 'Singapore', 'Hong Kong', 'Sydney', 'Melbourne',
];

interface CitySearchProps {
  value: string;
  onChange: (city: string) => void;
  label?: string;
}

export default function CitySearch({ value, onChange, label }: CitySearchProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = query.length > 0
    ? CITIES.filter((c) => c.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city: string) => {
    setQuery(city);
    onChange(city);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="label">
          {label}
          <span className="text-red-400 ml-0.5">*</span>
        </label>
      )}
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Type a city..."
        className="input-field"
        required
      />

      {isOpen && filtered.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 max-h-48 overflow-y-auto">
          {filtered.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => handleSelect(city)}
              className="w-full text-left px-4 py-2.5 hover:bg-forest-50 transition-colors text-sm first:rounded-t-xl last:rounded-b-xl"
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
