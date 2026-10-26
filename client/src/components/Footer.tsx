import React from 'react';
import { ShieldCheck, HelpCircle, Award, Truck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#172337] text-white text-xs mt-12 border-t border-gray-700">
      {/* Top Feature Highlights */}
      <div className="border-b border-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center gap-1.5 p-2">
            <ShieldCheck className="w-6 h-6 text-[#ffe11b]" />
            <span className="font-bold">100% Authentic Products</span>
            <span className="text-[11px] text-gray-400">Directly from verified brands</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-2">
            <Truck className="w-6 h-6 text-[#ffe11b]" />
            <span className="font-bold">Fast & Free Delivery</span>
            <span className="text-[11px] text-gray-400">Over ₹500 orders across India</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-2">
            <Award className="w-6 h-6 text-[#ffe11b]" />
            <span className="font-bold">7-Day Easy Returns</span>
            <span className="text-[11px] text-gray-400">Hassle-free replacement guarantee</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-2">
            <HelpCircle className="w-6 h-6 text-[#ffe11b]" />
            <span className="font-bold">24x7 Customer Support</span>
            <span className="text-[11px] text-gray-400">Dedicated helpline & chat</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div>
          <h5 className="text-gray-400 uppercase font-semibold text-[11px] mb-3">ABOUT</h5>
          <ul className="space-y-1.5 text-gray-300">
            <li><a href="#" className="hover:underline">Contact Us</a></li>
            <li><a href="#" className="hover:underline">About ZapKart</a></li>
            <li><a href="#" className="hover:underline">Careers</a></li>
            <li><a href="#" className="hover:underline">ZapKart Stories</a></li>
            <li><a href="#" className="hover:underline">Corporate Information</a></li>
          </ul>
        </div>

        <div>
          <h5 className="text-gray-400 uppercase font-semibold text-[11px] mb-3">HELP</h5>
          <ul className="space-y-1.5 text-gray-300">
            <li><a href="#" className="hover:underline">Payments</a></li>
            <li><a href="#" className="hover:underline">Shipping</a></li>
            <li><a href="#" className="hover:underline">Cancellation & Returns</a></li>
            <li><a href="#" className="hover:underline">FAQ</a></li>
            <li><a href="#" className="hover:underline">Report Infringement</a></li>
          </ul>
        </div>

        <div>
          <h5 className="text-gray-400 uppercase font-semibold text-[11px] mb-3">CONSUMER POLICY</h5>
          <ul className="space-y-1.5 text-gray-300">
            <li><a href="#" className="hover:underline">Cancellation & Returns</a></li>
            <li><a href="#" className="hover:underline">Terms Of Use</a></li>
            <li><a href="#" className="hover:underline">Security</a></li>
            <li><a href="#" className="hover:underline">Privacy</a></li>
            <li><a href="#" className="hover:underline">Sitemap</a></li>
          </ul>
        </div>

        <div className="border-l border-gray-700 pl-6 text-gray-300 space-y-2">
          <h5 className="text-gray-400 uppercase font-semibold text-[11px] mb-1">Mail Us:</h5>
          <p className="text-[11px] leading-relaxed">
            ZapKart Internet Private Limited,<br />
            Buildings Alyssa, Begonia & Clove Embassy Tech Village,<br />
            Outer Ring Road, Devarabeesanahalli Village,<br />
            Bengaluru, 560103, Karnataka, India
          </p>
        </div>

        <div className="text-gray-300 space-y-2">
          <h5 className="text-gray-400 uppercase font-semibold text-[11px] mb-1">Registered Office:</h5>
          <p className="text-[11px] leading-relaxed">
            CIN: U51109KA2026PTC066107<br />
            Telephone: 044-45614700 / 044-67415800<br />
            India's Leading E-Commerce Marketplace
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 py-4 bg-[#0e1622]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-gray-400 text-[11px] gap-2">
          <div className="flex items-center gap-6">
            <span>⚡ Become a Seller</span>
            <span>Advertise</span>
            <span>Gift Cards</span>
            <span>Help Center</span>
          </div>
          <div>
            © 2026 ZapKart.com. All rights reserved. Built with React + Bun + Postgres + Redis + Express.
          </div>
        </div>
      </div>
    </footer>
  );
};
