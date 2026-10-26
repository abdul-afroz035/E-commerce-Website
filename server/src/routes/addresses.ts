import { Router, Response } from 'express';
import { query } from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get user addresses
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await query(
      `SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );
    res.json({ addresses: result.rows });
  } catch (error: any) {
    console.error('Fetch addresses error:', error);
    res.status(500).json({ message: 'Internal server error fetching addresses' });
  }
});

// Add new address
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      name, phone, pincode, locality, address_line,
      city, state, landmark, alternate_phone, address_type = 'HOME', is_default = false
    } = req.body;

    if (!name || !phone || !pincode || !locality || !address_line || !city || !state) {
      return res.status(400).json({ message: 'Missing required address fields' });
    }

    if (is_default) {
      await query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
    }

    const result = await query(
      `INSERT INTO addresses (
        user_id, name, phone, pincode, locality, address_line,
        city, state, landmark, alternate_phone, address_type, is_default
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [userId, name, phone, pincode, locality, address_line, city, state, landmark, alternate_phone, address_type, is_default]
    );

    res.status(201).json({ address: result.rows[0], message: 'Address added successfully' });
  } catch (error: any) {
    console.error('Add address error:', error);
    res.status(500).json({ message: 'Internal server error saving address' });
  }
});

export default router;
