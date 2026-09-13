# CraveBite

A restaurant ordering application: browse the menu, order food, book a table or event hall, and manage orders — with an admin dashboard for menu and order management, plus an AI assistant for menu search and recommendations.

## Stack

- **Backend**: Node.js, Express 4, MongoDB via Mongoose, JWT authentication, Stripe payments, Cloudinary image storage.
- **Frontend**: React 19 + Vite, React Router, Tailwind CSS v4 (via `@tailwindcss/vite`).
- **AI features**: Google Gemini (`@google/genai`) powers a menu-search/add-to-cart chatbot; a lightweight recommendation engine derives taste preferences from order/view/search activity.

## Project structure

```
crave_bite/
├── backend/
│   ├── server.js            # Express app entry point, route mounting, DB connection
│   ├── models/               # User, Food, CartItem, Order, TasteProfile
│   ├── routes/                # auth, user, cart, payment, order, food, chatbot, recommendations, tasteProfile
│   ├── middleware/auth.js    # protect / authorize (JWT)
│   ├── services/              # recommendationEngine
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/              # Home, Menu, Cart, Checkout, Success, Booking, Events,
│   │   │                       # Login, Signup, ForgotPassword, ResetPassword, MyOrders,
│   │   │                       # AdminLogin, AdminDashboard
│   │   ├── components/        # Navbar, Footer, FoodCard, Recommendations, TasteProfile, RestaurantChatbot
│   │   ├── config.js           # single source of truth for the API base URL
│   │   └── App.jsx             # client-side routing
│   ├── vite.config.js
│   └── .env.example
└── package.json               # root convenience scripts (runs backend + frontend together)
```

The whole customer- and admin-facing UI is a single React SPA — there is no separate static HTML frontend.

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in real values
npm run dev
```

Required env vars (see `backend/.env.example`): `PORT`, `MONGODB_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `CLOUDINARY_CLOUD_NAME`/`CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET`, `GEMINI_API_KEY`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # fill in your Stripe publishable key
npm run dev
```

### 3. Both at once

From the repo root:

```bash
npm install
npm run dev
```

## API overview

| Mount | Purpose |
|---|---|
| `/api/auth` | signup, login, logout, me, forgot/reset password |
| `/api/user` | profile management, admin user management |
| `/api/cart` | authenticated cart CRUD (amount always derived from the logged-in user) |
| `/api/payment` | Stripe payment intent creation/confirmation (authenticated; amount computed server-side from the cart) |
| `/api/order` | place order, view own orders, admin: view all orders |
| `/api/foods` | menu CRUD (public read, admin-only write) |
| `/api/chatbot` | Gemini-powered menu assistant |
| `/api/recommendations` | personalized food recommendations |
| `/api/taste-profile` | per-user taste profile, updated by view/search/order activity |
| `/api/health` | server + DB connection status |

## Roles

- **User**: signup/login, order food, book tables/events, view own orders.
- **Admin**: everything a user can do, plus menu CRUD and viewing all orders via `/admin` in the React app (`role: 'admin'` on the user record).

## Notes

- Stripe integration details: see `STRIPE_SETUP.md`.
- EmailJS setup for booking/event confirmation emails: see `frontend/EMAIL_SETUP.md`.
