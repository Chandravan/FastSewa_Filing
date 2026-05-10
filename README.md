# JhaJi Fastsewa E Facilities Pvt Ltd — Frontend

React + Vite + Tailwind CSS + Shadcn UI

---

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open browser
# http://localhost:5173
```

---

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components (Button, Badge, Card, Input...)
│   └── layout/       # Navbar, Footer
├── data/
│   └── mockData.js   # Mock data — replace with real API calls
├── hooks/
│   └── useAuth.jsx   # Auth context (login, register, logout)
├── lib/
│   └── utils.js      # Helper functions
├── pages/
│   ├── LandingPage.jsx
│   ├── ServicesPage.jsx
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   └── client/
│       ├── DashboardPage.jsx
│       ├── OrdersPage.jsx
│       ├── OrderDetailPage.jsx
│       ├── OrderPlacementPage.jsx
│       └── ProfilePage.jsx
├── App.jsx            # Router setup
├── main.jsx           # Entry point
└── index.css          # Global styles + Tailwind
```

---

## Pages

| Route | Page | Auth Required |
|---|---|---|
| `/` | Landing Page | No |
| `/services` | Services Catalog | No |
| `/login` | Login | No |
| `/register` | Register | No |
| `/order/:serviceId` | Order Placement (3-step) | Yes |
| `/dashboard` | Client Dashboard | Yes |
| `/dashboard/orders` | Orders List | Yes |
| `/dashboard/orders/:id` | Order Detail + Upload | Yes |
| `/dashboard/profile` | Profile | Yes |

---

## Connecting to Backend

All mock data is in `src/data/mockData.js`.
Auth logic is in `src/hooks/useAuth.jsx`.

### To connect real API:

1. **Auth** — Replace `login()` and `register()` in `useAuth.jsx`:
```js
// Replace the setTimeout mock with:
const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password })
})
const data = await res.json()
if (data.token) {
  localStorage.setItem("fastsewa_token", data.token)
  setUser(data.user)
}
```

2. **Services** — In `ServicesPage.jsx`, replace `SERVICES` import with:
```js
const [services, setServices] = useState([])
useEffect(() => {
  fetch("/api/services").then(r => r.json()).then(setServices)
}, [])
```

3. **Orders** — Replace `MOCK_ORDERS` similarly in dashboard/orders pages.

4. **Razorpay** — In `OrderPlacementPage.jsx` `StepPayment`, replace `onPay`:
```js
// 1. Create order on backend
const { order_id, amount } = await fetch("/api/payments/create-order", {...}).then(r => r.json())

// 2. Open Razorpay checkout
const rzp = new window.Razorpay({
  key: import.meta.env.VITE_RAZORPAY_KEY_ID,
  amount, order_id,
  handler: async (response) => {
    // Verify on backend
    await fetch("/api/payments/verify", { method: "POST", body: JSON.stringify(response) })
    navigate("/dashboard/orders")
  }
})
rzp.open()
```

---

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS 3
- React Router v6
- Lucide Icons
- Google Fonts: Syne (display) + DM Sans (body) + DM Mono

---

## Design System

- **Dark theme** — Deep dark background with glass-morphism cards
- **Brand color** — Orange (`brand-500: #f97316`)
- **Typography** — Syne for headings, DM Sans for body, DM Mono for numbers/codes
- **Animations** — `animate-fade-up`, `animate-fade-in` with delay utilities

---

Built with ❤️ for JhaJi Fastsewa E Facilities Pvt Ltd
