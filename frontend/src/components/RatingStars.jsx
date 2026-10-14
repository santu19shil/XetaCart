import { Star } from 'lucide-react';

// A small, reusable star-rating display.
export default function RatingStars({ rating = 0, size = 14, showValue = false }) {
  const safeRating = Number(rating) || 0;
  const fullStars = Math.round(safeRating);

  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={size}
            className={n <= fullStars ? 'fill-gold text-gold' : 'text-gray-300'}
            strokeWidth={1.5}
          />
        ))}
      </span>
      {showValue && (
        <span className="text-xs text-gray-500 font-semibold ml-1">
          {safeRating % 1 === 0 ? safeRating.toFixed(1) : safeRating}
        </span>
      )}
    </span>
  );
}