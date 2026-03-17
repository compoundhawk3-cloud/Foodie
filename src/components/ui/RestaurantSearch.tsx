'use client';

interface RestaurantSearchProps {
  value: string;
  onChange: (name: string) => void;
  label?: string;
}

export default function RestaurantSearch({ value, onChange, label }: RestaurantSearchProps) {
  return (
    <div>
      {label && (
        <label className="label">
          {label}
          <span className="text-red-400 ml-0.5">*</span>
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Restaurant name"
        className="input-field"
        required
      />
    </div>
  );
}
