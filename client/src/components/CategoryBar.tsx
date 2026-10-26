import React, { useEffect, useState } from 'react';
import { Category } from '../types';
import { categoryApi } from '../services/api';
import { Smartphone, Laptop, Tv, Shirt, Armchair, Sparkles, Apple, ChevronDown } from 'lucide-react';

interface CategoryBarProps {
  onSelectCategory: (slug: string) => void;
  activeCategory?: string;
}

const iconMap: Record<string, any> = {
  Smartphone,
  Laptop,
  Tv,
  Shirt,
  Armchair,
  Sparkles,
  Apple,
};

export const CategoryBar: React.FC<CategoryBarProps> = ({ onSelectCategory, activeCategory }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoryApi.getCategories().then((res) => {
      setCategories(res.categories);
    }).catch(console.error);
  }, []);

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between sm:justify-center sm:gap-10 md:gap-14 overflow-x-auto no-scrollbar py-3">
          {/* All Products shortcut */}
          <button
            onClick={() => onSelectCategory('')}
            className={`flex flex-col items-center gap-1 group flex-shrink-0 transition-transform active:scale-95 ${
              !activeCategory ? 'text-[#2874f0]' : 'text-[#212121]'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center p-2 group-hover:bg-blue-100 transition border border-blue-100">
              <Sparkles className="w-7 h-7 text-[#2874f0]" />
            </div>
            <span className="text-xs font-semibold tracking-tight group-hover:text-[#2874f0]">
              All Categories
            </span>
          </button>

          {categories.map((cat) => {
            const Icon = iconMap[cat.icon_name] || Sparkles;
            const isActive = activeCategory === cat.slug;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`flex flex-col items-center gap-1 group flex-shrink-0 transition-transform active:scale-95 ${
                  isActive ? 'text-[#2874f0]' : 'text-[#212121]'
                }`}
              >
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center p-1 group-hover:ring-2 group-hover:ring-[#2874f0] transition shadow-sm border border-gray-100">
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-full group-hover:scale-105 transition"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex items-center gap-0.5">
                  <span className={`text-xs font-semibold tracking-tight group-hover:text-[#2874f0] ${isActive ? 'text-[#2874f0] font-bold' : ''}`}>
                    {cat.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-[#2874f0] hidden sm:inline" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
