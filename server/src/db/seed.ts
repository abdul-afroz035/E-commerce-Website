import { pool, query } from '../config/db';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

export async function runMigrationsAndSeed() {
  console.log('🔄 Checking database and executing schema...');
  
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await query(schemaSql);
  console.log('✅ Schema tables verified/created');

  // Check if categories already exist
  const catCheck = await query('SELECT count(*) FROM categories');
  if (parseInt(catCheck.rows[0].count) > 0) {
    console.log('ℹ️ Database already contains data. Skipping initial seeding.');
    return;
  }

  console.log('🌱 Seeding initial Flipkart catalog data...');

  // 1. Seed demo users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const userRes = await query(
    `INSERT INTO users (name, email, phone, password_hash, role)
     VALUES 
      ('Afroz Shopper', 'afroz@zapkart.com', '9876543210', $1, 'customer'),
      ('Demo User', 'demo@zapkart.com', '9898989898', $1, 'customer')
     RETURNING id, name, email;`,
    [passwordHash]
  );
  const defaultUserId = userRes.rows[0].id;

  // Seed default address
  await query(
    `INSERT INTO addresses (user_id, name, phone, pincode, locality, address_line, city, state, address_type, is_default)
     VALUES ($1, 'Afroz Shopper', '9876543210', '560001', 'MG Road, Brigade Towers', '#42, 3rd Floor, Tech Park Residency', 'Bengaluru', 'Karnataka', 'HOME', true);`,
    [defaultUserId]
  );

  // 2. Seed Categories
  const categoriesData = [
    { name: 'Mobiles', slug: 'mobiles', image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80', icon_name: 'Smartphone', display_order: 1 },
    { name: 'Electronics', slug: 'electronics', image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&auto=format&fit=crop&q=80', icon_name: 'Laptop', display_order: 2 },
    { name: 'Appliances', slug: 'appliances', image_url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=300&auto=format&fit=crop&q=80', icon_name: 'Tv', display_order: 3 },
    { name: 'Fashion', slug: 'fashion', image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&auto=format&fit=crop&q=80', icon_name: 'Shirt', display_order: 4 },
    { name: 'Home & Furniture', slug: 'home-furniture', image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&auto=format&fit=crop&q=80', icon_name: 'Armchair', display_order: 5 },
    { name: 'Beauty & Toys', slug: 'beauty-toys', image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=80', icon_name: 'Sparkles', display_order: 6 },
    { name: 'Grocery', slug: 'grocery', image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80', icon_name: 'Apple', display_order: 7 },
  ];

  const categoryMap: Record<string, number> = {};
  for (const cat of categoriesData) {
    const res = await query(
      `INSERT INTO categories (name, slug, image_url, icon_name, display_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, slug;`,
      [cat.name, cat.slug, cat.image_url, cat.icon_name, cat.display_order]
    );
    categoryMap[res.rows[0].slug] = res.rows[0].id;
  }

  // 3. Seed Products
  const productsData = [
    {
      title: 'Apple iPhone 15 Pro (Natural Titanium, 128 GB)',
      slug: 'apple-iphone-15-pro-natural-titanium-128gb',
      brand: 'Apple',
      category_slug: 'mobiles',
      price: 124990,
      original_price: 134900,
      discount_percentage: 7,
      rating: 4.7,
      rating_count: 3240,
      review_count: 289,
      stock: 35,
      zap_assured: true,
      thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80'
      ]),
      highlights: JSON.stringify([
        '128 GB ROM | 6.1 inch Super Retina XDR Display',
        '48MP + 12MP + 12MP | 12MP Front Camera',
        'A17 Pro Chip, 6 Core Processor',
        'Titanium Design with Ceramic Shield Front',
        'Action Button & USB-C with USB 3 Speeds'
      ]),
      specifications: JSON.stringify({
        'In The Box': 'iPhone, USB-C Charge Cable, Documentation',
        'Model Number': 'MTV13HN/A',
        'Display Size': '15.49 cm (6.1 inch)',
        'Resolution': '2556 x 1179 Pixels',
        'Operating System': 'iOS 17',
        'Internal Storage': '128 GB',
        'Warranty': '1 Year Brand Warranty for Phone and In-box Accessories'
      }),
      is_deal_of_the_day: true,
      deal_tag: 'Flagship Deal'
    },
    {
      title: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 256 GB, 12 GB RAM)',
      slug: 'samsung-galaxy-s24-ultra-titanium-gray-256gb',
      brand: 'Samsung',
      category_slug: 'mobiles',
      price: 119999,
      original_price: 134999,
      discount_percentage: 11,
      rating: 4.6,
      rating_count: 1845,
      review_count: 195,
      stock: 40,
      zap_assured: true,
      thumbnail: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80'
      ]),
      highlights: JSON.stringify([
        '12 GB RAM | 256 GB ROM',
        '6.8 inch Dynamic AMOLED 2X Display (120Hz)',
        '200MP Quad Camera with AI Zoom',
        'Snapdragon 8 Gen 3 Processor',
        'Built-in S-Pen & 5000 mAh Battery'
      ]),
      specifications: JSON.stringify({
        'In The Box': 'Handset, Type C to C Cable, SIM Ejector Tool',
        'Processor Core': 'Octa Core Snapdragon 8 Gen 3',
        'Primary Camera': '200MP + 50MP + 12MP + 10MP',
        'Battery Capacity': '5000 mAh',
        'Warranty': '1 Year Manufacturer Warranty'
      }),
      is_deal_of_the_day: true,
      deal_tag: 'Extra ₹10000 Off on Exchange'
    },
    {
      title: 'Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones (Black)',
      slug: 'sony-wh-1000xm5-wireless-anc-headphones-black',
      brand: 'Sony',
      category_slug: 'electronics',
      price: 26990,
      original_price: 34990,
      discount_percentage: 22,
      rating: 4.8,
      rating_count: 5210,
      review_count: 610,
      stock: 55,
      zap_assured: true,
      thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80'
      ]),
      highlights: JSON.stringify([
        'Industry Leading Active Noise Cancellation with 8 Mics',
        'Up to 30 Hours Battery Life with Quick Charging (3 min = 3 hrs)',
        'Multipoint Connection (Pair 2 Bluetooth devices simultaneously)',
        'Ultra-comfortable, lightweight design with soft fit leather'
      ]),
      specifications: JSON.stringify({
        'Type': 'Over the Ear Headphone',
        'Connectivity': 'Bluetooth 5.2, 3.5mm Aux',
        'Microphone': 'Built-in 4 beamforming microphones',
        'Warranty': '1 Year Domestic Warranty'
      }),
      is_deal_of_the_day: true,
      deal_tag: 'Top Rated Noise Cancelling'
    },
    {
      title: 'Apple MacBook Air M3 (13.6 inch, 8GB Unified Memory, 256GB SSD, Midnight)',
      slug: 'apple-macbook-air-m3-midnight-256gb',
      brand: 'Apple',
      category_slug: 'electronics',
      price: 104990,
      original_price: 114900,
      discount_percentage: 8,
      rating: 4.8,
      rating_count: 980,
      review_count: 124,
      stock: 20,
      zap_assured: true,
      thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80'
      ]),
      highlights: JSON.stringify([
        'Apple M3 Chip with 8-core CPU and 8-core GPU',
        'Liquid Retina Display with True Tone',
        'Up to 18 Hours Battery Life',
        '1080p FaceTime HD Camera & MagSafe 3 Charging',
        'Weight: Just 1.24 kg'
      ]),
      specifications: JSON.stringify({
        'Processor': 'Apple M3 Chip',
        'RAM': '8 GB Unified Memory',
        'Storage': '256 GB SSD',
        'Display': '13.6 inch LED-backlit Liquid Retina',
        'Warranty': '1 Year Apple Limited Warranty'
      }),
      is_deal_of_the_day: false,
      deal_tag: '₹5000 Instant HDFC Discount'
    },
    {
      title: 'boAt Airdopes 141 Bluetooth Truly Wireless in Ear Earbuds (Bold Black)',
      slug: 'boat-airdopes-141-tws-bold-black',
      brand: 'boAt',
      category_slug: 'electronics',
      price: 1099,
      original_price: 4490,
      discount_percentage: 75,
      rating: 4.1,
      rating_count: 88400,
      review_count: 9420,
      stock: 250,
      zap_assured: true,
      thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80'
      ]),
      highlights: JSON.stringify([
        '42 Hours Total Playback Time with Charging Case',
        'ENx Tech for Crystal Clear Voice Calls',
        'ASAP Charge: 5 Mins Charge = 75 Mins Playtime',
        'IPX4 Water & Sweat Resistance'
      ]),
      specifications: JSON.stringify({
        'Driver Size': '8 mm Dynamic Drivers',
        'Bluetooth Version': 'v5.1',
        'Charging Time': '1 Hour',
        'Warranty': '1 Year Brand Replacement Warranty'
      }),
      is_deal_of_the_day: true,
      deal_tag: 'Crazy Deal 75% Off'
    },
    {
      title: 'LG 7 Kg 5 Star Smart Inverter Fully Automatic Front Load Washing Machine',
      slug: 'lg-7kg-front-load-washing-machine-fhm1207sdw',
      brand: 'LG',
      category_slug: 'appliances',
      price: 28990,
      original_price: 43990,
      discount_percentage: 34,
      rating: 4.4,
      rating_count: 4120,
      review_count: 530,
      stock: 18,
      zap_assured: true,
      thumbnail: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&auto=format&fit=crop&q=80'
      ]),
      highlights: JSON.stringify([
        'Fully Automatic Front Load with 6 Motion Direct Drive',
        '1200 RPM Spin Speed for Faster Drying',
        '5 Star Energy Rating - Best in Class Efficiency',
        'Inbuilt Heater with Steam Wash Hygiene Care'
      ]),
      specifications: JSON.stringify({
        'Capacity': '7 kg (Ideal for 3-4 members)',
        'Motor': 'Inverter Direct Drive Motor',
        'Warranty': '2 Years on Product, 10 Years on Motor'
      }),
      is_deal_of_the_day: false,
      deal_tag: 'Free Installation & Demo'
    },
    {
      title: 'Philips Digital Air Fryer HD9252/90 (4.1 Litre, Rapid Air Technology)',
      slug: 'philips-digital-air-fryer-hd9252',
      brand: 'Philips',
      category_slug: 'appliances',
      price: 6999,
      original_price: 11995,
      discount_percentage: 41,
      rating: 4.5,
      rating_count: 8900,
      review_count: 920,
      stock: 45,
      zap_assured: true,
      thumbnail: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80'
      ]),
      highlights: JSON.stringify([
        'Fry with up to 90% Less Fat',
        'Touch Screen with 7 Pre-set Menus',
        'Keep Warm Function up to 30 mins',
        'NutriU App with 500+ Healthy Recipes'
      ]),
      specifications: JSON.stringify({
        'Capacity': '4.1 L',
        'Power': '1400 W',
        'Warranty': '2 Years Worldwide Guarantee'
      }),
      is_deal_of_the_day: true,
      deal_tag: 'Kitchen Essential'
    },
    {
      title: "Levi's Men 511 Slim Fit Low Rise Dark Indigo Stretch Jeans",
      slug: 'levis-men-511-slim-fit-jeans',
      brand: "Levi's",
      category_slug: 'fashion',
      price: 1999,
      original_price: 3999,
      discount_percentage: 50,
      rating: 4.3,
      rating_count: 14200,
      review_count: 1130,
      stock: 80,
      zap_assured: true,
      thumbnail: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=600&auto=format&fit=crop&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80'
      ]),
      highlights: JSON.stringify([
        'Fabric: 98% Cotton, 2% Elastane',
        'Fit: Slim Fit from Hip to Ankle',
        'Authentic 5 Pocket Styling with Red Tab',
        'Machine Wash Warm'
      ]),
      specifications: JSON.stringify({
        'Closure': 'Button and Zip Fly',
        'Rise': 'Low Rise',
        'Wash Care': 'Do not bleach, Tumble dry low'
      }),
      is_deal_of_the_day: true,
      deal_tag: 'Min 50% Off'
    },
    {
      title: 'Puma Softride Rift Tech Men Running Shoes (Puma Black-Metallic Silver)',
      slug: 'puma-softride-rift-tech-men-running-shoes',
      brand: 'Puma',
      category_slug: 'fashion',
      price: 2499,
      original_price: 5499,
      discount_percentage: 54,
      rating: 4.3,
      rating_count: 6730,
      review_count: 512,
      stock: 60,
      zap_assured: true,
      thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'
      ]),
      highlights: JSON.stringify([
        'SOFTRIDE Foam Technology for All-Day Cushioning',
        'Breathable Engineered Knit Upper',
        'Zoned Rubber Outsole for Maximum Traction',
        'Lightweight Construction'
      ]),
      specifications: JSON.stringify({
        'Ideal For': 'Men',
        'Type': 'Road Running & Training',
        'Closure': 'Lace-Ups'
      }),
      is_deal_of_the_day: true,
      deal_tag: 'Trending Now'
    },
    {
      title: 'Wakefit Orthopedic Memory Foam 6-Inch Queen Size Mattress (78x60 inch)',
      slug: 'wakefit-orthopedic-memory-foam-queen-mattress',
      brand: 'Wakefit',
      category_slug: 'home-furniture',
      price: 10499,
      original_price: 15999,
      discount_percentage: 34,
      rating: 4.6,
      rating_count: 24500,
      review_count: 3200,
      stock: 25,
      zap_assured: true,
      thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80'
      ]),
      highlights: JSON.stringify([
        'Next-Gen High Resilience Foam with Pressure Relieving Memory Foam',
        'Removable Breathable Zipper Cover',
        'Orthopedic Support Recommended by Doctors',
        '100-Night Free Trial at Home'
      ]),
      specifications: JSON.stringify({
        'Dimensions': '78 L x 60 W x 6 H (inches)',
        'Comfort Level': 'Medium Firm',
        'Warranty': '10 Years Manufacturer Warranty'
      }),
      is_deal_of_the_day: false,
      deal_tag: '10 Years Warranty'
    },
    {
      title: 'Minimalist 10% Niacinamide Face Serum with Zinc (30 ml)',
      slug: 'minimalist-10-niacinamide-face-serum',
      brand: 'Minimalist',
      category_slug: 'beauty-toys',
      price: 569,
      original_price: 599,
      discount_percentage: 5,
      rating: 4.5,
      rating_count: 18200,
      review_count: 2100,
      stock: 120,
      zap_assured: true,
      thumbnail: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80'
      ]),
      highlights: JSON.stringify([
        'Reduces Acne Marks, Blemishes & Dark Spots',
        'Formulated with Pure Vitamin B3 (Niacinamide) and Zinc PCA',
        'Fragrance-Free, Essential Oil Free, Non-Comedogenic',
        'Suitable for All Skin Types including Sensitive'
      ]),
      specifications: JSON.stringify({
        'Volume': '30 ml',
        'Applied For': 'Blemish Removal, Oil Control, Skin Radiance',
        'Country of Origin': 'India'
      }),
      is_deal_of_the_day: true,
      deal_tag: 'Best Seller in Skincare'
    },
    {
      title: 'Tata Sampann Unpolished Toor Dal (Pigeon Pea), 1kg',
      slug: 'tata-sampann-unpolished-toor-dal-1kg',
      brand: 'Tata Sampann',
      category_slug: 'grocery',
      price: 175,
      original_price: 210,
      discount_percentage: 16,
      rating: 4.6,
      rating_count: 32000,
      review_count: 2900,
      stock: 300,
      zap_assured: true,
      thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80'
      ]),
      highlights: JSON.stringify([
        '100% Unpolished: Does not undergo any artificial polishing with water, oil or leather',
        'Rich in Dietary Fibre and Natural Proteins',
        '5 Step Strict Quality Control Check',
        'Fresh Farm Sourced'
      ]),
      specifications: JSON.stringify({
        'Weight': '1 kg',
        'Form': 'Dal / Pulses',
        'Shelf Life': '12 Months'
      }),
      is_deal_of_the_day: false,
      deal_tag: 'Daily Grocery Steal'
    }
  ];

  for (const p of productsData) {
    const catId = categoryMap[p.category_slug] || null;
    const prodRes = await query(
      `INSERT INTO products (
        title, slug, brand, category_id, price, original_price, discount_percentage,
        rating, rating_count, review_count, stock, zap_assured, thumbnail,
        images, highlights, specifications, is_deal_of_the_day, deal_tag
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id, title;`,
      [
        p.title, p.slug, p.brand, catId, p.price, p.original_price, p.discount_percentage,
        p.rating, p.rating_count, p.review_count, p.stock, p.zap_assured, p.thumbnail,
        p.images, p.highlights, p.specifications, p.is_deal_of_the_day, p.deal_tag
      ]
    );

    const productId = prodRes.rows[0].id;

    // Seed sample reviews for each product
    await query(
      `INSERT INTO reviews (product_id, user_id, user_name, rating, title, comment, verified_purchase, likes)
       VALUES 
        ($1, $2, 'Rahul Sharma', 5, 'Superb Product! Exceeded Expectations', 'Delivered within 24 hours via ZapKart Plus. Original sealed product, works like a charm. Flipkart clone done right!', true, 42),
        ($1, $2, 'Priya Patel', 4, 'Value for Money', 'Very nice quality. Packaging was solid with ZapAssured seal. Highly recommend.', true, 19);`,
      [productId, defaultUserId]
    );
  }

  console.log('✅ Successfully seeded categories, products, and reviews!');
}

if (import.meta.main) {
  runMigrationsAndSeed()
    .then(() => {
      console.log('🏁 Migration & seed script finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Migration & seed failed:', err);
      process.exit(1);
    });
}
