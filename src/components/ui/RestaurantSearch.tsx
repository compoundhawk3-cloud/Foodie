'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Restaurant } from '@/types/database';

interface RestaurantSearchProps {
  value: string;
  onChange: (name: string, restaurant?: Restaurant) => void;
  city?: string;
  label?: string;
}

export default function RestaurantSearch({ value, onChange, city, label }: RestaurantSearchProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<Restaurant[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const supabase = createClient();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const search = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      let query_builder = supabase
        .from('restaurants')
        .select('*')
        .ilike('name', `%${q}%`)
        .limit(8);

      if (city) {
        query_builder = query_builder.ilike('city', `%${city}%`);
      }

      const { data } = await query_builder;
      setResults(data || []);
      setLoading(false);
    },
    [supabase, city]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setIsOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const handleSelect = (restaurant: Restaurant) => {
    setQuery(restaurant.name);
    onChange(restaurant.name, restaurant);
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
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search or type restaurant name..."
          className="input-field pl-10"
          required
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 max-h-48 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleSelect(r)}
              className="w-full text-left px-4 py-3 hover:bg-forest-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              <p className="text-sm font-medium text-gray-900">{r.name}</p>
              {r.city && (
                <p className="text-xs text-gray-500">{r.city}</p>
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-20 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3">
          <p className="text-sm text-gray-500">
            No matches — &quot;{query}&quot; will be added as new
          </p>
        </div>
      )}
    </div>
  );
}
