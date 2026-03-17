'use client';

import type { PriceLevel } from '@/types/database';

interface PriceSelectorProps {
  value: PriceLevel;
  onChange: (value: PriceLevel) => void;
  label?: string;
}

const LEVELS: { value: PriceLevel; label: string }[] = [
  { value: '1', label: '£' },
  { value: '2', label: '££' },
  { value: '3', label: '£££' },
  { value: '4', label: '££££' },
];

export default function PriceSelector({ value, onChange, label }: PriceSelectorProps) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="flex gap-2">
        {LEVELS.map((level) => (
          <button
            key={level.value}
            type="button"
            onClick={() => onChange(level.value)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${value === level.value
                ? 'bg-forest text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-forest/30'
              }`}
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
}
