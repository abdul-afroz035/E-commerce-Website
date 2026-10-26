import { Router, Request, Response } from 'express';
import { query } from '../config/db';
import { cache } from '../config/redis';

const router = Router();

router.get('/suggestions', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q || q.length < 2) {
      // Return popular trending searches
      return res.json({
        suggestions: [
          'iPhone 15 Pro',
          'Wireless Headphones',
          'MacBook Air M3',
          'Running Shoes',
          'Smart Inverter Washing Machine',
          'Men Slim Fit Jeans'
        ]
      });
    }

    const cacheKey = `zapkart:search:suggest:${q.toLowerCase()}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ suggestions: JSON.parse(cached), cached: true });
    }

    const result = await query(
      `SELECT title, brand FROM products
       WHERE title ILIKE $1 OR brand ILIKE $1
       LIMIT 6`,
      [`%${q}%`]
    );

    const suggestions = result.rows.map(r => r.title);
    await cache.set(cacheKey, JSON.stringify(suggestions), 120);

    res.json({ suggestions, cached: false });
  } catch (error: any) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
