import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Clock, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';

interface DealRowProps {
  title: string;
  subtitle?: string;
  deals: Product[];
  onViewAll: () => void;
  onProductClick: (product: Product) => void;
  showTimer?: boolean;
}

export const DealRow: React.FC<DealRowProps> = ({
  title,
  subtitle,
  deals,
  onViewAll,
  onProductClick,
  showTimer = true,
}) => {
  // Countdown timer for deals
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    if (!showTimer) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showTimer]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (deals.length === 0) return null;

  return (
    <div className="bg-white rounded shadow-sm p-4 my-3">
      {/* Header with Title, Timer, and View All */}
      <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-3 mb-4 gap-2">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              {title}
            </h2>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>

          {showTimer && (
            <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {pad(timeLeft.hours)} : {pad(timeLeft.minutes)} : {pad(timeLeft.seconds)} Left
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onViewAll}
          className="bg-[#2874f0] hover:bg-[#1a56bc] text-white font-bold text-xs uppercase px-4 py-2 rounded-sm shadow-sm transition flex items-center gap-1"
        >
          <span>VIEW ALL</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Deal Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {deals.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={onProductClick}
          />
        ))}
      </div>
    </div>
  );
};
