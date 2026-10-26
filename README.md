# ⚡ ZapKart — Full-Stack Flipkart Clone

A modern, high-performance Flipkart Clone named **ZapKart** built with **React**, **Bun.js**, **PostgreSQL**, **Redis**, and **Express.js**.

---

## 🚀 Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS | Flipkart's iconic blue (`#2874f0`) & yellow (`#ffe11b`) UI, Lucide icons, responsive layout |
| **Runtime & Bundler** | Bun.js (v1.4.4) | Ultra-fast JavaScript & TypeScript runtime and package manager |
| **Backend API** | Express.js + TypeScript | RESTful API with modular routes, JWT authentication, and error handling |
| **Database** | PostgreSQL 16 | Relational data store for users, categories, products, reviews, addresses, and orders |
| **Caching Layer** | Redis 8 | High-speed cache for popular products, categories, search suggestions, and flash deals |

---

## 🌟 Key Features

### 🛒 Flipkart Look & Feel
- **Header & Navbar**: ZapKart Plus badge, real-time auto-suggestions search bar, user dropdown menu, cart counter badge, "Become a Seller" link.
- **Iconic Category Bar**: Horizontal navigation for Mobiles, Electronics, Appliances, Fashion, Home & Furniture, Beauty & Toys, and Grocery.
- **Hero Promotional Carousel**: Big Billion Days & Mega Sale banners with auto-play and manual navigation.
- **Deals of the Day**: Live ticking countdown timer (`14h : 32m : 45s Left`), discount badges (`75% off`), and horizontal deals showcase.
- **ZapAssured Badge**: Verified high-speed delivery guarantee tag across products.

### 🔍 Product Discovery & Filtering
- **Left Filter Sidebar**: Price range sliders/inputs, ZapAssured toggle, brand multi-select, and customer rating filters (4★ & above).
- **Sorting Options**: Relevance, Price Low-to-High, Price High-to-Low, Customer Ratings, and Discount percentage.
- **Live Search Auto-complete**: Redis-cached suggestions with instant query response.

### 📱 Detailed Product Page (PDP)
- Multi-image gallery with hover image thumbnails and zoom preview.
- Star rating score card, review counts, and 5-star distribution progress bars.
- Available Offers section (Bank Offers, Exchange Bonuses, Partner Offers).
- Interactive Pincode Checker with estimated delivery dates.
- Full product highlights and technical specifications table.
- Similar products carousel.

### 🛍️ Cart & Checkout
- **Cart Management**: Quantity adjusters (+/-), remove item, save for later, and instant subtotal/discount calculations.
- **Price Details Breakdown**: Item price, total savings banner ("You will save ₹X on this order"), and free delivery thresholds.
- **Accordion 4-Step Checkout**:
  1. Login & Identity
  2. Delivery Address (Select saved address or create a new address)
  3. Order Summary & Item Review
  4. Payment Options (Interactive UPI QR Scanner, Credit/Debit Cards, Net Banking, Cash on Delivery)
- **Live Order Tracking**: Interactive timeline (*Order Confirmed -> Packed & Shipped -> Out for Delivery -> Delivered*).
- **Wishlist**: Quick toggle heart icons with "Move to Cart" action.

---

## 🔑 Pre-Seeded Demo Credentials

- **Email**: `afroz@zapkart.com`
- **Password**: `password123`
*(A convenient **"One-Click Demo Login"** button is also available directly inside the Login modal)*

---

## 🗄️ Database & Redis Setup

### PostgreSQL (`zapkart`)
Tables:
- `users`: Authentication & role management
- `categories`: Hierarchy & slugs
- `products`: Pricing, ZapAssured badges, specifications JSON, and stock
- `reviews`: Customer ratings, verified badges, and reviews
- `addresses`: Multi-address book (Home/Work)
- `cart_items`: User persistent cart items
- `wishlist_items`: User saved items
- `orders` & `order_items`: Full order lifecycle tracking

### Redis Caching
Keys cached in Redis:
- `zapkart:categories:all`: 10-minute cache for category tree
- `zapkart:deals:hero`: 2-minute cache for flash sale deals
- `zapkart:search:suggest:<query>`: Auto-complete search cache
- `zapkart:products:<query>`: Search and filter query results cache

---

## 💻 Running the Project Locally

### 1. Start PostgreSQL & Redis
```bash
brew services start postgresql@16
brew services start redis
```

### 2. Run Backend (Express + Bun)
```bash
cd server
bun install
bun run seed    # (Optional: Seeds database if empty)
bun run dev     # Runs server on http://localhost:5001
```

### 3. Run Frontend (React + Vite + Bun)
```bash
cd client
bun install
bun run dev     # Runs client on http://localhost:5173
```

---

## 🌐 Live Services

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001](http://localhost:5001)
- **API Healthcheck**: [http://localhost:5001/api/health](http://localhost:5001/api/health)
