# Senora Shop (Next.js + TypeScript)

A clean, modern product showcase for clothing. Users browse products and place orders via WhatsApp.

## Features
- Home page with **Top sellers** and **Trending** sections
- Products listing with search + category filter
- Product details page
- "Buy on WhatsApp" button that opens a chat with:
  - Product name
  - Product ID
  - Product image URL

## Setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Customize products
Edit `lib/products.ts` and replace placeholder images in `public/products/`.

## Branding colors
- Gold: `#e1c254`
- Green: `#004439`
