import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { wishlistApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { Heart, Trash2, ShoppingCart, ArrowLeft, Star } from 'lucide-react';

interface WishlistPageProps {
  onNavigate: (view: string, data?: any) => void;
  onProductClick: (product: Product) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate, onProductClick }) => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, toggleWishlist } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await wishlistApi.getWishlist();
      setItems(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: number) => {
    await toggleWishlist(productId);
    setItems((prev) => prev.filter((item) => (item.id || (item as any).product_id) !== productId));
  };

  const handleMoveToCart = async (productId: number) => {
    await addToCart(productId, 1);
    await handleRemove(productId);
    onNavigate('cart');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            My Wishlist ({items.length})
          </h1>
          <p className="text-xs text-gray-500">Products saved for future purchases</p>
        </div>
        <button
          onClick={() => onNavigate('home')}
          className="text-xs font-bold text-[#2874f0] flex items-center gap-1 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded p-8 animate-pulse space-y-4 shadow-sm">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded shadow-sm p-12 text-center space-y-4">
          <Heart className="w-16 h-16 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-gray-800">Empty Wishlist</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You have no items in your wishlist. Start adding items you love!
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-[#2874f0] text-white font-bold text-xs px-6 py-2.5 rounded shadow-sm hover:bg-[#1a56bc]"
          >
            Explore Deals
          </button>
        </div>
      ) : (
        <div className="bg-white rounded shadow-sm divide-y divide-gray-200">
          {items.map((item: any) => {
            const pId = item.id || item.product_id;
            const price = parseFloat(item.price);
            const origPrice = parseFloat(item.original_price);

            return (
              <div key={pId} className="p-4 sm:p-6 flex flex-wrap sm:flex-nowrap items-center gap-6">
                <div
                  onClick={() => onProductClick(item)}
                  className="w-24 h-24 flex-shrink-0 flex items-center justify-center p-2 border border-gray-100 rounded cursor-pointer"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="flex-1 space-y-1.5">
                  <h3
                    onClick={() => onProductClick(item)}
                    className="text-sm font-semibold text-gray-900 hover:text-[#2874f0] cursor-pointer line-clamp-1"
                  >
                    {item.title}
                  </h3>

                  <p className="text-[11px] text-gray-400 uppercase font-bold">{item.brand}</p>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-base sm:text-lg font-bold text-gray-900">
                      ₹{price.toLocaleString()}
                    </span>
                    {origPrice > price && (
                      <>
                        <span className="text-xs text-gray-400 line-through">
                          ₹{origPrice.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-[#388e3c]">
                          {item.discount_percentage}% off
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleMoveToCart(pId)}
                    className="bg-[#fb641b] hover:bg-[#e2530c] text-white font-bold text-xs py-2 px-4 rounded shadow-sm flex items-center gap-1.5"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Move to Cart</span>
                  </button>

                  <button
                    onClick={() => handleRemove(pId)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded border border-gray-200 hover:border-red-200 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
