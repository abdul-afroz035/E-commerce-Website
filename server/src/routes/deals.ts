import { Router, Request, Response } from 'express';
import { query } from '../config/db';
import { cache } from '../config/redis';

const router = Router();
const CACHE_KEY_DEALS = 'zapkart:deals:hero';

router.get('/featured', async (req: Request, res: Response) => {
  try {
    const cached = await cache.get(CACHE_KEY_DEALS);
    if (cached) {
      return res.json({ deals: JSON.parse(cached), cached: true });
    }

    const dealsRes = await query(
      `SELECT p.id, p.title, p.slug, p.brand, p.price, p.original_price,
              p.discount_percentage, p.rating, p.thumbnail, p.zap_assured,
              p.deal_tag, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_deal_of_the_day = true
       ORDER BY p.discount_percentage DESC
       LIMIT 8`
    );

    // Cache in Redis for 120 seconds
    await cache.set(CACHE_KEY_DEALS, JSON.stringify(dealsRes.rows), 120);

    res.json({ deals: dealsRes.rows, cached: false });
  } catch (error: any) {
    console.error('Fetch deals error:', error);
    res.status(500).json({ message: 'Internal server error fetching deals' });
  }
});

export default router;
