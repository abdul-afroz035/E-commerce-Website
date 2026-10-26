import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

interface CartPageProps {
  onNavigate: (view: string, data?: any) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const { items, summary, updateQuantity, removeFromCart } = useCart();
  const { user, addresses, isAuthenticated, openAuthModal } = useAuth();

  const defaultAddress = addresses.find((a) => a.is_default) || addresses[0];

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    onNavigate('checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded shadow-sm p-12 space-y-4">
          <div className="w-24 h-24 bg-blue-50 text-[#2874f0] rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Your Cart is empty!</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Explore our wide selection of smartphones, electronics, appliances, and fashion deals now.
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-[#2874f0] hover:bg-[#1a56bc] text-white font-bold text-sm px-8 py-2.5 rounded shadow-sm transition"
          >
            Shop Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Deliver To Strip */}
          <div className="bg-white p-4 rounded shadow-sm flex items-center justify-between border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-500">
                Deliver to: <strong className="text-gray-900">{user?.name || 'Afroz Shopper'}, {defaultAddress?.pincode || '560001'}</strong>
              </p>
              <p className="text-[11px] text-gray-500 truncate max-w-md">
                {defaultAddress?.address_line || '#42, Brigade Towers, MG Road, Bengaluru'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('checkout')}
              className="text-xs font-bold text-[#2874f0] border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
            >
              Change
            </button>
          </div>

          {/* Cart Items Container */}
          <div className="bg-white rounded shadow-sm divide-y divide-gray-200">
            {items.map((item) => {
              const price = parseFloat(item.price as string);
              const origPrice = parseFloat(item.original_price as string);

              return (
                <div key={item.product_id} className="p-4 sm:p-6 space-y-4">
                  <div className="flex gap-4 sm:gap-6">
                    {/* Item Image */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 flex items-center justify-center p-2 border border-gray-100 rounded">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 space-y-1.5">
                      <h3
                        onClick={() => onNavigate('product-detail', { id: item.product_id })}
                        className="text-sm font-semibold text-gray-900 hover:text-[#2874f0] cursor-pointer line-clamp-2"
                      >
                        {item.title}
                      </h3>

                      <p className="text-[11px] text-gray-400 uppercase font-bold">{item.brand}</p>

                      {item.zap_assured && (
                        <span className="inline-flex items-center text-[10px] font-black italic bg-blue-50 text-[#0055ff] px-1.5 py-0.5 rounded border border-blue-200">
                          ⚡ Zap<span className="text-[#ffe11b]">Assured</span>
                        </span>
                      )}

                      {/* Prices */}
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

                      <p className="text-[11px] text-green-700 font-semibold">
                        Delivery by Tomorrow | FREE
                      </p>
                    </div>
                  </div>

                  {/* Quantity & Actions Bar */}
                  <div className="flex items-center gap-6 pt-2 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-gray-900 border border-gray-200 py-1 rounded">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => alert('Saved to Wishlist!')}
                      className="font-bold text-gray-700 hover:text-[#2874f0] uppercase"
                    >
                      SAVE FOR LATER
                    </button>

                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="font-bold text-gray-700 hover:text-red-600 uppercase flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>REMOVE</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Bottom Place Order Bar */}
            <div className="p-4 bg-white flex justify-end shadow-sm sticky bottom-0 z-10 border-t border-gray-200">
              <button
                onClick={handlePlaceOrder}
                className="bg-[#fb641b] hover:bg-[#e2530c] text-white font-extrabold text-sm py-3 px-8 rounded-sm shadow-md transition flex items-center gap-2"
              >
                <span>PLACE ORDER</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Price Details Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4 sticky top-20">
          <div className="bg-white rounded shadow-sm p-4 divide-y divide-gray-200">
            <h3 className="font-bold text-xs uppercase text-gray-500 tracking-wider pb-3">
              PRICE DETAILS
            </h3>

            <div className="py-3 space-y-3 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Price ({summary.itemCount} items)</span>
                <span>₹{summary.originalTotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-gray-700">
                <span>Discount</span>
                <span className="text-[#388e3c] font-semibold">
                  - ₹{summary.totalDiscount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-gray-700">
                <span>Delivery Charges</span>
                <span className="text-[#388e3c] font-semibold">
                  {summary.deliveryFee === 0 ? 'FREE' : `₹${summary.deliveryFee}`}
                </span>
              </div>
            </div>

            <div className="py-3 flex justify-between text-base font-extrabold text-gray-900 border-t border-dashed">
              <span>Total Amount</span>
              <span>₹{summary.finalAmount.toLocaleString()}</span>
            </div>

            {summary.totalDiscount > 0 && (
              <div className="pt-3 text-xs font-bold text-[#388e3c]">
                You will save ₹{summary.totalDiscount.toLocaleString()} on this order 🎉
              </div>
            )}
          </div>

          {/* Safe & Secure Payments Callout */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-500">
            <ShieldCheck className="w-7 h-7 text-gray-400 flex-shrink-0" />
            <p>
              Safe and Secure Payments. Easy returns. 100% Authentic products.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
