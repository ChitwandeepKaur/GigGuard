# 🛡️ GigGuard

> **Standard budget apps assume you make $4,000 every single month. Gig workers don't.**

Built over a caffeine-fueled weekend for the **State Farm Financial Wellness Hackathon**. 

> 🚀 **Try the Demo Live!**
> **Email:** `marcus@demo.com`
> **Password:** `demo1234`

## The Problem
If you drive for Uber, deliver for DoorDash, or freelance online, your income is a chaotic rollercoaster. One week you make $1,200. The next, your car breaks down and you make $200. 

Traditional finance tools completely fail gig workers. They leave you guessing if you're actually safe to spend, unprepared for financial shocks, and flying blind on commercial auto coverage.

## Enter GigGuard
GigGuard is the financial safety net built natively for income volatility. We throw out the rigid "monthly budget" and replace it with a dynamic, real-time **Safe-to-Spend** number that adjusts every time you log a shift or buy a coffee.

### ✨ What makes it cool?
* 🎢 **Volatility Native**: We don't magically "average" your income. We base your survival on your *worst* weeks and buffer your *best* weeks using our Windfall Stabilizer.
* 🚨 **Survival Mode**: If your income dips below what you need to survive, the dashboard locks down and hands you aggressive Triage Plans.
* 🔄 **Dynamic 'Safe-to-Spend'**: Forget monthly budgets. We calculate a mathematically safe weekly spending limit that adjusts to your income volatility.
* 🛡️ **Automated Emergency Buffer**: Intercepts the "good weeks" (windfalls) to silently build a 3-month survival fund before you can spend it.
* 🤖 **AI Insurance Hub**: Upload confusing personal auto policies, and our locally running AI will extract hidden exclusions that can wreck gig workers!

## 🛠️ How we built it
We wanted this thing to be stupid fast and incredibly reliable.
* **Frontend**: React 18, Vite, Tailwind CSS, Zustand (for that buttery smooth state).
* **Backend**: Node.js, Express, Prisma ORM.
* **Brain**: **Google Gemini 2.5 Flash** reading insurance docs like a lawyer.
* **Database**: Supabase (PostgreSQL) holding down the data.

## 🚀 Run it Locally

You'll need Node 18+, a free Supabase project, and a Google Gemini API key.

### 1. Clone & Install
```bash
git clone https://github.com/ChitwandeepKaur/GigGuard.git
cd GigGuard

# Install frontend
cd frontend && npm install

# Install backend
cd ../backend && npm install
```

### 2. Environment Variables
You'll need two `.env` files.

**`backend/.env`**
```env
DATABASE_URL=postgresql://[your-supabase-db-url]
SUPABASE_URL=https://[your-supabase-project].supabase.co
SUPABASE_SERVICE_KEY=[your-service-key]
GEMINI_API_KEY=[your-gemini-key]
PORT=3001
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://[your-supabase-project].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

### 3. Database Sync & Run!
```bash
cd backend
npx prisma db push
npx prisma generate
```

Pop open two terminals:
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Hit `http://localhost:5173` and log in with the demo credentials above (`marcus@demo.com` / `demo1234`) to jump straight into the dashboard.

---
*Built with ❤️ for gig workers everywhere.*
