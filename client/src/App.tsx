import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { CategoryBar } from './components/CategoryBar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/Modals/AuthModal';
import { HomePage } from './pages/HomePage';
import { ProductListingPage } from './pages/ProductListingPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { WishlistPage } from './pages/WishlistPage';
import { Product } from './types';

export function AppContent() {
  const [currentView, setCurrentView] = useState<'home' | 'products' | 'product-detail' | 'cart' | 'checkout' | 'orders' | 'wishlist'>('home');
  const [viewData, setViewData] = useState<any>({});

  const handleNavigate = (view: string, data?: any) => {
    setCurrentView(view as any);
    setViewData(data || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (product: Product) => {
    handleNavigate('product-detail', { id: product.id, slug: product.slug });
  };

  const handleSelectCategory = (slug: string) => {
    if (!slug) {
      handleNavigate('products', {});
    } else {
      handleNavigate('products', { category: slug });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f2f4] text-[#212121]">
      {/* Flipkart Header */}
      <Navbar
        onNavigate={handleNavigate}
        currentSearch={viewData.q || ''}
      />

      {/* Category Bar (visible on home & listing) */}
      {(currentView === 'home' || currentView === 'products') && (
        <CategoryBar
          onSelectCategory={handleSelectCategory}
          activeCategory={viewData.category}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onProductClick={handleProductClick}
          />
        )}

        {currentView === 'products' && (
          <ProductListingPage
            key={`${viewData.category || ''}-${viewData.q || ''}`}
            initialCategory={viewData.category}
            initialQuery={viewData.q}
            onProductClick={handleProductClick}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'product-detail' && (
          <ProductDetailPage
            productIdOrSlug={viewData.id || viewData.slug}
            onNavigate={handleNavigate}
            onProductClick={handleProductClick}
          />
        )}

        {currentView === 'cart' && (
          <CartPage onNavigate={handleNavigate} />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onNavigate={handleNavigate}
            directItem={viewData.directItem}
          />
        )}

        {currentView === 'orders' && (
          <OrdersPage
            onNavigate={handleNavigate}
            newOrderNumber={viewData.newOrderNumber}
          />
        )}

        {currentView === 'wishlist' && (
          <WishlistPage
            onNavigate={handleNavigate}
            onProductClick={handleProductClick}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Auth Modal */}
      <AuthModal />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
