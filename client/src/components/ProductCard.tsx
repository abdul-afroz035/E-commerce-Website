import React from 'react';
import { Product } from '../types';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const wishlisted = isWishlisted(product.id);

  const priceNum = parseFloat(product.price as string);
  const origPriceNum = parseFloat(product.original_price as string);
  const ratingNum = parseFloat(product.rating as string);

  return (
    <div
      onClick={() => onClick(product)}
      className="bg-white rounded border border-gray-100 hover:border-blue-200 hover:shadow-fk-hover transition-all duration-200 p-3 flex flex-col justify-between cursor-pointer group relative"
    >
      {/* Top badges & Wishlist */}
      <div className="flex items-center justify-between w-full mb-2">
        {product.deal_tag ? (
          <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded uppercase tracking-wider">
            {product.deal_tag}
          </span>
        ) : (
          <span />
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="p-1.5 rounded-full hover:bg-gray-100 transition z-10"
        >
          <Heart
            className={`w-4 h-4 transition ${
              wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover:text-gray-600'
            }`}
          />
        </button>
      </div>

      {/* Image container */}
      <div className="relative w-full h-44 sm:h-48 flex items-center justify-center p-2 mb-3 overflow-hidden bg-white">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Product Details */}
      <div className="space-y-1.5 flex-1 flex flex-col justify-end">
        {/* Brand */}
        <p className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">
          {product.brand}
        </p>

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug group-hover:text-[#2874f0] transition">
          {product.title}
        </h3>

        {/* Rating and ZapAssured */}
        <div className="flex items-center gap-2 pt-0.5">
          <div className="flex items-center gap-1 bg-[#388e3c] text-white text-xs font-bold px-1.5 py-0.5 rounded">
            <span>{ratingNum.toFixed(1)}</span>
            <Star className="w-3 h-3 fill-white" />
          </div>
          <span className="text-xs text-gray-500">
            ({product.rating_count ? product.rating_count.toLocaleString() : '50'})
          </span>

          {product.zap_assured && (
            <span className="ml-auto flex items-center gap-0.5 text-[10px] font-black italic bg-blue-50 text-[#0055ff] px-1 rounded border border-blue-200">
              ⚡ Zap<span className="text-[#ffe11b]">Assured</span>
            </span>
          )}
        </div>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-base sm:text-lg font-bold text-gray-900">
            ₹{priceNum.toLocaleString()}
          </span>
          {origPriceNum > priceNum && (
            <>
              <span className="text-xs text-gray-500 line-through">
                ₹{origPriceNum.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-[#388e3c]">
                {product.discount_percentage}% off
              </span>
            </>
          )}
        </div>

        {/* Delivery tagline */}
        <p className="text-[11px] text-gray-500 pt-0.5">
          Free delivery by <span className="font-semibold text-gray-700">Tomorrow</span>
        </p>

        {/* Quick Add to Cart Button */}
        <div className="pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product.id, 1);
            }}
            className="w-full bg-[#f1f2f4] hover:bg-[#ffe11b] hover:text-[#2874f0] text-gray-700 text-xs font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition active:scale-95 border border-gray-200 hover:border-yellow-400"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
