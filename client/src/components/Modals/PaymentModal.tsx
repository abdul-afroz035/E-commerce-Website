import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, QrCode, CreditCard, Banknote, Building2, Lock } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onConfirmPayment: (method: string) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  onConfirmPayment,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'COD'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePay = async () => {
    setLoading(true);
    try {
      await onConfirmPayment(selectedMethod);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded shadow-2xl max-w-lg w-full overflow-hidden relative border border-gray-200">
        
        {/* Header */}
        <div className="bg-[#2874f0] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#ffe11b]" />
            <h3 className="font-bold text-base">ZapKart Safe & Secure Payment</h3>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
            <h4 className="text-xl font-bold text-gray-900">Payment Successful!</h4>
            <p className="text-sm text-gray-600">
              ₹{totalAmount.toLocaleString()} paid successfully. Generating order details...
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Amount Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Total Payable</p>
                <p className="text-xl font-bold text-[#2874f0]">₹{totalAmount.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Lock className="w-3.5 h-3.5 text-green-600" />
                <span>256-Bit SSL Encrypted</span>
              </div>
            </div>

            {/* Payment Methods Tabs */}
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('UPI')}
                className={`p-2.5 rounded text-center border transition flex flex-col items-center gap-1 ${
                  selectedMethod === 'UPI'
                    ? 'border-[#2874f0] bg-blue-50/50 text-[#2874f0] font-bold'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 text-xs'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-xs">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('CARD')}
                className={`p-2.5 rounded text-center border transition flex flex-col items-center gap-1 ${
                  selectedMethod === 'CARD'
                    ? 'border-[#2874f0] bg-blue-50/50 text-[#2874f0] font-bold'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 text-xs'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">Card</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('NETBANKING')}
                className={`p-2.5 rounded text-center border transition flex flex-col items-center gap-1 ${
                  selectedMethod === 'NETBANKING'
                    ? 'border-[#2874f0] bg-blue-50/50 text-[#2874f0] font-bold'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 text-xs'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="text-xs">NetBanking</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('COD')}
                className={`p-2.5 rounded text-center border transition flex flex-col items-center gap-1 ${
                  selectedMethod === 'COD'
                    ? 'border-[#2874f0] bg-blue-50/50 text-[#2874f0] font-bold'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 text-xs'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-xs">Cash (COD)</span>
              </button>
            </div>

            {/* Selected Method Content */}
            <div className="border border-gray-100 rounded p-4 bg-gray-50/50">
              {selectedMethod === 'UPI' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-700">Scan QR Code or enter UPI ID</p>
                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">Fastest</span>
                  </div>

                  <div className="flex items-center gap-4 bg-white p-3 rounded border border-gray-200">
                    <div className="w-20 h-20 bg-gray-100 border border-gray-300 rounded flex items-center justify-center p-1">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=zapkart@upi&am=1000"
                        alt="UPI QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p className="font-semibold text-gray-800">Scan with any UPI App</p>
                      <p>PhonePe, Google Pay, Paytm, BHIM</p>
                      <p className="text-[11px] text-blue-600">UPI ID: zapkart@axisbank</p>
                    </div>
                  </div>

                  <div className="pt-1">
                    <input
                      type="text"
                      placeholder="e.g. yourname@oksbi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full text-xs p-2 border border-gray-300 rounded focus:border-[#2874f0] outline-none bg-white"
                    />
                  </div>
                </div>
              )}

              {selectedMethod === 'CARD' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Card Number</label>
                    <input
                      type="text"
                      placeholder="4532 •••• •••• 8892"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                      className="w-full text-xs p-2 border border-gray-300 rounded focus:border-[#2874f0] outline-none bg-white mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Valid Thru (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        maxLength={5}
                        className="w-full text-xs p-2 border border-gray-300 rounded focus:border-[#2874f0] outline-none bg-white mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        maxLength={4}
                        className="w-full text-xs p-2 border border-gray-300 rounded focus:border-[#2874f0] outline-none bg-white mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'NETBANKING' && (
                <div className="space-y-2 text-xs">
                  <p className="font-semibold text-gray-700">Select Popular Banks:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank'].map((bank) => (
                      <label key={bank} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200 cursor-pointer">
                        <input type="radio" name="bank" defaultChecked={bank === 'HDFC Bank'} />
                        <span className="font-medium">{bank}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {selectedMethod === 'COD' && (
                <div className="text-xs text-gray-700 space-y-2">
                  <p className="font-semibold">Cash on Delivery available for your address.</p>
                  <p className="text-gray-500">
                    Pay with Cash or UPI QR at your doorstep upon delivery.
                  </p>
                </div>
              )}
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-[#fb641b] hover:bg-[#e2530c] text-white font-extrabold text-sm py-3 rounded shadow transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Processing Payment...</span>
              ) : (
                <span>PAY ₹{totalAmount.toLocaleString()} & PLACE ORDER</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
