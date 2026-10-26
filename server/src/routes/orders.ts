import { Router, Response } from 'express';
import { query } from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Helper to generate realistic tracking events based on status
function generateTrackingInfo(orderNumber: string, status: string, createdAt: Date) {
  const baseTime = new Date(createdAt).getTime();
  const awb = `ZK${orderNumber.slice(-8)}`;

  const events = [
    {
      title: 'Order Confirmed',
      description: 'Your order has been placed and confirmed by the seller.',
      time: new Date(baseTime).toLocaleString('en-IN'),
      location: 'ZapKart Online Marketplace',
      completed: true,
    },
  ];

  if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)) {
    events.push({
      title: 'Packed & Shipped',
      description: `Package packed & picked up by ZapKart Express Logistics (AWB: ${awb}).`,
      time: new Date(baseTime + 3600000 * 4).toLocaleString('en-IN'),
      location: 'Bengaluru Sort Facility, Karnataka',
      completed: true,
    });
  }

  if (['OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)) {
    events.push({
      title: 'Out for Delivery',
      description: 'Delivery associate Ramesh Kumar (+91 98765 43210) is out for delivery. Share Delivery OTP: 8492.',
      time: new Date(baseTime + 3600000 * 18).toLocaleString('en-IN'),
      location: 'Nearest Delivery Hub',
      completed: true,
    });
  }

  if (status === 'DELIVERED') {
    events.push({
      title: 'Delivered',
      description: 'Package delivered safely to recipient. Signed by Afroz.',
      time: new Date(baseTime + 3600000 * 24).toLocaleString('en-IN'),
      location: 'Doorstep Delivery',
      completed: true,
    });
  }

  if (status === 'CANCELLED') {
    events.push({
      title: 'Cancellation Confirmed',
      description: 'Order was successfully cancelled upon your request.',
      time: new Date().toLocaleString('en-IN'),
      location: 'Customer Self-Service',
      completed: true,
    });
    events.push({
      title: 'Refund Processed',
      description: 'Refund reference #REF' + orderNumber.slice(-6) + ' issued to original payment source (3-5 business days).',
      time: new Date().toLocaleString('en-IN'),
      location: 'Payment Gateway',
      completed: true,
    });
  }

  return {
    awb,
    courier: 'ZapKart Express Logistics',
    deliveryAgent: 'Ramesh Kumar (+91 98765 43210)',
    otp: '8492',
    currentStage: status,
    events,
  };
}

// Create Order (Checkout)
router.post('/create', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      addressId,
      paymentMethod = 'UPI',
      items, // optional override, otherwise loads from cart
    } = req.body;

    // 1. Get address
    const addressRes = await query('SELECT * FROM addresses WHERE id = $1 AND user_id = $2', [addressId, userId]);
    if (addressRes.rows.length === 0) {
      return res.status(400).json({ message: 'Valid delivery address is required' });
    }
    const shippingAddress = addressRes.rows[0];

    // 2. Fetch order items
    let checkoutItems: any[] = [];
    if (items && Array.isArray(items) && items.length > 0) {
      checkoutItems = items;
    } else {
      const cartRes = await query(
        `SELECT c.quantity, p.id as product_id, p.title, p.price, p.thumbnail, p.original_price
         FROM cart_items c
         JOIN products p ON c.product_id = p.id
         WHERE c.user_id = $1`,
        [userId]
      );
      if (cartRes.rows.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }
      checkoutItems = cartRes.rows;
    }

    // 3. Calculate order total
    let totalAmount = 0;
    let originalTotal = 0;
    for (const item of checkoutItems) {
      totalAmount += parseFloat(item.price) * item.quantity;
      originalTotal += (parseFloat(item.original_price) || parseFloat(item.price)) * item.quantity;
    }
    const discountAmount = originalTotal - totalAmount;
    const deliveryCharge = totalAmount > 500 ? 0 : 40;
    const finalAmount = totalAmount + deliveryCharge;

    // Generate Flipkart-style order ID: OD + timestamp + 4 random digits
    const orderNumber = `OD${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

    // Expected delivery: 3 days from now
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);

    const initialTracking = generateTrackingInfo(orderNumber, 'CONFIRMED', new Date());

    // Insert order
    const orderRes = await query(
      `INSERT INTO orders (
        user_id, order_number, total_amount, discount_amount, delivery_charge,
        payment_method, payment_status, order_status, shipping_address, expected_delivery_date,
        tracking_info
      ) VALUES ($1, $2, $3, $4, $5, $6, 'COMPLETED', 'CONFIRMED', $7, $8, $9)
      RETURNING *`,
      [
        userId,
        orderNumber,
        finalAmount,
        discountAmount,
        deliveryCharge,
        paymentMethod,
        JSON.stringify(shippingAddress),
        deliveryDate,
        JSON.stringify(initialTracking)
      ]
    );

    const order = orderRes.rows[0];

    // Insert order items
    for (const item of checkoutItems) {
      await query(
        `INSERT INTO order_items (order_id, product_id, title, thumbnail, price, quantity)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.product_id, item.title, item.thumbnail, item.price, item.quantity]
      );
    }

    // Clear cart if ordered from cart
    if (!items) {
      await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    }

    res.status(201).json({
      message: 'Order placed successfully! Congratulations.',
      order: {
        ...order,
        items: checkoutItems
      }
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Internal server error placing order' });
  }
});

