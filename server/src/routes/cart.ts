import { Router, Response } from 'express';
import { query } from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get cart items for logged in user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const cartRes = await query(
      `SELECT c.id as cart_item_id, c.quantity, p.id as product_id, p.title,
              p.slug, p.brand, p.price, p.original_price, p.discount_percentage,
              p.thumbnail, p.stock, p.zap_assured
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    );

    let totalAmount = 0;
    let originalTotal = 0;
    let totalDiscount = 0;

    cartRes.rows.forEach(item => {
      const price = parseFloat(item.price);
      const origPrice = parseFloat(item.original_price);
      const qty = item.quantity;

      totalAmount += price * qty;
      originalTotal += origPrice * qty;
    });

    totalDiscount = originalTotal - totalAmount;
    const deliveryFee = totalAmount > 500 || cartRes.rows.length === 0 ? 0 : 40;

    res.json({
      items: cartRes.rows,
      summary: {
        itemCount: cartRes.rows.reduce((sum, item) => sum + item.quantity, 0),
        originalTotal,
        totalDiscount,
        deliveryFee,
        finalAmount: totalAmount + deliveryFee
      }
    });
  } catch (error: any) {
    console.error('Fetch cart error:', error);
    res.status(500).json({ message: 'Internal server error fetching cart' });
  }
});

// Add to cart or increment
router.post('/add', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const result = await query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
       RETURNING *`,
      [userId, productId, quantity]
    );

    res.status(200).json({
      message: 'Product added to cart',
      item: result.rows[0]
    });
  } catch (error: any) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Internal server error adding to cart' });
  }
});

// Update quantity
router.put('/update', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    if (quantity <= 0) {
      await query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [userId, productId]);
      return res.json({ message: 'Item removed from cart' });
    }

    const result = await query(
      `UPDATE cart_items 
       SET quantity = $1
       WHERE user_id = $2 AND product_id = $3
       RETURNING *`,
      [quantity, userId, productId]
    );

    res.json({ message: 'Cart updated', item: result.rows[0] });
  } catch (error: any) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Internal server error updating cart' });
  }
});

// Remove single item
router.delete('/:productId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;

    await query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [userId, productId]);
    res.json({ message: 'Item removed from cart' });
  } catch (error: any) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ message: 'Internal server error removing cart item' });
  }
});

export default router;
