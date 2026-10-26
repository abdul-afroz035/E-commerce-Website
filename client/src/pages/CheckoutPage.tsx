import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../services/api';
import { PaymentModal } from '../components/Modals/PaymentModal';
import { Check, ShieldCheck, Plus, MapPin, Truck, ChevronDown } from 'lucide-react';
import { Address } from '../types';

interface CheckoutPageProps {
  onNavigate: (view: string, data?: any) => void;
  directItem?: any;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, directItem }) => {
  const { items, summary, refreshCart } = useCart();
  const { user, addresses, addAddress } = useAuth();

  const [activeStep, setActiveStep] = useState<number>(2); // 1 = Login, 2 = Address, 3 = Summary, 4 = Payment
  const [selectedAddressId, setSelectedAddressId] = useState<number>(
    addresses[0]?.id || 1
  );

  // New Address Form State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    pincode: '560001',
    locality: 'Indiranagar',
    address_line: 'Flat 402, Green Palm Residency',
    city: 'Bengaluru',
    state: 'Karnataka',
    address_type: 'HOME' as 'HOME' | 'WORK',
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Items to checkout: either direct item or cart items
  const checkoutItems = directItem ? [directItem] : items;
  const totalPayable = directItem
    ? parseFloat(directItem.price)
    : summary.finalAmount;

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await addAddress(newAddr);
      setSelectedAddressId(added.id);
      setShowAddAddress(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmPayment = async (paymentMethod: string) => {
    try {
      const res = await orderApi.createOrder({
        addressId: selectedAddressId,
        paymentMethod,
        items: directItem ? [directItem] : undefined,
      });

      await refreshCart();
      onNavigate('orders', { newOrderNumber: res.order.order_number });
    } catch (err) {
      console.error('Order creation error:', err);
      alert('Failed to place order. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: 4 Accordion Steps (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Step 1: LOGIN (Always Completed) */}
          <div className="bg-white rounded shadow-sm overflow-hidden">
            <div className="p-4 flex items-center justify-between bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase text-gray-500">LOGIN</span>
                    <Check className="w-4 h-4 text-[#2874f0] stroke-[3]" />
                  </div>
                  <p className="text-xs font-semibold text-gray-800">
                    {user?.name} <span className="text-gray-500">({user?.email})</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: DELIVERY ADDRESS */}
          <div className="bg-white rounded shadow-sm overflow-hidden">
            <div
              onClick={() => setActiveStep(2)}
              className={`p-4 flex items-center justify-between cursor-pointer ${
                activeStep === 2 ? 'bg-[#2874f0] text-white' : 'bg-gray-50 border-b border-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${
                    activeStep === 2 ? 'bg-white text-[#2874f0]' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  2
                </span>
                <span className="font-bold text-xs uppercase tracking-wider">
                  DELIVERY ADDRESS
                </span>
              </div>
              {activeStep !== 2 && (
                <button className="text-xs font-bold text-[#2874f0] border border-gray-300 px-3 py-1 rounded bg-white">
                  CHANGE
                </button>
              )}
            </div>

            {activeStep === 2 && (
              <div className="p-4 sm:p-6 space-y-4">
                {addresses.length === 0 ? (
                  <p className="text-xs text-gray-500">No saved addresses found. Please add an address.</p>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`block p-4 rounded border cursor-pointer transition ${
                          selectedAddressId === addr.id
                            ? 'border-[#2874f0] bg-blue-50/40 ring-1 ring-[#2874f0]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 text-[#2874f0] focus:ring-[#2874f0]"
                          />
                          <div className="flex-1 text-xs space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-gray-900">{addr.name}</span>
                              <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                                {addr.address_type}
                              </span>
                              <span className="font-bold text-gray-900">{addr.phone}</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              {addr.address_line}, {addr.locality}, {addr.city}, {addr.state} -{' '}
                              <strong>{addr.pincode}</strong>
                            </p>
                          </div>
                        </div>

                        {selectedAddressId === addr.id && (
                          <div className="pt-3 pl-7">
                            <button
                              type="button"
                              onClick={() => setActiveStep(3)}
                              className="bg-[#fb641b] hover:bg-[#e2530c] text-white font-extrabold text-xs py-2 px-6 rounded shadow transition"
                            >
                              DELIVER HERE
                            </button>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                )}

                {/* Add New Address Accordion */}
                {!showAddAddress ? (
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="flex items-center gap-2 text-xs font-bold text-[#2874f0] p-2 hover:bg-blue-50 rounded transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ADD A NEW ADDRESS</span>
                  </button>
                ) : (
                  <form onSubmit={handleSaveAddress} className="border border-blue-200 p-4 rounded bg-blue-50/30 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-gray-800">Add New Address</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <input
                        type="text"
                        required
                        placeholder="Name"
                        value={newAddr.name}
                        onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                        className="p-2 border rounded bg-white"
                      />
                      <input
                        type="text"
                        required
                        placeholder="10-digit mobile number"
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                        className="p-2 border rounded bg-white"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Pincode"
                        value={newAddr.pincode}
                        onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                        className="p-2 border rounded bg-white"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Locality"
                        value={newAddr.locality}
                        onChange={(e) => setNewAddr({ ...newAddr, locality: e.target.value })}
                        className="p-2 border rounded bg-white"
                      />
                    </div>
                    <textarea
                      required
                      placeholder="Address (Area and Street)"
                      value={newAddr.address_line}
                      onChange={(e) => setNewAddr({ ...newAddr, address_line: e.target.value })}
                      className="w-full text-xs p-2 border rounded bg-white"
                      rows={2}
                    />
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <input
                        type="text"
                        required
                        placeholder="City/District/Town"
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        className="p-2 border rounded bg-white"
                      />
                      <input
                        type="text"
                        required
                        placeholder="State"
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        className="p-2 border rounded bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        className="bg-[#2874f0] text-white font-bold text-xs px-5 py-2 rounded"
                      >
                        SAVE AND DELIVER HERE
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddAddress(false)}
                        className="text-xs text-gray-500 font-semibold"
                      >
                        CANCEL
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Step 3: ORDER SUMMARY */}
          <div className="bg-white rounded shadow-sm overflow-hidden">
            <div
              onClick={() => setActiveStep(3)}
              className={`p-4 flex items-center justify-between cursor-pointer ${
                activeStep === 3 ? 'bg-[#2874f0] text-white' : 'bg-gray-50 border-b border-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${
                    activeStep === 3 ? 'bg-white text-[#2874f0]' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  3
                </span>
                <span className="font-bold text-xs uppercase tracking-wider">
                  ORDER SUMMARY ({checkoutItems.length} {checkoutItems.length === 1 ? 'Item' : 'Items'})
                </span>
              </div>
            </div>

            {activeStep === 3 && (
              <div className="p-4 sm:p-6 space-y-4">
                <div className="divide-y divide-gray-200">
                  {checkoutItems.map((item: any) => (
                    <div key={item.id || item.product_id} className="py-3 flex gap-4 items-center">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-16 h-16 object-contain rounded border p-1"
                      />
                      <div className="flex-1 text-xs space-y-1">
                        <h4 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h4>
                        <p className="text-gray-500">Qty: {item.quantity}</p>
                        <p className="font-bold text-sm text-gray-900">
                          ₹{parseFloat(item.price).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right text-xs text-green-700 font-semibold">
                        Delivery in 2 Days
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Order confirmation email will be sent to <strong>{user?.email}</strong>
                  </p>
                  <button
                    onClick={() => setActiveStep(4)}
                    className="bg-[#fb641b] hover:bg-[#e2530c] text-white font-extrabold text-xs py-2.5 px-6 rounded shadow transition"
                  >
                    CONTINUE TO PAYMENT
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Step 4: PAYMENT OPTIONS */}
          <div className="bg-white rounded shadow-sm overflow-hidden">
            <div
              onClick={() => setActiveStep(4)}
              className={`p-4 flex items-center justify-between cursor-pointer ${
                activeStep === 4 ? 'bg-[#2874f0] text-white' : 'bg-gray-50 text-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${
                    activeStep === 4 ? 'bg-white text-[#2874f0]' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  4
                </span>
                <span className="font-bold text-xs uppercase tracking-wider">
                  PAYMENT OPTIONS
                </span>
              </div>
            </div>

            {activeStep === 4 && (
              <div className="p-6 text-center space-y-4">
                <p className="text-sm font-semibold text-gray-800">
                  Ready to pay ₹{totalPayable.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  Choose UPI QR, Credit/Debit Card, Net Banking, or Cash on Delivery.
                </p>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="bg-[#fb641b] hover:bg-[#e2530c] text-white font-extrabold text-sm py-3 px-8 rounded shadow-md transition"
                >
                  PROCEED TO PAY ₹{totalPayable.toLocaleString()}
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Summary Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4 sticky top-20">
          <div className="bg-white rounded shadow-sm p-4 divide-y divide-gray-200">
            <h3 className="font-bold text-xs uppercase text-gray-500 tracking-wider pb-3">
              PRICE DETAILS
            </h3>

            <div className="py-3 space-y-3 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Items ({checkoutItems.length})</span>
                <span>₹{totalPayable.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-gray-700">
                <span>Delivery Charges</span>
                <span className="text-[#388e3c] font-semibold">FREE</span>
              </div>
            </div>

            <div className="py-3 flex justify-between text-base font-extrabold text-gray-900 border-t border-dashed">
              <span>Total Payable</span>
              <span>₹{totalPayable.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-500">
            <ShieldCheck className="w-7 h-7 text-gray-400 flex-shrink-0" />
            <p>100% Safe and Secure Payments powered by ZapKart Gateway.</p>
          </div>
        </div>

      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={totalPayable}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
};
