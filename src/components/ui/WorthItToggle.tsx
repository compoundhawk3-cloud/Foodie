'use client';

interface WorthItToggleProps {
  value: boolean | null;
  onChange: (value: boolean | null) => void;
  label?: string;
}

export default function WorthItToggle({ value, onChange, label }: WorthItToggleProps) {
  const options: { key: boolean | null; label: string; activeClass: string }[] = [
    { key: true, label: 'Yes', activeClass: 'bg-emerald-500 text-white shadow-sm' },
    { key: null, label: 'Neutral', activeClass: 'bg-gray-500 text-white shadow-sm' },
    { key: false, label: 'No', activeClass: 'bg-red-500 text-white shadow-sm' },
  ];

  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white">
        {options.map((opt, i) => {
          const isActive = value === opt.key;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(opt.key)}
              className={`flex-1 py-3 text-sm font-semibold transition-all
                ${isActive
                  ? opt.activeClass
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }
                ${i > 0 ? 'border-l border-gray-200' : ''}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
