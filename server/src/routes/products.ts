import { Router, Request, Response } from 'express';
import { query } from '../config/db';
import { cache } from '../config/redis';

const router = Router();

// Get Products with filtering, sorting, and pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      category,
      q,
      brand,
      min_price,
      max_price,
      rating,
      zap_assured,
      sort = 'relevance',
      page = '1',
      limit = '20'
    } = req.query;

    const cacheKey = `zapkart:products:${JSON.stringify(req.query)}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ ...JSON.parse(cached), cached: true });
    }

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      conditions.push(`(c.slug = $${paramIndex} OR c.name ILIKE $${paramIndex})`);
      params.push(category);
      paramIndex++;
    }

    if (q) {
      conditions.push(`(p.title ILIKE $${paramIndex} OR p.brand ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`);
      params.push(`%${q}%`);
      paramIndex++;
    }

    if (brand) {
      const brands = Array.isArray(brand) ? brand : [brand];
      conditions.push(`p.brand = ANY($${paramIndex})`);
      params.push(brands);
      paramIndex++;
    }

    if (min_price) {
      conditions.push(`p.price >= $${paramIndex}`);
      params.push(parseFloat(min_price as string));
      paramIndex++;
    }

    if (max_price) {
      conditions.push(`p.price <= $${paramIndex}`);
      params.push(parseFloat(max_price as string));
      paramIndex++;
    }

    if (rating) {
      conditions.push(`p.rating >= $${paramIndex}`);
      params.push(parseFloat(rating as string));
      paramIndex++;
    }

    if (zap_assured === 'true') {
      conditions.push(`p.zap_assured = true`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'ORDER BY p.id DESC';
    if (sort === 'price_asc') orderBy = 'ORDER BY p.price ASC';
    else if (sort === 'price_desc') orderBy = 'ORDER BY p.price DESC';
    else if (sort === 'rating_desc') orderBy = 'ORDER BY p.rating DESC';
    else if (sort === 'discount_desc') orderBy = 'ORDER BY p.discount_percentage DESC';
    else if (sort === 'newest') orderBy = 'ORDER BY p.created_at DESC';

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const offset = (pageNum - 1) * limitNum;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const countRes = await query(countQuery, params);
    const total = parseInt(countRes.rows[0].total, 10);

    const dataQuery = `
      SELECT 
        p.id, p.title, p.slug, p.brand, p.price, p.original_price, p.discount_percentage,
        p.rating, p.rating_count, p.review_count, p.stock, p.zap_assured, p.thumbnail,
        p.is_deal_of_the_day, p.deal_tag, p.highlights,
        c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const productRes = await query(dataQuery, [...params, limitNum, offset]);

    const responsePayload = {
      products: productRes.rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };

    // Cache search/listing results in Redis for 60 seconds
    await cache.set(cacheKey, JSON.stringify(responsePayload), 60);

    res.json({ ...responsePayload, cached: false });
  } catch (error: any) {
    console.error('Fetch products error:', error);
    res.status(500).json({ message: 'Internal server error fetching products' });
  }
});

// Get Single Product by ID or Slug
router.get('/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    const isId = /^\d+$/.test(idOrSlug);

    const cacheKey = `zapkart:product:${idOrSlug}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ product: JSON.parse(cached), cached: true });
    }

    const sql = isId
      ? `SELECT p.*, c.name as category_name, c.slug as category_slug
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.id = $1`
      : `SELECT p.*, c.name as category_name, c.slug as category_slug
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.slug = $1`;

    const result = await query(sql, [idOrSlug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = result.rows[0];

    // Fetch product reviews
    const reviewsRes = await query(
      `SELECT id, user_name, rating, title, comment, verified_purchase, likes, created_at
       FROM reviews
       WHERE product_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [product.id]
    );
    product.reviews = reviewsRes.rows;

    // Fetch similar products
    const similarRes = await query(
      `SELECT id, title, slug, brand, price, original_price, discount_percentage, rating, thumbnail, zap_assured
       FROM products
       WHERE category_id = $1 AND id != $2
       LIMIT 6`,
      [product.category_id, product.id]
    );
    product.similarProducts = similarRes.rows;

    // Cache in Redis for 5 minutes
    await cache.set(cacheKey, JSON.stringify(product), 300);

    res.json({ product, cached: false });
  } catch (error: any) {
    console.error('Fetch product detail error:', error);
    res.status(500).json({ message: 'Internal server error fetching product details' });
  }
});

export default router;
