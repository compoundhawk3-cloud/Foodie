'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import toast from 'react-hot-toast';

import StarRating from '@/components/ui/StarRating';
import PriceSelector from '@/components/ui/PriceSelector';
import WorthItToggle from '@/components/ui/WorthItToggle';
import PhotoUpload from '@/components/ui/PhotoUpload';
import SelectField from '@/components/ui/SelectField';
import RestaurantSearch from '@/components/ui/RestaurantSearch';
import CitySearch from '@/components/ui/CitySearch';

import type {
  EntryFormData,
  MealType,
  FoodType,
  PortionSize,
} from '@/types/database';
import { MEAL_TYPE_LABELS, FOOD_TYPE_LABELS, PORTION_SIZE_LABELS } from '@/types/database';

const MEAL_OPTIONS = Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const FOOD_OPTIONS = Object.entries(FOOD_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const PORTION_OPTIONS = Object.entries(PORTION_SIZE_LABELS).map(([value, label]) => ({ value, label }));

const initialForm: EntryFormData = {
  title: '',
  visit_date: new Date().toISOString().split('T')[0],
  meal_type: '' as MealType,
  food_type: '' as FoodType,
  comment: '',
  foodie_rating: 0,
  service_rating: null,
  portion_size: null,
  price_level: '2',
  worth_it: null,
  city: '',
  restaurant_name: '',
  photos: [],
};

export default function WritePage() {
  const [form, setForm] = useState<EntryFormData>(initialForm);
  const [serviceNA, setServiceNA] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const updateForm = <K extends keyof EntryFormData>(key: K, value: EntryFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (form.foodie_rating === 0) {
      toast.error('Please add a food rating');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Find or create restaurant
      let restaurantId: string | null = null;

      if (form.restaurant_name.trim()) {
        const { data: existing } = await supabase
          .from('restaurants')
          .select()
          .eq('name', form.restaurant_name.trim())
          .eq('city', form.city)
          .single();

        if (existing) {
          restaurantId = existing.id;
        } else {
          const { data: newRestaurant, error: restError } = await supabase
            .from('restaurants')
            .insert({
              name: form.restaurant_name.trim(),
              city: form.city,
              created_by: user.id,
            })
            .select()
            .single();

          if (restError) {
            const { data: retryExisting } = await supabase
              .from('restaurants')
              .select()
              .eq('name', form.restaurant_name.trim())
              .eq('city', form.city)
              .single();
            restaurantId = retryExisting?.id || null;
          } else {
            restaurantId = newRestaurant.id;
          }
        }
      }

      // 2. Create entry
      const { data: entry, error: entryError } = await supabase
        .from('entries')
        .insert({
          user_id: user.id,
          restaurant_id: restaurantId,
          title: form.title.trim(),
          visit_date: form.visit_date,
          meal_type: form.meal_type,
          food_type: form.food_type,
          comment: form.comment.trim(),
          foodie_rating: form.foodie_rating,
          service_rating: serviceNA ? null : form.service_rating,
          portion_size: form.portion_size,
          price_level: form.price_level,
          worth_it: form.worth_it,
          city: form.city,
        })
        .select()
        .single();

      if (entryError) throw entryError;

      // 3. Upload photos
      if (form.photos.length > 0 && entry) {
        const photoRecords = await Promise.all(
          form.photos.map(async (file, index) => {
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/${entry.id}/${index}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from('entry-photos')
              .upload(filePath, file, { cacheControl: '3600', upsert: false });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
              .from('entry-photos')
              .getPublicUrl(filePath);

            return {
              entry_id: entry.id,
              storage_path: filePath,
              url: urlData.publicUrl,
              display_order: index,
            };
          })
        );

        const { error: photoError } = await supabase
          .from('entry_photos')
          .insert(photoRecords);

        if (photoError) throw photoError;
      }

      toast.success('Entry saved!');
      setForm(initialForm);
      setServiceNA(false);
      router.push('/journal');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">New Entry</h1>
        <p className="text-sm text-gray-400 mt-0.5">Log your dining experience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photos */}
        <PhotoUpload
          photos={form.photos}
          onChange={(photos) => updateForm('photos', photos)}
        />

        {/* Title */}
        <div>
          <label className="label">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateForm('title', e.target.value)}
            placeholder="What did you have?"
            className="input-field"
            required
            maxLength={100}
          />
        </div>

        {/* Date */}
        <div>
          <label className="label">
            Date of Visit <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={form.visit_date}
            onChange={(e) => updateForm('visit_date', e.target.value)}
            className="input-field"
            required
          />
        </div>

        {/* Restaurant */}
        <RestaurantSearch
          label="Restaurant"
          value={form.restaurant_name}
          onChange={(name) => updateForm('restaurant_name', name)}
        />

        {/* City */}
        <CitySearch
          label="City"
          value={form.city}
          onChange={(city) => updateForm('city', city)}
        />

        {/* Meal & Food Type — side by side */}
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Meal Type"
            value={form.meal_type}
            onChange={(v) => updateForm('meal_type', v as MealType)}
            options={MEAL_OPTIONS}
            required
          />
          <SelectField
            label="Food Type"
            value={form.food_type}
            onChange={(v) => updateForm('food_type', v as FoodType)}
            options={FOOD_OPTIONS}
            required
          />
        </div>

        {/* Portion Size */}
        <SelectField
          label="Portion Size"
          value={form.portion_size || ''}
          onChange={(v) => updateForm('portion_size', (v || null) as PortionSize | null)}
          options={PORTION_OPTIONS}
          placeholder="Optional"
        />

        {/* Ratings Section */}
        <div className="card p-5 space-y-5">
          <StarRating
            label="Food Rating"
            value={form.foodie_rating}
            onChange={(v) => updateForm('foodie_rating', v)}
            size="lg"
          />
          <div className="border-t border-gray-100" />
          <StarRating
            label="Service Rating"
            value={form.service_rating || 0}
            onChange={(v) => {
              setServiceNA(false);
              updateForm('service_rating', v);
            }}
            size="md"
            showNA
            isNA={serviceNA}
            onNA={() => {
              setServiceNA(!serviceNA);
              if (!serviceNA) updateForm('service_rating', null);
            }}
          />
        </div>

        {/* Price Level */}
        <PriceSelector
          label="Price Level"
          value={form.price_level}
          onChange={(v) => updateForm('price_level', v)}
        />

        {/* Comment */}
        <div>
          <label className="label">
            Comment <span className="text-red-400">*</span>
          </label>
          <textarea
            value={form.comment}
            onChange={(e) => updateForm('comment', e.target.value)}
            placeholder="How was it? Flavours, texture, atmosphere..."
            className="input-field min-h-[100px] resize-none"
            required
            rows={4}
          />
        </div>

        {/* Worth It */}
        <WorthItToggle
          label="Worth it?"
          value={form.worth_it}
          onChange={(v) => updateForm('worth_it', v)}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full text-base py-4"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            'Save Entry'
          )}
        </button>
      </form>
    </div>
  );
}
