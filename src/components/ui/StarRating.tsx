'use client';

import { useState, useCallback } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  label?: string;
}

const SIZES = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-9 h-9',
};

export default function StarRating({
  value,
  onChange,
  size = 'md',
  readonly = false,
  label,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;
  const sizeClass = SIZES[size];

  const handleClick = useCallback(
    (starIndex: number, isLeftHalf: boolean) => {
      if (readonly || !onChange) return;
      const newValue = isLeftHalf ? starIndex + 0.5 : starIndex + 1;
      onChange(newValue);
    },
    [readonly, onChange]
  );

  const handleHover = useCallback(
    (starIndex: number, isLeftHalf: boolean) => {
      if (readonly) return;
      setHoverValue(isLeftHalf ? starIndex + 0.5 : starIndex + 1);
    },
    [readonly]
  );

  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="flex items-center gap-0.5" onMouseLeave={() => setHoverValue(null)}>
        {[0, 1, 2, 3, 4].map((starIndex) => {
          const fillAmount =
            displayValue >= starIndex + 1
              ? 1
              : displayValue >= starIndex + 0.5
              ? 0.5
              : 0;

          return (
            <div
              key={starIndex}
              className={`relative ${sizeClass} ${readonly ? '' : 'cursor-pointer'}`}
            >
              {/* Background star (empty) */}
              <svg
                viewBox="0 0 24 24"
                className={`absolute inset-0 ${sizeClass} text-gray-200`}
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>

              {/* Filled star */}
              {fillAmount > 0 && (
                <svg
                  viewBox="0 0 24 24"
                  className={`absolute inset-0 ${sizeClass} text-gold`}
                  fill="currentColor"
                  style={{
                    clipPath:
                      fillAmount === 0.5
                        ? 'inset(0 50% 0 0)'
                        : undefined,
                  }}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              )}

              {/* Click zones — left half and right half */}
              {!readonly && (
                <>
                  <div
                    className="absolute inset-y-0 left-0 w-1/2 z-10"
                    onClick={() => handleClick(starIndex, true)}
                    onMouseEnter={() => handleHover(starIndex, true)}
                  />
                  <div
                    className="absolute inset-y-0 right-0 w-1/2 z-10"
                    onClick={() => handleClick(starIndex, false)}
                    onMouseEnter={() => handleHover(starIndex, false)}
                  />
                </>
              )}
            </div>
          );
        })}
        {value > 0 && (
          <span className="ml-2 text-sm font-medium text-gray-600">
            {displayValue.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
}
