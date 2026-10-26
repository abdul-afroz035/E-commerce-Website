import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { orderApi } from '../services/api';
import {
  Package,
  Truck,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  ArrowLeft,
  Download,
  ShieldCheck,
  AlertTriangle,
  Clock,
  MapPin,
  CreditCard,
  Phone,
  KeyRound,
  FileText,
  RotateCcw,
  Check,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

interface OrdersPageProps {
  onNavigate: (view: string, data?: any) => void;
  newOrderNumber?: string;
}

const cancelReasons = [
  'Expected delivery date is too long',
  'I want to change the delivery address',
  'Order placed by mistake / no longer needed',
  'Price of the item has dropped',
  'I want to change payment method',
  'Found a better deal elsewhere',
  'Other reasons',
];

export const OrdersPage: React.FC<OrdersPageProps> = ({ onNavigate, newOrderNumber }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Expanded order card IDs (accordion view on the list)
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<number>>(new Set());

  // Cancellation Modal State
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState(cancelReasons[0]);
  const [customReason, setCustomReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);

  // Status simulation state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getOrders();
      setOrders(res.orders);

      if (newOrderNumber) {
        const found = res.orders.find((o) => o.order_number === newOrderNumber);
        if (found) {
          setSelectedOrder(found);
          setExpandedOrderIds((prev) => new Set(prev).add(found.id));
        }
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandOrder = (orderId: number) => {
    setExpandedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const handleOpenCancelModal = (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCancellingOrder(order);
    setCancelReason(cancelReasons[0]);
    setCustomReason('');
    setCancelSuccessMsg(null);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    setIsCancelling(true);
    try {
      const finalReason = cancelReason === 'Other reasons' && customReason ? customReason : cancelReason;
      const res = await orderApi.cancelOrder(cancellingOrder.order_number, finalReason);

      setOrders((prev) =>
        prev.map((o) => (o.order_number === cancellingOrder.order_number ? res.order : o))
      );

      if (selectedOrder?.order_number === cancellingOrder.order_number) {
        setSelectedOrder(res.order);
      }

      setCancelSuccessMsg(res.message);
      setTimeout(() => {
        setCancellingOrder(null);
        setCancelSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSimulateStatus = async (orderNumber: string, nextStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await orderApi.updateOrderStatus(orderNumber, nextStatus);
      setOrders((prev) =>
        prev.map((o) => (o.order_number === orderNumber ? res.order : o))
      );
      if (selectedOrder?.order_number === orderNumber) {
        setSelectedOrder(res.order);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CANCELLED':
        return (
          <span className="bg-red-50 text-red-600 border border-red-200 px-2.5 py-0.5 rounded text-xs font-bold inline-flex items-center gap-1">
            <X className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded text-xs font-bold inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded text-xs font-bold inline-flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" /> Out for Delivery
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded text-xs font-bold inline-flex items-center gap-1">
            <Package className="w-3.5 h-3.5" /> Shipped
          </span>
        );
      default:
        return (
          <span className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded text-xs font-bold inline-flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-xs text-gray-500">
            View detailed order status, live delivery updates, invoices, and order cancellation
          </p>
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
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded p-6 shadow-sm animate-pulse space-y-4">
              <div className="bg-gray-200 h-4 rounded w-1/4" />
              <div className="bg-gray-200 h-16 rounded" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded shadow-sm p-12 text-center space-y-4">
          <Package className="w-16 h-16 text-gray-400 mx-auto" />
          <h3 className="text-lg font-bold text-gray-800">You have no orders yet!</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Once you place an order on ZapKart, it will appear here with live tracking and cancellation options.
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-[#2874f0] text-white font-bold text-xs px-6 py-2.5 rounded shadow-sm hover:bg-[#1a56bc]"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderIds.has(order.id);
            const isCancelled = order.order_status === 'CANCELLED';
            const isDelivered = order.order_status === 'DELIVERED';
            const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const items = Array.isArray(order.items) ? order.items : [];
            const shippingAddr =
              typeof order.shipping_address === 'string'
                ? JSON.parse(order.shipping_address)
                : order.shipping_address;

            // Tracking info parse
            const tracking =
              typeof order.tracking_info === 'string'
                ? JSON.parse(order.tracking_info)
                : order.tracking_info;

            return (
              <div
                key={order.id}
                className={`bg-white rounded shadow-sm border transition-all duration-200 overflow-hidden ${
                  isCancelled ? 'border-red-200' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {/* Order Top Bar */}
                <div className="bg-gray-50/80 p-4 border-b border-gray-100 flex flex-wrap items-center justify-between text-xs gap-3">
                  <div className="flex flex-wrap items-center gap-6">
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                        ORDER PLACED
                      </span>
                      <span className="font-bold text-gray-800">{orderDate}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                        TOTAL AMOUNT
                      </span>
                      <span className="font-bold text-gray-900">
                        ₹{parseFloat(order.total_amount as string).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                        SHIP TO
                      </span>
                      <span className="font-bold text-[#2874f0]">{shippingAddr?.name || 'Afroz Shopper'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                        STATUS
                      </span>
                      {getStatusBadge(order.order_status)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-gray-500 font-mono text-[11px] hidden sm:inline">
                      #{order.order_number}
                    </span>

                    {/* Expand/Collapse Tray Toggle */}
                    <button
                      onClick={() => toggleExpandOrder(order.id)}
                      className="bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-xs font-bold text-gray-700 shadow-sm flex items-center gap-1.5"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Status'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Full Status Window Modal Trigger */}
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="bg-[#2874f0] hover:bg-[#1a56bc] text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Expand Window</span>
                    </button>
                  </div>
                </div>

                {/* Main Order Items Preview */}
                <div className="p-4 sm:p-6 divide-y divide-gray-100">
                  {items.map((item, idx) => (
                    <div key={idx} className="py-3 flex flex-wrap sm:flex-nowrap items-center gap-4">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-16 h-16 object-contain rounded border p-1 bg-white"
                      />
                      <div className="flex-1 text-xs space-y-1">
                        <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.title}</h4>
                        <p className="text-gray-500">Qty: {item.quantity}</p>
                        <p className="font-bold text-gray-900">
                          ₹{parseFloat(item.price as string).toLocaleString()}
                        </p>
                      </div>

                      {/* Delivery Status Column */}
                      <div className="text-right text-xs space-y-1 min-w-[150px]">
                        {isCancelled ? (
                          <div className="text-red-600 font-bold flex items-center gap-1 justify-end">
                            <X className="w-4 h-4" />
                            <span>Order Cancelled</span>
                          </div>
                        ) : isDelivered ? (
                          <div className="text-green-700 font-bold flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-4 h-4 fill-green-700 text-white" />
                            <span>Delivered</span>
                          </div>
                        ) : (
                          <div className="text-green-700 font-bold flex items-center gap-1 justify-end">
                            <Truck className="w-4 h-4" />
                            <span>Delivery Expected</span>
                          </div>
                        )}

                        <p className="text-[11px] text-gray-500">
                          {isCancelled
                            ? 'Refund Processed'
                            : `By ${new Date(Date.now() + 2 * 86400000).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                              })}`}
                        </p>

                        {/* In-Card Quick Actions */}
                        <div className="pt-1 flex items-center justify-end gap-2">
                          {!isCancelled && !isDelivered && (
                            <button
                              onClick={(e) => handleOpenCancelModal(order, e)}
                              className="text-xs text-red-600 font-bold hover:underline"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ============================================================== */}
                {/* EXPANDED IN-CARD ORDER STATUS & TRACKING TRAY */}
                {/* ============================================================== */}
                {isExpanded && (
                  <div className="bg-blue-50/30 border-t border-gray-200 p-5 space-y-6 animate-fade-in">
                    
                    {/* Cancellation Alert Banner */}
                    {isCancelled && (
                      <div className="bg-red-50 border border-red-200 rounded p-4 text-xs text-red-800 space-y-1">
                        <div className="flex items-center gap-2 font-bold text-sm text-red-700">
                          <AlertTriangle className="w-4 h-4" />
                          <span>This order was cancelled</span>
                        </div>
                        <p>
                          <strong>Reason:</strong> {order.cancellation_reason || 'Cancelled by buyer'}
                        </p>
                        <p className="text-gray-600">
                          A refund of <strong>₹{parseFloat(order.total_amount as string).toLocaleString()}</strong> was credited back to your {order.payment_method} account.
                        </p>
                      </div>
                    )}

                    {/* Order Visual Stage Bar */}
                    <div className="bg-white p-4 rounded border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs uppercase text-gray-700 tracking-wider flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-[#2874f0]" />
                          <span>Live Status Tracker</span>
                        </h4>
                        <span className="text-[11px] text-gray-500 font-mono">
                          AWB: {tracking?.awb || `ZK${order.order_number.slice(-8)}`}
                        </span>
                      </div>

                      {/* Horizontal Step Diagram */}
                      <div className="grid grid-cols-4 gap-2 text-center text-xs relative pt-2">
                        {/* Step 1: Confirmed */}
                        <div className="space-y-1.5 flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            !isCancelled ? 'bg-green-600 text-white shadow' : 'bg-gray-200 text-gray-600'
                          }`}>
                            <Check className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-gray-800 text-[11px]">Ordered</span>
                          <span className="text-[10px] text-gray-500">{orderDate}</span>
                        </div>

                        {/* Step 2: Shipped */}
                        <div className="space-y-1.5 flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            !isCancelled && ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.order_status)
                              ? 'bg-green-600 text-white shadow'
                              : 'bg-gray-200 text-gray-400'
                          }`}>
                            <Package className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-gray-800 text-[11px]">Shipped</span>
                          <span className="text-[10px] text-gray-500">ZapKart Express</span>
                        </div>

                        {/* Step 3: Out for Delivery */}
                        <div className="space-y-1.5 flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            !isCancelled && ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.order_status)
                              ? 'bg-green-600 text-white shadow'
                              : 'bg-gray-200 text-gray-400'
                          }`}>
                            <Truck className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-gray-800 text-[11px]">Out for Delivery</span>
                          <span className="text-[10px] text-gray-500">OTP: 8492</span>
                        </div>

                        {/* Step 4: Delivered or Cancelled */}
                        <div className="space-y-1.5 flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            isCancelled
                              ? 'bg-red-600 text-white shadow'
                              : order.order_status === 'DELIVERED'
                              ? 'bg-green-600 text-white shadow'
                              : 'bg-gray-200 text-gray-400'
                          }`}>
                            {isCancelled ? <X className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </div>
                          <span className="font-bold text-gray-800 text-[11px]">
                            {isCancelled ? 'Cancelled' : 'Delivered'}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {isCancelled ? 'Refund Complete' : 'Doorstep'}
                          </span>
                        </div>
                      </div>

                      {/* Delivery Agent / OTP Badge */}
                      {!isCancelled && (
                        <div className="bg-amber-50 border border-amber-200 p-2.5 rounded text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2 mt-2">
                          <div className="flex items-center gap-2">
                            <KeyRound className="w-4 h-4 text-amber-700" />
                            <span><strong>Delivery OTP: 8492</strong> (Share with courier at delivery)</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Phone className="w-3.5 h-3.5 text-gray-500" />
                            <span>Agent: Ramesh Kumar (+91 98765 43210)</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Details Grid: Address, Payment & Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Shipping Address Box */}
                      <div className="bg-white p-3.5 rounded border border-gray-200 space-y-1.5">
                        <div className="flex items-center gap-1 font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-[#2874f0]" />
                          <span>Delivery Address</span>
                        </div>
                        <p className="font-bold text-gray-900">{shippingAddr?.name}</p>
                        <p className="text-gray-600 leading-relaxed">
                          {shippingAddr?.address_line}, {shippingAddr?.locality}, {shippingAddr?.city}, {shippingAddr?.state} - {shippingAddr?.pincode}
                        </p>
                        <p className="text-gray-500">Phone: {shippingAddr?.phone}</p>
                      </div>

                      {/* Payment Summary Box */}
                      <div className="bg-white p-3.5 rounded border border-gray-200 space-y-1.5">
                        <div className="flex items-center gap-1 font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                          <CreditCard className="w-3.5 h-3.5 text-[#2874f0]" />
                          <span>Payment Information</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Payment Mode:</span>
                          <span className="font-bold text-gray-800">{order.payment_method}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Payment Status:</span>
                          <span className={`font-bold ${isCancelled ? 'text-blue-600' : 'text-green-700'}`}>
                            {order.payment_status}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-100 pt-1">
                          <span className="font-bold text-gray-900">Total Paid:</span>
                          <span className="font-bold text-[#2874f0] text-sm">
                            ₹{parseFloat(order.total_amount as string).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Interactive Controls & Cancellation Box */}
                      <div className="bg-white p-3.5 rounded border border-gray-200 space-y-2.5 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <span className="font-bold text-gray-700 uppercase tracking-wider text-[11px] block">
                            Order Management
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {/* Simulation buttons to test status progression */}
                            <button
                              onClick={() => handleSimulateStatus(order.order_number, 'SHIPPED')}
                              disabled={isUpdatingStatus || isCancelled}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-1 rounded disabled:opacity-40"
                            >
                              → Set Shipped
                            </button>
                            <button
                              onClick={() => handleSimulateStatus(order.order_number, 'OUT_FOR_DELIVERY')}
                              disabled={isUpdatingStatus || isCancelled}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-1 rounded disabled:opacity-40"
                            >
                              → Set Out for Delivery
                            </button>
                            <button
                              onClick={() => handleSimulateStatus(order.order_number, 'DELIVERED')}
                              disabled={isUpdatingStatus || isCancelled}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-1 rounded disabled:opacity-40"
                            >
                              → Set Delivered
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          {!isCancelled && !isDelivered && (
                            <button
                              onClick={(e) => handleOpenCancelModal(order, e)}
                              className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs py-1.5 rounded transition text-center"
                            >
                              Cancel Order
                            </button>
                          )}
                          <button
                            onClick={() => alert(`Downloading Tax Invoice for ${order.order_number}...`)}
                            className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 font-semibold text-xs py-1.5 px-3 rounded flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Invoice</span>
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* EXPANDED FULL ORDER STATUS WINDOW MODAL */}
      {/* ============================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative border border-gray-200">
            
            {/* Modal Header */}
            <div className="bg-[#2874f0] text-white p-5 sticky top-0 z-20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-[#ffe11b]" />
                <div>
                  <h3 className="font-bold text-base sm:text-lg">Expanded Order Status Window</h3>
                  <p className="text-xs text-blue-100 font-mono">
                    Order ID: {selectedOrder.order_number}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-white hover:text-gray-200 p-1.5 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Header Strip */}
              <div className="flex flex-wrap items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 gap-2">
                <div>
                  <span className="text-xs text-gray-500 font-medium block">Current Status</span>
                  <div className="pt-0.5">{getStatusBadge(selectedOrder.order_status)}</div>
                </div>

                <div>
                  <span className="text-xs text-gray-500 font-medium block">Expected Delivery</span>
                  <span className="font-bold text-sm text-gray-900">
                    {selectedOrder.order_status === 'CANCELLED'
                      ? 'N/A (Order Cancelled)'
                      : new Date(Date.now() + 2 * 86400000).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-500 font-medium block">Total Payable</span>
                  <span className="font-black text-base text-[#2874f0]">
                    ₹{parseFloat(selectedOrder.total_amount as string).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Cancellation Reason Notice */}
              {selectedOrder.order_status === 'CANCELLED' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-xs text-red-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-red-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Order Cancelled</span>
                  </div>
                  <p>
                    <strong>Reason for Cancellation:</strong> {selectedOrder.cancellation_reason || 'Buyer requested cancellation'}
                  </p>
                  <p className="text-gray-600">
                    Refund of <strong>₹{parseFloat(selectedOrder.total_amount as string).toLocaleString()}</strong> was initiated to original payment source ({selectedOrder.payment_method}). Reference ID: #REF{selectedOrder.order_number.slice(-6)}.
                  </p>
                </div>
              )}

              {/* Comprehensive Stage Timeline */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-gray-900 tracking-tight flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2874f0]" />
                  <span>Delivery Journey & Event Log</span>
                </h4>

                <div className="relative border-l-2 border-[#2874f0] ml-4 space-y-6 py-2">
                  {/* Event 1: Confirmed */}
                  <div className="relative pl-6">
                    <span className="absolute -left-2 top-0.5 w-4 h-4 rounded-full bg-[#2874f0] ring-4 ring-blue-100 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    </span>
                    <h5 className="font-bold text-xs text-gray-900">Order Confirmed & Payment Verified</h5>
                    <p className="text-[11px] text-gray-500">
                      {new Date(selectedOrder.created_at).toLocaleString('en-IN')} | ZapKart Central Server
                    </p>
                  </div>

                  {/* Event 2: Shipped */}
                  <div className="relative pl-6">
                    <span
                      className={`absolute -left-2 top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                        selectedOrder.order_status !== 'CANCELLED' &&
                        ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.order_status)
                          ? 'bg-[#2874f0] ring-4 ring-blue-100 text-white'
                          : 'bg-gray-300'
                      }`}
                    >
                      {['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.order_status) ? (
                        <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                      ) : null}
                    </span>
                    <h5 className="font-bold text-xs text-gray-900">Packed & Dispatched</h5>
                    <p className="text-[11px] text-gray-500">
                      ZapKart Sort Facility, Bengaluru | Courier: ZapKart Express Logistics (AWB: ZK{selectedOrder.order_number.slice(-8)})
                    </p>
                  </div>

                  {/* Event 3: Out for delivery */}
                  <div className="relative pl-6">
                    <span
                      className={`absolute -left-2 top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                        selectedOrder.order_status !== 'CANCELLED' &&
                        ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.order_status)
                          ? 'bg-[#2874f0] ring-4 ring-blue-100 text-white'
                          : 'bg-gray-300'
                      }`}
                    >
                      {['OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.order_status) ? (
                        <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                      ) : null}
                    </span>
                    <h5 className="font-bold text-xs text-gray-900">Out for Delivery</h5>
                    <p className="text-[11px] text-gray-500">
                      Agent assigned: Ramesh Kumar (+91 98765 43210) | Share Delivery OTP: <strong>8492</strong>
                    </p>
                  </div>

                  {/* Event 4: Delivered or Cancelled */}
                  <div className="relative pl-6">
                    <span
                      className={`absolute -left-2 top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                        selectedOrder.order_status === 'CANCELLED'
                          ? 'bg-red-600 ring-4 ring-red-100 text-white'
                          : selectedOrder.order_status === 'DELIVERED'
                          ? 'bg-green-600 ring-4 ring-green-100 text-white'
                          : 'bg-gray-300'
                      }`}
                    >
                      {selectedOrder.order_status === 'CANCELLED' ? (
                        <X className="w-2.5 h-2.5 stroke-[3]" />
                      ) : selectedOrder.order_status === 'DELIVERED' ? (
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      ) : null}
                    </span>
                    <h5 className="font-bold text-xs text-gray-900">
                      {selectedOrder.order_status === 'CANCELLED' ? 'Cancellation Completed' : 'Delivered'}
                    </h5>
                    <p className="text-[11px] text-gray-500">
                      {selectedOrder.order_status === 'CANCELLED'
                        ? 'Refund issued to source bank account'
                        : selectedOrder.order_status === 'DELIVERED'
                        ? 'Package safely handed over to recipient'
                        : 'Awaiting courier delivery completion'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items List in this Order */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-gray-900 tracking-tight">
                  Ordered Items ({selectedOrder.items?.length || 0})
                </h4>
                <div className="border border-gray-200 rounded divide-y divide-gray-100">
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <div key={i} className="p-3 flex items-center gap-4 text-xs">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-14 h-14 object-contain rounded border p-1"
                      />
                      <div className="flex-1 space-y-0.5">
                        <p className="font-bold text-gray-900">{item.title}</p>
                        <p className="text-gray-500">Qty: {item.quantity}</p>
                        <p className="font-bold text-gray-800">
                          ₹{parseFloat(item.price).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => alert(`Invoice downloaded for ${item.title}`)}
                        className="text-xs text-[#2874f0] font-bold hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address & Payment Summary Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-1">
                  <h5 className="font-bold text-gray-800 uppercase text-[11px]">Shipping Details</h5>
                  <p className="font-bold text-gray-900">
                    {typeof selectedOrder.shipping_address === 'string'
                      ? JSON.parse(selectedOrder.shipping_address).name
                      : selectedOrder.shipping_address?.name}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {typeof selectedOrder.shipping_address === 'string'
                      ? JSON.parse(selectedOrder.shipping_address).address_line
                      : selectedOrder.shipping_address?.address_line}
                  </p>
                  <p className="text-gray-500">
                    Phone:{' '}
                    {typeof selectedOrder.shipping_address === 'string'
                      ? JSON.parse(selectedOrder.shipping_address).phone
                      : selectedOrder.shipping_address?.phone}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-1.5">
                  <h5 className="font-bold text-gray-800 uppercase text-[11px]">Payment Summary</h5>
                  <div className="flex justify-between text-gray-600">
                    <span>Payment Method</span>
                    <span className="font-bold text-gray-800">{selectedOrder.payment_method}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charge</span>
                    <span className="font-bold text-green-700">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-900 font-bold border-t border-gray-200 pt-1">
                    <span>Total Amount</span>
                    <span className="text-[#2874f0] font-black">
                      ₹{parseFloat(selectedOrder.total_amount as string).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Simulation Bar */}
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900">⚡ Status Simulator (Demo Controls):</span>
                  <span className="text-[11px] text-blue-700">Change status to test tracking:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleSimulateStatus(selectedOrder.order_number, st)}
                      disabled={isUpdatingStatus || selectedOrder.order_status === 'CANCELLED'}
                      className={`px-3 py-1 rounded text-xs font-bold transition disabled:opacity-50 ${
                        selectedOrder.order_status === st
                          ? 'bg-[#2874f0] text-white shadow'
                          : 'bg-white border border-blue-300 text-blue-800 hover:bg-blue-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex flex-wrap items-center justify-between border-t border-gray-100 pt-4 gap-3">
                {selectedOrder.order_status !== 'CANCELLED' && selectedOrder.order_status !== 'DELIVERED' ? (
                  <button
                    onClick={() => handleOpenCancelModal(selectedOrder)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-300 font-bold text-xs px-4 py-2 rounded transition flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel Order</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => alert(`Invoice downloaded for Order #${selectedOrder.order_number}`)}
                    className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Invoice</span>
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="bg-[#2874f0] hover:bg-[#1a56bc] text-white font-bold text-xs px-6 py-2 rounded"
                  >
                    Close Window
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CANCELLATION REASON & CONFIRMATION MODAL */}
      {/* ============================================================== */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 relative space-y-5 border border-gray-200">
            <button
              onClick={() => setCancellingOrder(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {cancelSuccessMsg ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto animate-bounce" />
                <h3 className="font-bold text-lg text-gray-900">Order Cancelled Successfully!</h3>
                <p className="text-xs text-gray-600">{cancelSuccessMsg}</p>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="font-bold text-lg text-gray-900">Cancel Order</h3>
                  </div>
                  <p className="text-xs text-gray-500">
                    Are you sure you want to cancel Order <strong>#{cancellingOrder.order_number}</strong>?
                  </p>
                </div>

                {/* Reason Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Please select a reason for cancellation:
                  </label>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {cancelReasons.map((reason) => (
                      <label
                        key={reason}
                        className={`flex items-center gap-2.5 p-2.5 rounded border text-xs cursor-pointer transition ${
                          cancelReason === reason
                            ? 'border-[#2874f0] bg-blue-50/50 text-[#2874f0] font-semibold ring-1 ring-[#2874f0]'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="cancelReason"
                          checked={cancelReason === reason}
                          onChange={() => setCancelReason(reason)}
                          className="text-[#2874f0]"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>

                  {cancelReason === 'Other reasons' && (
                    <div className="pt-2">
                      <textarea
                        rows={2}
                        placeholder="Please specify your reason..."
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        className="w-full text-xs p-2 border border-gray-300 rounded focus:border-[#2874f0] outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Refund Notice */}
                <div className="bg-gray-50 border border-gray-200 p-3 rounded text-xs space-y-1">
                  <span className="font-bold text-gray-800">Refund Status Notice:</span>
                  <p className="text-gray-600 leading-relaxed">
                    Refund of <strong>₹{parseFloat(cancellingOrder.total_amount as string).toLocaleString()}</strong> will be automatically credited back to your {cancellingOrder.payment_method} account within 24 to 48 hours.
                  </p>
                </div>

                {/* Modal Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCancellingOrder(null)}
                    disabled={isCancelling}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Don't Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCancel}
                    disabled={isCancelling}
                    className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-5 py-2.5 rounded shadow transition disabled:opacity-50"
                  >
                    {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
