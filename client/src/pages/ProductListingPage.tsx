import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { productApi } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { FilterSidebar } from '../components/FilterSidebar';
import { Filter, SlidersHorizontal, ChevronRight, X } from 'lucide-react';

interface ProductListingPageProps {
  initialCategory?: string;
  initialQuery?: string;
  onProductClick: (product: Product) => void;
  onNavigate: (view: string, data?: any) => void;
}

export const ProductListingPage: React.FC<ProductListingPageProps> = ({
  initialCategory = '',
  initialQuery = '',
  onProductClick,
  onNavigate,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [zapAssuredOnly, setZapAssuredOnly] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [initialCategory, initialQuery, selectedBrand, minPrice, maxPrice, minRating, zapAssuredOnly, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        sort: sortBy,
      };
      if (initialCategory) params.category = initialCategory;
      if (initialQuery) params.q = initialQuery;
      if (selectedBrand) params.brand = selectedBrand;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (minRating) params.rating = minRating;
      if (zapAssuredOnly) params.zap_assured = 'true';

      const res = await productApi.getProducts(params);
      setProducts(res.products);
      setTotalCount(res.pagination?.total || res.products.length);
    } catch (err) {
      console.error('Failed to fetch filtered products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setZapAssuredOnly(false);
    setSortBy('relevance');
  };

  const sortOptions = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Price -- Low to High', value: 'price_asc' },
    { label: 'Price -- High to Low', value: 'price_desc' },
    { label: 'Customer Rating', value: 'rating_desc' },
    { label: 'Discount', value: 'discount_desc' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
        <span onClick={() => onNavigate('home')} className="hover:text-[#2874f0] cursor-pointer">
          Home
        </span>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        {initialCategory ? (
          <span className="font-medium text-gray-800 capitalize">{initialCategory}</span>
        ) : initialQuery ? (
          <span className="font-medium text-gray-800">Search results for "{initialQuery}"</span>
        ) : (
          <span className="font-medium text-gray-800">All Products</span>
        )}
      </div>

      <div className="flex gap-4">
        {/* Left Filter Sidebar - Desktop */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <FilterSidebar
            selectedCategory={initialCategory}
            selectedBrand={selectedBrand}
            onBrandChange={setSelectedBrand}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            minRating={minRating}
            onRatingChange={setMinRating}
            zapAssuredOnly={zapAssuredOnly}
            onZapAssuredToggle={() => setZapAssuredOnly(!zapAssuredOnly)}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Right Main Content */}
        <div className="flex-1 space-y-3">
          {/* Top Sort Bar */}
          <div className="bg-white p-3 rounded shadow-sm flex flex-wrap items-center justify-between border-b border-gray-100 gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="md:hidden flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
              <h1 className="text-sm font-bold text-gray-900">
                {initialCategory ? (
                  <span className="capitalize">{initialCategory}</span>
                ) : initialQuery ? (
                  <span>"{initialQuery}"</span>
                ) : (
                  'All Categories'
                )}
                <span className="text-xs font-normal text-gray-500 ml-2">
                  (Showing {products.length} of {totalCount} items)
                </span>
              </h1>
            </div>

            {/* Sort Tabs */}
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar text-xs">
              <span className="font-bold text-gray-800 hidden sm:inline">Sort By:</span>
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`py-1 px-2 font-medium whitespace-nowrap transition border-b-2 ${
                    sortBy === opt.value
                      ? 'border-[#2874f0] text-[#2874f0] font-bold'
                      : 'border-transparent text-gray-600 hover:text-[#2874f0]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filter Tags */}
          {(selectedBrand || minPrice || maxPrice || minRating || zapAssuredOnly) && (
            <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded shadow-sm">
              <span className="text-xs text-gray-400 font-semibold pl-1">Active:</span>
              {selectedBrand && (
                <span className="bg-blue-50 text-[#2874f0] text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium border border-blue-200">
                  Brand: {selectedBrand}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedBrand('')} />
                </span>
              )}
              {zapAssuredOnly && (
                <span className="bg-blue-50 text-[#0055ff] text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold border border-blue-200">
                  ZapAssured
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setZapAssuredOnly(false)} />
                </span>
              )}
              {minRating && (
                <span className="bg-yellow-50 text-yellow-800 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium border border-yellow-200">
                  {minRating}★ & above
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setMinRating('')} />
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium border border-gray-300">
                  Price: ₹{minPrice || 0} - ₹{maxPrice || '∞'}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => {
                      setMinPrice('');
                      setMaxPrice('');
                    }}
                  />
                </span>
              )}
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white p-4 rounded animate-pulse space-y-3">
                  <div className="bg-gray-200 h-44 rounded" />
                  <div className="bg-gray-200 h-4 rounded w-3/4" />
                  <div className="bg-gray-200 h-4 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded p-12 text-center space-y-3 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800">No matching products found!</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Try checking your spelling or use more general terms. You can also reset filters to see all available products.
              </p>
              <button
                onClick={handleClearFilters}
                className="bg-[#2874f0] text-white text-xs font-bold px-4 py-2 rounded shadow-sm hover:bg-[#1a56bc] transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={onProductClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
