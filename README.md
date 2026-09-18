# CelebrateHub — Multi-Venue Celebration Booking & Management Platform

A production-grade, full-stack celebration venue marketplace web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **MongoDB Atlas (Mongoose)**, **Auth**, and **Razorpay**.

CelebrateHub connects **Celebration Hosts / Guests**, **Venue Partners / Organisers**, and **Administrators** in one cohesive luxury platform.

---

## 🌟 Key Highlights & Architecture

### 1. Multi-Role Ecosystem
- **Customer**:
  - Discover events with multi-facet filters (Category, City, Format, Price, Sorting).
  - Configure event tickets: select tiered package, specify guests count, choose schedule date and time slot with live capacity badges, and select optional add-ons.
  - Multi-event shopping cart: bundle multiple events from **different organisers** into a single cart.
  - Razorpay checkout with server-side HMAC SHA-256 signature verification.
  - Booking confirmation with downloadable calendar invites (`.ics`) and printable passes with dynamic QR codes.
  - Customer bookings management with cancellation & refund calculation based on event policies.
  - Verified reviews and star ratings.
- **Organiser**:
  - Analytics dashboard: Gross ticket sales, net payouts, attendee counts, active events.
  - 5-step Event Creation Wizard: Basic info, venue & date/time slots, pricing package tiers, add-ons, media gallery, cancellation policies, and submission for admin approval.
  - Gate Attendee Check-in: Search attendees by reference or name, scan/toggle entry check-in status with timestamps.
- **Administrator**:
  - Platform Command Center: Gross Merchandise Value (GMV), platform fee commissions earned (5%), user statistics.
  - Event Moderation Queue: Inspect submitted events, approve & publish, reject with feedback notes, toggle homepage featured spotlight, and publish/unpublish.
  - Customer Refund Management: Review and process ticket cancellation refund requests.
  - User Directory: Manage customer & organiser accounts, verify organizer badges, or suspend accounts.
  - Platform Settings: Configure platform convenience fee percentage, GST/tax percentage, currency, and support email.

### 2. Independent Event-Specific Configuration
Each event has its own isolated:
- Venue (physical address with Google Maps integration or virtual livestream link)
- Pricing package tiers (e.g., General Admission, VIP Sky Lounge, Backstage Club) with custom perk features and guest limits
- Time slots with independent capacity limits and live booked counts
- Add-ons (merchandise, parking passes, beverage bundles, kits) with custom unit prices and max per booking limits
- Custom Terms and Conditions & Cancellation / Refund policies

### 3. Razorpay Payment Gateway & Test Mode
- Server-side order creation (`/api/payment/create-order`)
- Client-side checkout modal via Razorpay SDK
- Server-side cryptographic signature verification (`/api/payment/verify`)
- Built-in **1-Click Test Payment Simulation** for instant local testing without needing live bank cards

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the project root (defaults are provided in `.env.example`):
```env
MONGODB_URI=mongodb://127.0.0.1:27017/event_booking_marketplace
JWT_SECRET=super_secure_event_booking_secret_key_2026_jwt_token!
RAZORPAY_KEY_ID=rzp_test_eventhub2026
RAZORPAY_KEY_SECRET=secret_test_eventhub2026
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_eventhub2026
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note**: You can connect to a local MongoDB instance or a free MongoDB Atlas cloud cluster (`mongodb+srv://...`). The app is built with graceful fallbacks so that the homepage catalog and interfaces work cleanly even before the database is configured.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 👥 Demo Accounts & One-Click Role Switching

The top banner of the application features an **instant role switcher**:

| Role | Email | Password | Primary Features |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@eventhub.com` | `password123` | Browse catalog, multi-event cart, tickets & QR codes, cancellations, reviews |
| **Organiser** | `organiser@eventhub.com` | `password123` | Sales analytics, event wizard, venue attendee gate check-in |
| **Admin** | `admin@eventhub.com` | `password123` | Event moderation (approve/reject), refunds queue, platform settings, GMV |

You can also click the **"Reset Data"** button in the top banner (or visit `/api/seed`) to reset the database with fresh, realistic events, categories, and sample orders at any time.

---

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── admin/             # Dashboard metrics, moderation, users, refunds, settings
│   │   ├── auth/              # Login, register, logout, me, demo-login
│   │   ├── categories/        # Public category listings
│   │   ├── customer/          # Bookings list, cancellations, reviews
│   │   ├── events/            # Search & filter, event details, organiser creator
│   │   ├── organiser/         # Dashboard metrics, attendee check-in
│   │   ├── payment/           # Razorpay order creation & signature verification
│   │   └── seed/              # Comprehensive database seeder endpoint
│   ├── admin/                 # Admin command center & moderation views
│   ├── booking-confirmation/  # Confirmation page with printable QR tickets
│   ├── cart/                  # Multi-event shopping cart page
│   ├── checkout/              # Attendee details & Razorpay payment trigger
│   ├── customer/              # Customer bookings & ticket passes
│   ├── events/                # Event discovery & rich detail configurator
│   ├── login/ & register/     # Auth pages with demo switchers
│   ├── layout.tsx             # App layout with Auth, Cart & DemoBanner
│   └── page.tsx               # Marketplace Homepage
├── components/
│   ├── common/                # DemoBanner with quick role switchers
│   ├── events/                # EventCard, PackageSelector, SlotSelector, AddOnsSelector, ReviewSection
│   └── layout/                # Navbar, Footer, CartDrawer
├── context/
│   ├── AuthContext.tsx        # Session state & 1-click role switching
│   └── CartContext.tsx        # Persistent multi-event cart state
├── lib/
│   ├── auth.ts                # Password hashing, JWT signing & cookies
│   ├── db.ts                  # Cached Mongoose connection manager
│   ├── razorpay.ts            # Razorpay order & HMAC signature verification
│   ├── seedData.ts            # Realistic seed generator
│   └── utils.ts               # Currency formatting, refund calculation, IDs
└── models/                    # Mongoose schemas: User, Event, Order, Booking, Review, Category, Setting
```

---

## 🔒 Security & Verification
- Passwords hashed with `bcryptjs`
- JWT session tokens stored in `httpOnly` secure cookies
- Razorpay payments verified server-side using HMAC SHA-256 before bookings are confirmed
- Event slot capacities decremented atomically to prevent overbooking
- Gate check-in statuses updated in real-time with attendance timestamps
