import { Router, Response } from 'express';
import { query } from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get wishlist items
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await query(
      `SELECT w.id as wishlist_id, p.id as product_id, p.title, p.slug,
              p.brand, p.price, p.original_price, p.discount_percentage,
              p.rating, p.thumbnail, p.zap_assured
       FROM wishlist_items w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [userId]
    );

    res.json({ items: result.rows });
  } catch (error: any) {
    console.error('Fetch wishlist error:', error);
    res.status(500).json({ message: 'Internal server error fetching wishlist' });
  }
});

// Toggle wishlist (add if not present, remove if present)
router.post('/toggle', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const check = await query(
      'SELECT id FROM wishlist_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    if (check.rows.length > 0) {
      await query('DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2', [userId, productId]);
      return res.json({ message: 'Removed from Wishlist', inWishlist: false });
    } else {
      await query('INSERT INTO wishlist_items (user_id, product_id) VALUES ($1, $2)', [userId, productId]);
      return res.json({ message: 'Added to Wishlist', inWishlist: true });
    }
  } catch (error: any) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({ message: 'Internal server error updating wishlist' });
  }
});

export default router;
