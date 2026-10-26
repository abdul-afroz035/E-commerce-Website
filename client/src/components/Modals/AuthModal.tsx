import React, { useState } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegisterMode) {
        await register(name, email, password, phone);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login('afroz@zapkart.com', 'password123');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded overflow-hidden shadow-2xl max-w-2xl w-full grid grid-cols-1 md:grid-cols-5 relative">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-700 p-1 rounded-full z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Blue Flipkart Banner */}
        <div className="md:col-span-2 bg-[#2874f0] text-white p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-2xl font-bold">
              {isRegisterMode ? "Looks like you're new here!" : 'Login'}
            </h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              {isRegisterMode
                ? 'Sign up with your email to start shopping on ZapKart'
                : 'Get access to your Orders, Wishlist and Recommendations'}
            </p>
          </div>

          <div className="pt-8">
            <div className="bg-white/10 rounded-lg p-3 text-xs text-blue-100 border border-white/20">
              <span className="font-bold text-[#ffe11b]">⚡ ZapKart Plus:</span> Free & fast delivery, early access to Big Billion Days!
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="md:col-span-3 p-6 sm:p-8 flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2.5 bg-red-50 text-red-600 text-xs rounded border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isRegisterMode && (
              <div>
                <label className="text-xs font-semibold text-gray-600">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm border-b border-gray-300 py-1.5 focus:border-[#2874f0] outline-none"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-600">Email Address</label>
              <input
                type="email"
                required
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm border-b border-gray-300 py-1.5 focus:border-[#2874f0] outline-none"
              />
            </div>

            {isRegisterMode && (
              <div>
                <label className="text-xs font-semibold text-gray-600">Mobile Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-sm border-b border-gray-300 py-1.5 focus:border-[#2874f0] outline-none"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-600">Password</label>
              <input
                type="password"
                required
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm border-b border-gray-300 py-1.5 focus:border-[#2874f0] outline-none"
              />
            </div>

            <p className="text-[11px] text-gray-500 pt-1 leading-snug">
              By continuing, you agree to ZapKart's{' '}
              <span className="text-[#2874f0] cursor-pointer">Terms of Use</span> and{' '}
              <span className="text-[#2874f0] cursor-pointer">Privacy Policy</span>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#fb641b] hover:bg-[#e2530c] text-white font-bold text-sm py-2.5 rounded-sm shadow transition disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isRegisterMode ? 'CONTINUE' : 'LOGIN'}
            </button>
          </form>

          {/* Quick Demo Login Shortcut */}
          <div className="pt-4 border-t border-gray-100 mt-4 space-y-3">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full bg-blue-50 hover:bg-blue-100 text-[#2874f0] font-bold text-xs py-2 rounded-sm border border-blue-200 flex items-center justify-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>One-Click Demo Login (afroz@zapkart.com)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError(null);
              }}
              className="w-full text-center text-xs text-[#2874f0] font-bold hover:underline"
            >
              {isRegisterMode ? 'Existing User? Log in' : 'New to ZapKart? Create an account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
