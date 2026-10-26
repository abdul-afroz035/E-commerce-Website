import { Router, Request, Response } from 'express';
import { query } from '../config/db';
import { cache } from '../config/redis';

const router = Router();
const CACHE_KEY_CATEGORIES = 'zapkart:categories:all';

router.get('/', async (req: Request, res: Response) => {
  try {
    // Check Redis cache
    const cachedData = await cache.get(CACHE_KEY_CATEGORIES);
    if (cachedData) {
      return res.json({ categories: JSON.parse(cachedData), cached: true });
    }

    const result = await query(
      'SELECT id, name, slug, image_url, icon_name, display_order FROM categories ORDER BY display_order ASC, name ASC'
    );

    // Cache in Redis for 10 minutes (600s)
    await cache.set(CACHE_KEY_CATEGORIES, JSON.stringify(result.rows), 600);

    res.json({ categories: result.rows, cached: false });
  } catch (error: any) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
