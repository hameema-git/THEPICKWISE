# thePickWise — React Affiliate Website

## Quick Start

```bash
cd pickwise
npm install
npm run dev
```
Open http://localhost:5173

---

## Deploy to Vercel (Free, 60 seconds)

1. Upload `pickwise` folder to a new GitHub repo
2. Go to vercel.com → New Project → Import repo
3. Click Deploy — Vercel auto-detects Vite
4. Connect `thepickwise.in` in Vercel → Settings → Domains

---

## Secret Admin Panel

Your secret product management page is at:

```
https://thepickwise.in/manage-pickwise-2025
```

**This URL is NOT linked anywhere on the site.** Only you know it.

- Add products with a simple form — no coding needed
- Products appear instantly on the live site
- Added products are stored in the browser (localStorage)
- To make products permanent: copy details to src/data/products.js

---

## Pages

| URL | Page | Visible to public? |
|-----|------|--------------------|
| / | Home — all products | ✅ Yes |
| /picks | My Favourites | ✅ Yes |
| /product/1 | Product detail | ✅ Yes |
| /disclosure | About the site | ✅ Yes |
| /privacy | Privacy policy | ✅ Yes |
| /manage-pickwise-2025 | Admin panel | 🔒 Secret — URL only |

---

## Features

- ✅ Pinterest-style masonry product grid
- ✅ Category filters + search
- ✅ YouTube video modal for any product
- ✅ 👍 👎 Like/Dislike on every product (browser-based)
- ✅ PWA — installable as app on phone
- ✅ FAQ section on home page
- ✅ Secret admin panel to add products without coding
- ✅ Affiliate links for Amazon, Meesho, Flipkart
- ✅ Mobile responsive

---

## Add a Product (Coding Method)

Open `src/data/products.js` and add to the array:

```js
{
  id: 12,
  category: 'kitchen',         // kitchen/tech/home/beauty/kids/fitness
  name: 'Product Name',
  image: 'https://image-url.jpg',
  review: 'Your honest review.',
  rating: 4.5,
  reviews_count: 500,
  price: '₹599',
  original_price: '₹999',
  savings: '40% off',
  badges: ['deal'],            // deal / new / fav
  shop: 'Meesho',              // Amazon / Meesho / Flipkart
  affiliate_link: 'https://meesho.com/your-link',
  video_link: 'https://youtube.com/watch?v=XXXX',
  video_credit: 'Channel Name',
  is_pick: false,              // true = My Favourites section
},
```

---

## Get Affiliate Links

**Meesho:** Open product → Tap Share (📤) → "Share & Earn" → Copy link

**Amazon:** Login to affiliate-program.amazon.in → Browse Amazon → Use SiteStripe bar → Click "Text"

**Flipkart:** Login to affiliate.flipkart.com → Generate link from dashboard
