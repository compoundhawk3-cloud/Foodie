'use client';

import Image from 'next/image';
import { format } from 'date-fns';
import StarRating from '@/components/ui/StarRating';
import type { EntryWithDetails } from '@/types/database';
import { MEAL_TYPE_LABELS, FOOD_TYPE_LABELS, PRICE_LEVEL_LABELS } from '@/types/database';

interface EntryCardProps {
  entry: EntryWithDetails;
}

export default function EntryCard({ entry }: EntryCardProps) {
  const heroPhoto = entry.photos?.[0];

  return (
    <article className="card overflow-hidden">
      {/* Hero photo */}
      {heroPhoto && (
        <div className="relative w-full aspect-[4/3]">
          <Image
            src={heroPhoto.url}
            alt={entry.title}
            fill
            className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
          />
          {entry.photos.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              +{entry.photos.length - 1}
            </div>
          )}
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-lg font-bold text-gray-900 truncate">
              {entry.title}
            </h3>
            {entry.restaurant && (
              <p className="text-sm text-gray-500 truncate">
                📍 {entry.restaurant.name}
                {entry.city && ` · ${entry.city}`}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <StarRating value={entry.foodie_rating} size="sm" readonly />
          </div>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-forest-50 text-forest">
            {MEAL_TYPE_LABELS[entry.meal_type]}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-50 text-accent-700">
            {FOOD_TYPE_LABELS[entry.food_type]}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {PRICE_LEVEL_LABELS[entry.price_level]}
          </span>
          {entry.portion_size && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {entry.portion_size}
            </span>
          )}
        </div>

        {/* Comment */}
        {entry.comment && (
          <p className="text-sm text-gray-700 line-clamp-3">{entry.comment}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-50">
          <span className="text-xs text-gray-400">
            {format(new Date(entry.visit_date), 'd MMM yyyy')}
          </span>
          <div className="flex items-center gap-2">
            {entry.service_rating && (
              <span className="text-xs text-gray-400">
                Service: {entry.service_rating.toFixed(1)}★
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full
                ${entry.worth_it
                  ? 'bg-accent-50 text-accent-700'
                  : 'bg-red-50 text-red-600'
                }`}
            >
              {entry.worth_it ? '👍 Worth it' : '👎 Not worth it'}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
