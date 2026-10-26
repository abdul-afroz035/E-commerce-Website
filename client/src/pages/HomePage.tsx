import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { dealApi, productApi } from '../services/api';
import { BannerCarousel } from '../components/BannerCarousel';
import { DealRow } from '../components/DealRow';
import { CreditCard, Sparkles, Zap, Shield, ArrowRight } from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: string, data?: any) => void;
  onProductClick: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onProductClick }) => {
  const [deals, setDeals] = useState<Product[]>([]);
  const [electronics, setElectronics] = useState<Product[]>([]);
  const [fashion, setFashion] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [dealsRes, elecRes, fashRes] = await Promise.all([
          dealApi.getFeaturedDeals(),
          productApi.getProducts({ category: 'electronics', limit: 4 }),
          productApi.getProducts({ category: 'fashion', limit: 4 }),
        ]);
        setDeals(dealsRes.deals);
        setElectronics(elecRes.products);
        setFashion(fashRes.products);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-4 pb-8">
      {/* Hero Carousel */}
      <BannerCarousel onBannerClick={(category) => onNavigate('products', { category })} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Bank Offer Marquee Strip */}
        <div className="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 rounded p-3 flex flex-wrap items-center justify-between shadow-sm text-gray-900 gap-2">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-900" />
            <span className="font-extrabold text-xs sm:text-sm">
              Bank Offer: 10% Instant Discount on HDFC & SBI Credit Cards on orders above ₹4,999!
            </span>
          </div>
          <span className="text-xs font-bold bg-white text-blue-900 px-2.5 py-1 rounded shadow-sm">
            CODE: ZAPFEST
          </span>
        </div>

        {/* Deals of the Day Row */}
        <DealRow
          title="Deals of the Day"
          subtitle="Top gadgets, electronics & lifestyle offers refreshing daily"
          deals={deals}
          showTimer={true}
          onViewAll={() => onNavigate('products', {})}
          onProductClick={onProductClick}
        />

        {/* Promotional Triple Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigate('products', { category: 'mobiles' })}
            className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded p-5 text-white cursor-pointer hover:shadow-lg transition flex justify-between items-center group"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-yellow-300 uppercase tracking-wider">UP TO 40% OFF</span>
              <h3 className="text-xl font-black">Flagship Smartphones</h3>
              <p className="text-xs text-blue-100">iPhone 15 Pro, S24 Ultra & more</p>
            </div>
            <ArrowRight className="w-6 h-6 text-yellow-300 group-hover:translate-x-1 transition" />
          </div>

          <div
            onClick={() => onNavigate('products', { category: 'electronics' })}
            className="bg-gradient-to-br from-purple-700 to-pink-700 rounded p-5 text-white cursor-pointer hover:shadow-lg transition flex justify-between items-center group"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-yellow-300 uppercase tracking-wider">AUDIO FEST</span>
              <h3 className="text-xl font-black">Sony & boAt Audio</h3>
              <p className="text-xs text-purple-100">Noise cancelling & True Wireless</p>
            </div>
            <ArrowRight className="w-6 h-6 text-yellow-300 group-hover:translate-x-1 transition" />
          </div>

          <div
            onClick={() => onNavigate('products', { category: 'appliances' })}
            className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded p-5 text-white cursor-pointer hover:shadow-lg transition flex justify-between items-center group"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-yellow-300 uppercase tracking-wider">HOME APPLIANCES</span>
              <h3 className="text-xl font-black">Smart Washing Machines</h3>
              <p className="text-xs text-teal-100">LG, Samsung Inverter Series</p>
            </div>
            <ArrowRight className="w-6 h-6 text-yellow-300 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Best of Electronics Row */}
        <DealRow
          title="Best of Electronics & Laptops"
          subtitle="Top rated gear with brand warranty"
          deals={electronics}
          showTimer={false}
          onViewAll={() => onNavigate('products', { category: 'electronics' })}
          onProductClick={onProductClick}
        />

        {/* Top Fashion Steals Row */}
        <DealRow
          title="Top Fashion Deals | Levi's & Puma"
          subtitle="Min 50% Off on Denim, Footwear & Casuals"
          deals={fashion}
          showTimer={false}
          onViewAll={() => onNavigate('products', { category: 'fashion' })}
          onProductClick={onProductClick}
        />

        {/* ZapKart Plus Benefits Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-lg p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-xl space-y-2">
            <div className="flex items-center gap-1.5 text-[#ffe11b]">
              <Sparkles className="w-5 h-5 fill-[#ffe11b]" />
              <span className="text-xs font-black uppercase tracking-wider">ZapKart Plus Membership</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black">
              Unlock Unlimited Free & Express Deliveries
            </h3>
            <p className="text-sm text-gray-300">
              Plus members earn 4 SuperCoins on every ₹100 spent, get early access to sales, and priority 24x7 customer support.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('products', {})}
                className="bg-[#ffe11b] text-[#2874f0] font-black text-xs sm:text-sm px-5 py-2.5 rounded shadow hover:bg-yellow-300 transition"
              >
                Start Shopping Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
