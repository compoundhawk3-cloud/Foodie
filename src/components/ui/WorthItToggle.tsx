'use client';

interface WorthItToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}

export default function WorthItToggle({ value, onChange, label }: WorthItToggleProps) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2
            ${value
              ? 'bg-accent text-white shadow-sm'
              : 'bg-white text-gray-500 border border-gray-200 hover:border-accent/30'
            }`}
        >
          <span className="text-lg">👍</span> Worth it!
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2
            ${!value
              ? 'bg-red-500 text-white shadow-sm'
              : 'bg-white text-gray-500 border border-gray-200 hover:border-red-300'
            }`}
        >
          <span className="text-lg">👎</span> Not worth it
        </button>
      </div>
    </div>
  );
}
