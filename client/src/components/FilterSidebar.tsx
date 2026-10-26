import React from 'react';
import { Star, RotateCcw } from 'lucide-react';

interface FilterSidebarProps {
  selectedCategory: string;
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (val: string) => void;
  onMaxPriceChange: (val: string) => void;
  minRating: string;
  onRatingChange: (val: string) => void;
  zapAssuredOnly: boolean;
  onZapAssuredToggle: () => void;
  onClearFilters: () => void;
}

const availableBrands = ['Apple', 'Samsung', 'Sony', 'LG', 'boAt', 'Philips', "Levi's", 'Puma', 'Wakefit', 'Minimalist', 'Tata Sampann'];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedBrand,
  onBrandChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  minRating,
  onRatingChange,
  zapAssuredOnly,
  onZapAssuredToggle,
  onClearFilters,
}) => {
  return (
    <div className="bg-white rounded shadow-sm divide-y divide-gray-200">
      {/* Top Header */}
      <div className="p-4 flex items-center justify-between">
        <h3 className="font-bold text-base text-gray-900 tracking-tight">Filters</h3>
        <button
          onClick={onClearFilters}
          className="text-xs text-[#2874f0] hover:underline font-semibold flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>CLEAR ALL</span>
        </button>
      </div>

      {/* ZapAssured Filter */}
      <div className="p-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={zapAssuredOnly}
            onChange={onZapAssuredToggle}
            className="w-4 h-4 text-[#2874f0] rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="flex items-center gap-0.5 text-xs font-black italic bg-blue-50 text-[#0055ff] px-1.5 py-0.5 rounded border border-blue-200">
            ⚡ Zap<span className="text-[#ffe11b]">Assured</span>
          </span>
        </label>
      </div>

      {/* Price Range Filter */}
      <div className="p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase text-gray-700 tracking-wider">
          Price Range
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-500 uppercase font-semibold">Min (₹)</label>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              className="w-full text-xs p-1.5 border border-gray-300 rounded focus:border-[#2874f0] outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase font-semibold">Max (₹)</label>
            <input
              type="number"
              placeholder="150000"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              className="w-full text-xs p-1.5 border border-gray-300 rounded focus:border-[#2874f0] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Customer Ratings */}
      <div className="p-4 space-y-2">
        <h4 className="text-xs font-bold uppercase text-gray-700 tracking-wider">
          Customer Ratings
        </h4>
        <div className="space-y-1.5">
          {[4, 3, 2].map((stars) => (
            <label
              key={stars}
              onClick={() => onRatingChange(minRating === stars.toString() ? '' : stars.toString())}
              className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:text-[#2874f0]"
            >
              <input
                type="checkbox"
                checked={minRating === stars.toString()}
                readOnly
                className="w-4 h-4 text-[#2874f0] rounded border-gray-300"
              />
              <span className="flex items-center gap-1 font-medium">
                {stars}★ & above
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand Selection */}
      <div className="p-4 space-y-2">
        <h4 className="text-xs font-bold uppercase text-gray-700 tracking-wider">
          Brand
        </h4>
        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
          {availableBrands.map((brand) => (
            <label
              key={brand}
              onClick={() => onBrandChange(selectedBrand === brand ? '' : brand)}
              className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:text-[#2874f0]"
            >
              <input
                type="checkbox"
                checked={selectedBrand === brand}
                readOnly
                className="w-4 h-4 text-[#2874f0] rounded border-gray-300"
              />
              <span className="font-medium">{brand}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
