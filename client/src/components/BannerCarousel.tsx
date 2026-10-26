import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerCarouselProps {
  onBannerClick?: (categorySlug: string) => void;
}

const banners = [
  {
    id: 1,
    title: 'THE BIG BILLION DAYS',
    subtitle: 'India Ka Apna Festival | Up to 80% Off',
    highlight: 'Flagship Phones starting from ₹11,999',
    ctaText: 'Shop Electronics',
    category: 'electronics',
    bgGradient: 'from-blue-700 via-indigo-800 to-blue-900',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    badge: 'MEGA SALE IS LIVE'
  },
  {
    id: 2,
    title: 'FASHION BLOCKBUSTER',
    subtitle: 'Top Brands: Puma, Levi’s, Allen Solly',
    highlight: 'Min 50% - 80% Off + Extra 10% Bank Discount',
    ctaText: 'Explore Styles',
    category: 'fashion',
    bgGradient: 'from-amber-600 via-orange-600 to-rose-700',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80',
    badge: 'TRENDING FASHION'
  },
  {
    id: 3,
    title: 'SMARTPHONE CARNIVAL',
    subtitle: 'iPhone 15 Pro & Galaxy S24 Ultra',
    highlight: 'Exchange Bonus up to ₹10,000 + No Cost EMI',
    ctaText: 'Upgrade Mobile',
    category: 'mobiles',
    bgGradient: 'from-purple-800 via-violet-900 to-slate-900',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    badge: 'BEST PRICE GUARANTEE'
  },
];

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ onBannerClick }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % banners.length);
  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  const banner = banners[current];

  return (
    <div className="relative w-full overflow-hidden bg-gray-900 text-white shadow-md">
      <div
        className={`w-full min-h-[260px] sm:min-h-[320px] md:min-h-[360px] bg-gradient-to-r ${banner.bgGradient} flex items-center transition-all duration-700 relative`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 w-full grid grid-cols-1 md:grid-cols-2 items-center gap-6 py-6">
          
          {/* Left copy */}
          <div className="space-y-3 z-10">
            <span className="inline-block bg-[#ffe11b] text-[#212121] text-xs font-black px-2.5 py-1 rounded shadow tracking-wide uppercase">
              {banner.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none drop-shadow">
              {banner.title}
            </h2>
            <p className="text-base sm:text-lg text-blue-100 font-medium">
              {banner.subtitle}
            </p>
            <p className="text-sm sm:text-base text-yellow-300 font-bold">
              {banner.highlight}
            </p>

            <div className="pt-2">
              <button
                onClick={() => onBannerClick && onBannerClick(banner.category)}
                className="bg-[#ffe11b] text-[#2874f0] hover:bg-yellow-300 font-extrabold text-sm sm:text-base px-6 py-2.5 rounded shadow hover:shadow-lg transition transform active:scale-95"
              >
                {banner.ctaText} →
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="hidden md:flex justify-end items-center z-10">
            <div className="relative w-72 h-72 lg:w-80 lg:h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 transform rotate-1 hover:rotate-0 transition duration-500">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Previous Button */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/70 text-white hover:text-black p-2 rounded-r shadow-lg transition backdrop-blur-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Next Button */}
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/70 text-white hover:text-black p-2 rounded-l shadow-lg transition backdrop-blur-sm"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Indicator dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current ? 'w-6 bg-[#ffe11b]' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
