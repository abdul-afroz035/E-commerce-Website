import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, User as UserIcon, Heart, Package, LogOut, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { searchApi } from '../services/api';

interface NavbarProps {
  onNavigate: (view: string, data?: any) => void;
  currentSearch?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentSearch = '' }) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { summary } = useCart();
  const [searchQuery, setSearchQuery] = useState(currentSearch);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchQuery(currentSearch);
  }, [currentSearch]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const res = await searchApi.getSuggestions(searchQuery);
          setSuggestions(res.suggestions || []);
          setShowSuggestions(true);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      onNavigate('products', { q: searchQuery.trim() });
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    onNavigate('products', { q: suggestion });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#2874f0] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Tagline */}
          <div
            onClick={() => onNavigate('home')}
            className="flex flex-col cursor-pointer select-none flex-shrink-0"
          >
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black italic tracking-wide text-white drop-shadow-sm">
                ZapKart
              </span>
              <span className="bg-[#ffe11b] text-[#2874f0] font-black text-xs px-1.5 py-0.5 rounded italic">
                PLUS
              </span>
            </div>
            <div className="flex items-center gap-0.5 text-[11px] text-[#f0f0f0] italic hover:underline">
              <span>Explore</span>
              <span className="text-[#ffe11b] font-bold">Plus</span>
              <Sparkles className="w-3 h-3 text-[#ffe11b] inline fill-[#ffe11b]" />
            </div>
          </div>

          {/* Search Bar with Autocomplete */}
          <div ref={searchRef} className="relative flex-1 max-w-2xl mx-2 sm:mx-6">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                className="w-full bg-white text-[#212121] placeholder-[#878787] text-sm py-2.5 pl-4 pr-11 rounded-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-300 transition"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 bottom-0 px-3 text-[#2874f0] hover:text-[#1a56bc] transition flex items-center justify-center"
              >
                <Search className="w-5 h-5 stroke-[2.5]" />
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-b-sm shadow-fk-dropdown border border-gray-200 z-50 overflow-hidden">
                <div className="py-1">
                  <div className="px-4 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Suggested Searches
                  </div>
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#212121] hover:bg-gray-100 flex items-center gap-3 transition"
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-800">{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-3 sm:gap-6">
            
            {/* Login / User Menu */}
            {isAuthenticated ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 font-semibold text-sm hover:text-[#ffe11b] transition py-1"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">{user?.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded shadow-fk-dropdown text-gray-800 border border-gray-100 z-50 py-2 divide-y divide-gray-100">
                    <div className="px-4 py-2">
                      <p className="text-xs text-gray-500">Hello,</p>
                      <p className="font-semibold text-sm truncate">{user?.name}</p>
                      <p className="text-xs text-blue-600 font-medium">ZapKart Plus Member</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('orders');
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2.5 text-gray-700"
                      >
                        <Package className="w-4 h-4 text-[#2874f0]" />
                        <span>My Orders</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('wishlist');
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2.5 text-gray-700"
                      >
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>Wishlist</span>
                      </button>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2.5 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="bg-white text-[#2874f0] hover:bg-gray-100 px-6 py-1.5 rounded-sm font-semibold text-sm shadow-sm transition border border-transparent"
              >
                Login
              </button>
            )}

            {/* Become a Seller */}
            <span
              onClick={() => alert('ZapKart Seller Central: Over 500,000 sellers grow their business with 0% commission!')}
              className="hidden lg:inline text-sm font-semibold hover:text-[#ffe11b] cursor-pointer transition select-none"
            >
              Become a Seller
            </span>

            {/* Cart Button */}
            <button
              onClick={() => onNavigate('cart')}
              className="flex items-center gap-2 font-semibold text-sm hover:text-[#ffe11b] transition relative py-1"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {summary.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-[#ffe11b] text-[#2874f0] text-[11px] font-black rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center border border-[#2874f0]">
                    {summary.itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Cart</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