// List User Orders
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const ordersRes = await query(
      `SELECT o.*, 
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'title', oi.title,
            'thumbnail', oi.thumbnail,
            'price', oi.price,
            'quantity', oi.quantity
          )
        ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId]
    );

    res.json({ orders: ordersRes.rows });
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ message: 'Internal server error fetching orders' });
  }
});

// Get Order Details / Tracking
router.get('/:orderNumber', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { orderNumber } = req.params;

    const orderRes = await query(
      `SELECT o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'title', oi.title,
            'thumbnail', oi.thumbnail,
            'price', oi.price,
            'quantity', oi.quantity
          )
        ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.order_number = $1 AND o.user_id = $2
       GROUP BY o.id`,
      [orderNumber, userId]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order: orderRes.rows[0] });
  } catch (error: any) {
    console.error('Fetch order detail error:', error);
    res.status(500).json({ message: 'Internal server error fetching order' });
  }
});

// Cancel Order
router.post('/:orderNumber/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { orderNumber } = req.params;
    const { reason = 'Order placed by mistake' } = req.body;

    // Check order exists & belongs to user
    const checkRes = await query(
      'SELECT id, order_status, payment_method, total_amount, created_at FROM orders WHERE order_number = $1 AND user_id = $2',
      [orderNumber, userId]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const currentOrder = checkRes.rows[0];

    if (currentOrder.order_status === 'CANCELLED') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    if (currentOrder.order_status === 'DELIVERED') {
      return res.status(400).json({ message: 'Delivered orders cannot be cancelled. You can initiate a return instead.' });
    }

    const cancellationTracking = generateTrackingInfo(orderNumber, 'CANCELLED', currentOrder.created_at);

    // Update order to cancelled
    const updateRes = await query(
      `UPDATE orders 
       SET order_status = 'CANCELLED',
           cancellation_reason = $1,
           cancelled_at = CURRENT_TIMESTAMP,
           payment_status = 'REFUND_PROCESSED',
           tracking_info = $2
       WHERE order_number = $3 AND user_id = $4
       RETURNING *`,
      [reason, JSON.stringify(cancellationTracking), orderNumber, userId]
    );

    // Fetch items to return full order object
    const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1', [currentOrder.id]);

    res.json({
      message: 'Order cancelled successfully. Refund of ₹' + currentOrder.total_amount + ' initiated.',
      order: {
        ...updateRes.rows[0],
        items: itemsRes.rows
      }
    });
  } catch (error: any) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Internal server error cancelling order' });
  }
});

// Update Order Status (for simulation / demo controls: CONFIRMED -> SHIPPED -> OUT_FOR_DELIVERY -> DELIVERED)
router.put('/:orderNumber/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { orderNumber } = req.params;
    const { status } = req.body;

    const validStatuses = ['CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const checkRes = await query(
      'SELECT id, created_at FROM orders WHERE order_number = $1 AND user_id = $2',
      [orderNumber, userId]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const currentOrder = checkRes.rows[0];
    const newTracking = generateTrackingInfo(orderNumber, status, currentOrder.created_at);

    const updateRes = await query(
      `UPDATE orders 
       SET order_status = $1,
           tracking_info = $2
       WHERE order_number = $3 AND user_id = $4
       RETURNING *`,
      [status, JSON.stringify(newTracking), orderNumber, userId]
    );

    const itemsRes = await query('SELECT * FROM order_items WHERE order_id = $1', [currentOrder.id]);

    res.json({
      message: `Order status updated to ${status}`,
      order: {
        ...updateRes.rows[0],
        items: itemsRes.rows
      }
    });
  } catch (error: any) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Internal server error updating order status' });
  }
});

export default router;
