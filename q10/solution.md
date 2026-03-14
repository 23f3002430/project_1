# 🕵️ Graph Detective — Auto Solver

Automatically solves the TDS Network Game: Graph Detective for any student, any week, any graph.

---

# IMPORTANT
> ### 🚀 RECOMMENDED :
> For a much faster, fully automated experience with visual path mapping and real-time candidate scoring, use the high-performance web portal:
> **[https://tds-games-solver.vercel.app/](https://tds-games-solver.vercel.app/)**
> 
> **Why use the Web App?**
> *   🚀 **Fully Automatic**: Hand-free target hunting using Master v26 logic.
> *   🔄 **One-Click Reset**: Instant session wipe if your queries run low.
> *   📡 **Smart Analytics**: Uses MAD-based statistical extraction for 99% accuracy.

## 🛠️ Alternative Method: Console Script

### Step 1 — Open the Game

Go to:
```
https://tds-network-games.sanand.workers.dev/detective/
```

### Step 2 — Log In with Your IITM Email

- Click **Login** or **Start**
- Enter your **IITM email** (e.g. `23fXXXXXXX@ds.study.iitm.ac.in`)
- The transaction graph will appear on screen

### Step 3 — Open Browser Console

- Press **F12** on your keyboard
- Click the **Console** tab at the top of the panel that opens

### Step 4 — Edit the Script

- Open the file `automated.js`
- Find line 1:

```javascript
const EMAIL = 'YOUR_EMAIL@ds.study.iitm.ac.in';  // ← CHANGE THIS ONLY
```

- Replace with your actual IITM email

### Step 5 — Paste and Run

- Copy the **entire script** from `automated.js`
- Paste it into the browser console
- Press **Enter**

### Step 6 — Watch It Solve Automatically

The script will:

- 🚀 Start a new session automatically
- 📖 Read the clues to decide which metric to follow
- 🔍 Query nodes greedily, following the most suspicious trail
- 🚨 Detect the compromised node (massive tx_size outlier)
- 🛤️ Find the shortest proof path from anchor → compromised node
- 📤 Submit the answer
- 🏆 Print your JWT token

You will see live output like:

```
🚀 Starting...
Anchor: 3 | Clues: ['Transactions are rare but individually massive.', ...]
📊 Metric: avg_tx_size
Node 46  | tx_size: 912  | tx_count: 10 | counterparty: 5  | left: 39
Node 119 | tx_size: 9780 | tx_count: 3  | counterparty: 4  | left: 30
🚨 SUSPECT: Node 119 (score: 9780)
🛤️ Path: [3 → 119]
📊 Queries used: 25
```

### Step 7 — Copy Your JWT Token

At the end you will see:

```
🎉 SUCCESS! Score: 545
══════════════════════════════════════════
COMPLETION TOKEN:
eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...
══════════════════════════════════════════
```

Copy the **entire token** (one long string, no spaces) and paste it into the submission box on the course portal.

---

### Reset Your Session (Optional)
If you are out of queries or want to start fresh, use the [detective_reset.js](./detective_reset.js) script. Paste it into your console.

## 🔁 Works For

| Scenario | Supported |
|----------|-----------|
| Any IITM student email | ✅ |
| Any week (week_id changes) | ✅ |
| Any anchor node | ✅ |
| Any graph structure | ✅ |
| Different clues each week | ✅ |
| Path length 2, 3, or more hops | ✅ |
