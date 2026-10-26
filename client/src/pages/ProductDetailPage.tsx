import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { productApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  ShoppingCart,
  Zap,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  MapPin,
  Check,
  ChevronRight
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailPageProps {
  productIdOrSlug: string | number;
  onNavigate: (view: string, data?: any) => void;
  onProductClick: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productIdOrSlug,
  onNavigate,
  onProductClick,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [pincode, setPincode] = useState('560001');
  const [pincodeChecked, setPincodeChecked] = useState(true);
  const [loading, setLoading] = useState(true);

  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();

  useEffect(() => {
    fetchProductDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productIdOrSlug]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await productApi.getProductByIdOrSlug(productIdOrSlug);
      setProduct(res.product);
      setSelectedImage(res.product.thumbnail);
    } catch (err) {
      console.error('Failed to load product detail:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded p-8 animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-200 h-96 rounded" />
          <div className="space-y-4">
            <div className="bg-gray-200 h-6 rounded w-3/4" />
            <div className="bg-gray-200 h-4 rounded w-1/4" />
            <div className="bg-gray-200 h-8 rounded w-1/3" />
            <div className="bg-gray-200 h-24 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center bg-white rounded shadow-sm my-6">
        <h2 className="text-xl font-bold text-gray-800">Product not found</h2>
        <button
          onClick={() => onNavigate('home')}
          className="mt-4 bg-[#2874f0] text-white px-5 py-2 rounded text-sm font-semibold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const priceNum = parseFloat(product.price as string);
  const origPriceNum = parseFloat(product.original_price as string);
  const ratingNum = parseFloat(product.rating as string);

  // Parse images if stored as JSON string
  const images: string[] = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
    ? JSON.parse(product.images)
    : [product.thumbnail];

  // Parse highlights
  const highlights: string[] = Array.isArray(product.highlights)
    ? product.highlights
    : typeof product.highlights === 'string'
    ? JSON.parse(product.highlights)
    : [];

  // Parse specifications
  const specs: Record<string, string> =
    typeof product.specifications === 'string'
      ? JSON.parse(product.specifications)
      : product.specifications || {};

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    await addToCart(product.id, 1);
    onNavigate('checkout', { directItem: { ...product, quantity: 1 } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <span onClick={() => onNavigate('home')} className="hover:text-[#2874f0] cursor-pointer">
          Home
        </span>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span
          onClick={() => onNavigate('products', { category: product.category_slug })}
          className="hover:text-[#2874f0] cursor-pointer capitalize"
        >
          {product.category_name || 'Category'}
        </span>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="text-gray-800 font-medium truncate max-w-sm">{product.title}</span>
      </div>

      {/* Main PDP Grid */}
      <div className="bg-white rounded shadow-sm p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Image Gallery & Sticky CTA Buttons (5 cols) */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="flex gap-3">
            {/* Thumbnails vertical list */}
            {images.length > 1 && (
              <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto no-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onMouseEnter={() => setSelectedImage(img)}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded border p-1 flex-shrink-0 transition ${
                      selectedImage === img ? 'border-[#2874f0] ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Featured Image with Wishlist Button */}
            <div className="relative flex-1 h-[360px] sm:h-[420px] rounded border border-gray-100 p-4 flex items-center justify-center bg-white group overflow-hidden">
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition z-10"
              >
                <Heart
                  className={`w-5 h-5 ${
                    wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
                  }`}
                />
              </button>

              <img
                src={selectedImage || product.thumbnail}
                alt={product.title}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Sticky CTA Buttons: Add to Cart (Yellow) & Buy Now (Orange) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => addToCart(product.id, 1)}
              className="bg-[#ff9f00] hover:bg-[#f39700] text-white font-extrabold text-sm py-3 px-4 rounded-sm shadow transition flex items-center justify-center gap-2 active:scale-95"
            >
              <ShoppingCart className="w-4 h-4 fill-white" />
              <span>ADD TO CART</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="bg-[#fb641b] hover:bg-[#e2530c] text-white font-extrabold text-sm py-3 px-4 rounded-sm shadow transition flex items-center justify-center gap-2 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>BUY NOW</span>
            </button>
          </div>
        </div>

        {/* Right Column: Details, Offers, Specs, Reviews (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          {/* Brand & Title */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{product.brand}</p>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
              {product.title}
            </h1>
          </div>

          {/* Rating Pill, Counts, ZapAssured */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#388e3c] text-white text-xs font-bold px-2 py-0.5 rounded">
              <span>{ratingNum.toFixed(1)}</span>
              <Star className="w-3 h-3 fill-white" />
            </div>
            <span className="text-xs font-semibold text-gray-500">
              {product.rating_count?.toLocaleString()} Ratings & {product.review_count?.toLocaleString()} Reviews
            </span>
            {product.zap_assured && (
              <span className="flex items-center gap-0.5 text-xs font-black italic bg-blue-50 text-[#0055ff] px-2 py-0.5 rounded border border-blue-200">
                ⚡ Zap<span className="text-[#ffe11b]">Assured</span>
              </span>
            )}
          </div>

          {/* Price Block */}
          <div className="border-b border-gray-100 pb-3">
            <div className="text-xs font-bold text-[#388e3c] uppercase">Special Price</div>
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl font-bold text-gray-900">
                ₹{priceNum.toLocaleString()}
              </span>
              {origPriceNum > priceNum && (
                <>
                  <span className="text-base text-gray-500 line-through">
                    ₹{origPriceNum.toLocaleString()}
                  </span>
                  <span className="text-base font-bold text-[#388e3c]">
                    {product.discount_percentage}% off
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              + ₹40 Secured Packaging Fee (Waived for ZapKart Plus Members)
            </p>
          </div>

          {/* Available Offers */}
          <div className="space-y-2 border-b border-gray-100 pb-4">
            <h4 className="text-xs font-bold uppercase text-gray-900 tracking-wider">
              Available Offers
            </h4>
            <div className="space-y-2 text-xs text-gray-800">
              <div className="flex items-start gap-2">
                <Tag className="w-4 h-4 text-[#388e3c] flex-shrink-0 mt-0.5 fill-[#388e3c]/20" />
                <div>
                  <span className="font-bold">Bank Offer:</span> 10% Instant Discount on HDFC Bank Credit Cards, up to ₹1,500.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Tag className="w-4 h-4 text-[#388e3c] flex-shrink-0 mt-0.5 fill-[#388e3c]/20" />
                <div>
                  <span className="font-bold">Special Price:</span> Get extra ₹2,000 off on exchange of your old device.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Tag className="w-4 h-4 text-[#388e3c] flex-shrink-0 mt-0.5 fill-[#388e3c]/20" />
                <div>
                  <span className="font-bold">Partner Offer:</span> Sign-up for ZapKart Pay Later & get ₹500 Gift Card.
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Pincode Checker */}
          <div className="border-b border-gray-100 pb-4 space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-bold text-gray-700">Delivery Options:</span>
            </div>
            <div className="flex items-center gap-2 max-w-xs">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                maxLength={6}
                placeholder="Enter Pincode"
                className="text-xs border-b-2 border-gray-300 focus:border-[#2874f0] outline-none py-1 px-1 w-36 font-semibold"
              />
              <button
                onClick={() => setPincodeChecked(true)}
                className="text-xs font-bold text-[#2874f0] hover:underline"
              >
                Check
              </button>
            </div>
            {pincodeChecked && (
              <div className="text-xs text-gray-700 space-y-1 pt-1">
                <p className="flex items-center gap-1.5 text-gray-900 font-medium">
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  <span>Delivery by <strong className="text-green-700">Tomorrow, 11 PM</strong> | <span className="line-through text-gray-400">₹40</span> <span className="text-green-700 font-bold">FREE</span></span>
                </p>
                <p className="text-[11px] text-gray-500">
                  Cash on Delivery available | 7 Days Replacement Policy
                </p>
              </div>
            )}
          </div>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="border-b border-gray-100 pb-4 space-y-2">
              <h4 className="text-xs font-bold uppercase text-gray-700 tracking-wider">
                Product Highlights
              </h4>
              <ul className="list-disc list-inside text-xs text-gray-700 space-y-1 marker:text-[#2874f0]">
                {highlights.map((h, i) => (
                  <li key={i} className="leading-relaxed">{h}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Specifications Table */}
          {Object.keys(specs).length > 0 && (
            <div className="border-b border-gray-100 pb-4 space-y-2">
              <h4 className="text-xs font-bold uppercase text-gray-700 tracking-wider">
                Specifications
              </h4>
              <div className="border border-gray-200 rounded divide-y divide-gray-200 text-xs">
                {Object.entries(specs).map(([key, val], i) => (
                  <div key={i} className="grid grid-cols-3 p-2.5">
                    <span className="text-gray-500 font-medium">{key}</span>
                    <span className="col-span-2 text-gray-800 font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ratings & Reviews */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-bold uppercase text-gray-900 tracking-wider">
              Ratings & Reviews
            </h4>

            {/* Score breakdown */}
            <div className="bg-gray-50 p-4 rounded border border-gray-200 grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
              <div className="text-center sm:border-r border-gray-200">
                <div className="text-4xl font-extrabold text-gray-900">{ratingNum.toFixed(1)} ★</div>
                <div className="text-xs text-gray-500 pt-1">
                  {product.rating_count?.toLocaleString()} Ratings & {product.review_count?.toLocaleString()} Reviews
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1 text-xs">
                {[
                  { star: 5, pct: '75%' },
                  { star: 4, pct: '18%' },
                  { star: 3, pct: '4%' },
                  { star: 2, pct: '2%' },
                  { star: 1, pct: '1%' },
                ].map((row) => (
                  <div key={row.star} className="flex items-center gap-2">
                    <span className="w-5 font-semibold text-gray-600">{row.star}★</span>
                    <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#388e3c] h-full" style={{ width: row.pct }} />
                    </div>
                    <span className="text-[10px] text-gray-500 w-8 text-right">{row.pct}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews List */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="space-y-3 pt-2">
                {product.reviews.map((rev) => (
                  <div key={rev.id} className="border-b border-gray-100 pb-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#388e3c] text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        {rev.rating} <Star className="w-2.5 h-2.5 fill-white" />
                      </span>
                      <span className="text-xs font-bold text-gray-900">{rev.title}</span>
                    </div>
                    <p className="text-xs text-gray-700">{rev.comment}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1">
                      <span className="font-semibold text-gray-600">{rev.user_name}</span>
                      {rev.verified_purchase && (
                        <span className="flex items-center gap-1 text-green-700 font-medium">
                          <Check className="w-3 h-3" /> Certified Buyer
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Similar Products Carousel */}
      {product.similarProducts && product.similarProducts.length > 0 && (
        <div className="bg-white rounded shadow-sm p-4 space-y-3">
          <h3 className="font-bold text-base text-gray-900 tracking-tight">
            Similar Products You Might Like
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {product.similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} onClick={onProductClick} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
