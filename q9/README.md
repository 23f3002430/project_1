# 🧩 Data Labyrinth — Auto Solver

Automatically solves the TDS Network Game: Data Labyrinth for any student, any week, any question.

---

## 🚀 How to Use (Step by Step)

### Step 1 — Open the Game
Go to:
```
https://tds-network-games.sanand.workers.dev/labyrinth/
```

### Step 2 — Enter Your Email and Start
- Type your **IITM email** (e.g. `23f2005160@ds.study.iitm.ac.in`)
- Click **Start Game**
- You will see the maze appear on screen

### Step 3 — Open Browser Console
- Press **F12** on your keyboard
- Click the **Console** tab at the top of the panel that opens

![Console Tab](https://i.imgur.com/placeholder.png)

### Step 4 — Edit the Script
- Open the file `labyrinth_final.js`
- Find line 1:
```javascript
const EMAIL = 'YOUR_EMAIL@ds.study.iitm.ac.in';  // ← CHANGE THIS ONLY
```
- Replace `YOUR_EMAIL` with your actual IITM email

### Step 5 — Paste and Run
- Copy the **entire script**
- Paste it into the browser console
- Press **Enter**

### Step 6 — Wait (~5 minutes)
The script will automatically:
- 🗺️ Explore all 121 rooms
- 📦 Collect all 12 data fragments
- 🚪 Navigate to the exit room
- 📊 Compute the answer
- 📤 Submit the answer
- 🏆 Print your JWT token

You will see a live progress bar like:
```
📍 Moves: 245/600 [█████████░░░░░░░░░░░] 355 left | 📦 Fragments: 8/12
```

### Step 7 — Copy Your JWT Token
At the end you will see:
```
============================================================
🏆 SUCCESS! Score=100 | Moves=372 | Wrong=0

📋 PASTE THIS TOKEN INTO THE SUBMISSION BOX:

eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...
============================================================
```
Copy the token and paste it into the submission box on the course portal.

---

## ❓ What if the Script Hits an Unknown Question?

Some weeks the question might be something the script doesn't recognise. In that case it will print:

```
❌ UNKNOWN QUESTION — needs manual calculation!

📋 COPY EVERYTHING BELOW AND PASTE INTO CLAUDE AI:

Question : <question text>
Columns  : <column names>

Fragment data (N records):
{"room_id":49, "error_code":429, ...}
{"room_id":84, "error_code":500, ...}
...

Session  : xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Submit   : fetch('...submit', {..., answer: PUT_ANSWER_HERE})
```

**What to do:**
1. Copy everything from `Question:` to the last `}`
2. Open [Claude AI](https://claude.ai)
3. Paste it and ask: *"Compute the answer for this question"*
4. Claude will give you the exact answer
5. Come back to the browser console
6. **Refresh the page** — you will still be near the exit room (or go there manually)
7. Run this in the console to submit:
```javascript
fetch('https://tds-network-games.sanand.workers.dev/labyrinth/submit', {
    method: 'POST',
    headers: {
        'content-type': 'application/json',
        'x-session-token': 'YOUR_SESSION_TOKEN'
    },
    body: JSON.stringify({answer: YOUR_ANSWER_HERE})
}).then(r => r.json()).then(d => console.log(d))
```

---

## ⚠️ Important Notes

| Thing to know | Details |
|---|---|
| **Move limit** | You have 600 moves max. Script uses ~370 moves. Safe! |
| **One session per week** | Each email gets one game per week. Don't waste it! |
| **Answer must be a number** | Not a string — script handles this automatically |
| **CORRUPT records** | Automatically excluded from calculation |
| **Exit room** | Always room 120 (so far) but script detects it dynamically |

---

## 📊 Questions the Script Handles Automatically

| Question Type | Example |
|---|---|
| Pearson correlation | *Compute the Pearson correlation between X and Y* |
| Spearman correlation | *Compute the Spearman correlation between X and Y* |
| Coefficient of variation | *Compute the CV (std/mean) of X* |
| Count > Nth percentile | *How many records have X greater than the 75th percentile?* |
| Count < Nth percentile | *How many records have X below the 25th percentile?* |
| Nth percentile value | *What is the 90th percentile of X?* |
| Mean / Average | *Compute the mean of X* |
| Median | *Compute the median of X* |
| Standard deviation | *Compute the standard deviation of X* |
| Variance | *Compute the variance of X* |
| IQR | *Compute the interquartile range of X* |
| Range | *Compute the range of X* |
| Mode | *Compute the mode of X* |
| Max / Min | *What is the maximum / minimum value of X?* |
| Sum / Total | *Compute the sum of X* |
| Unique count | *How many unique values does X have?* |
| Ratio | *What is the ratio of mean X to mean Y?* |
| Linear regression slope | *What is the slope of linear regression of Y on X?* |
| Linear regression intercept | *What is the intercept of linear regression of Y on X?* |
| Count / How many | *How many records are there?* |

---

## 🔁 Works Every Week

Just change your email on **line 1** of the script each week. Everything else is automatic:

```javascript
const EMAIL = 'YOUR_EMAIL@ds.study.iitm.ac.in';  // ← only change this
```

The script automatically detects:
- ✅ Your start room (changes per student)
- ✅ The exit room location (detected live)
- ✅ The maze layout (explored room by room)
- ✅ The question type (read from game start)
- ✅ Which columns to use (read from question hint)

---

## 🆘 Common Errors

**`POST /labyrinth/start 400`**
→ Email format is wrong. Make sure it ends with `@ds.study.iitm.ac.in`

**`not_at_exit`**
→ Script didn't reach exit room. Navigate manually to the exit room in the game then submit.

**`wrong_answer`**
→ Rounding issue. Try submitting with more decimal places manually.

**`Unable to fetch JWKS: HTTP 404`**
→ Server bug (not your fault). Post on the course forum and wait for instructor to fix.

---

*Made with ❤️ for TDS students*
