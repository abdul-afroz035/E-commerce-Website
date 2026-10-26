import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import dealsRoutes from './routes/deals';
import cartRoutes from './routes/cart';
import wishlistRoutes from './routes/wishlist';
import orderRoutes from './routes/orders';
import searchRoutes from './routes/search';
import addressRoutes from './routes/addresses';
import { runMigrationsAndSeed } from './db/seed';
import { cache } from './config/redis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/addresses', addressRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ZapKart API Server',
    runtime: typeof Bun !== 'undefined' ? `Bun ${Bun.version}` : `Node ${process.version}`,
    redisConnected: cache.isConnected(),
    timestamp: new Date().toISOString()
  });
});

// Start Server & bootstrap DB
async function bootstrap() {
  try {
    await runMigrationsAndSeed();
  } catch (err) {
    console.warn('Database initialization warning (will continue):', err);
  }

  app.listen(PORT, () => {
    console.log(`
  🚀 ZapKart (Flipkart Clone) API Server is live!
  🌐 URL: http://localhost:${PORT}
  ⚡ Runtime: ${typeof Bun !== 'undefined' ? `Bun.js ${Bun.version}` : 'Node.js'}
  📦 PostgreSQL: zapkart
  🗄️ Redis: localhost:6379
    `);
  });
}

bootstrap();
