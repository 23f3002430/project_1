/**
 * 🧩 DATA LABYRINTH — AUTO SOLVER (CONSOLE v10)
 * ══════════════════════════════════════════════
 * Paste this into the console at:
 * https://tds-network-games.sanand.workers.dev/labyrinth/
 */

const EMAIL = 'yourroll@ds.study.iitm.ac.in'; // <--- EDIT YOUR EMAIL
const WEEK  = '2026-W11';                     // <--- EDIT CURRENT WEEK

(async function runLabyrinthSolver() {
  const BASE = 'https://tds-network-games.sanand.workers.dev/labyrinth';
  const COLS = 11, TOTAL = 121, LIMIT = 600, RESERVE = 60;
  const OPP  = {north:'south',south:'north',east:'west',west:'east'};
  const DELT = {north:[-1,0],south:[1,0],east:[0,1],west:[0,-1]};
  
  let TOKEN=null, Q=null, room=null, exitRoom=null, moves=0, fragCount=0;
  const visited={}, frags=[];
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));

  // --- ANALYTICS ENGINE ---
  const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
  const std = a => {
    const m = mean(a);
    return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / a.length);
  };
  const median = a => {
    const s = [...a].sort((x, y) => x - y), m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  const pct = (a, p) => {
    const s = [...a].sort((x, y) => x - y);
    return s[Math.ceil(s.length * p / 100) - 1];
  };
  const pearson = (x, y) => {
    const mx = mean(x), my = mean(y);
    const n = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0);
    return n / (Math.sqrt(x.reduce((s, xi) => s + (xi - mx) ** 2, 0)) * Math.sqrt(y.reduce((s, yi) => s + (yi - my) ** 2, 0)));
  };
  const rd = (n, dp) => Math.round(n * Math.pow(10, dp)) / Math.pow(10, dp);

  function computeAnswer(q, dp = 2) {
    const text = q.text.toLowerCase();
    const hints = q.columns_hint || [];
    const [c1, c2] = hints;
    const data = frags.filter(f => hints.every(h => f[h] !== null && f[h] !== undefined && f[h] !== ''));
    if (!data.length) return null;
    const v1 = data.map(f => Number(f[c1])), v2 = c2 ? data.map(f => Number(f[c2])) : [];
    const r = n => rd(n, dp);

    if (/mode of .* among records where .* is above its median/.test(text)) {
      const medVal = median(v2), sub = data.filter((f, i) => v2[i] > medVal).map(f => String(f[c1]));
      if (!sub.length) return null;
      const freq = {}; sub.forEach(v => freq[v] = (freq[v] || 0) + 1);
      const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
      return isNaN(top) ? top : Number(top);
    }
    if (/spearman/.test(text)) {
      const rank = a => { const s = [...a].sort((a,b)=>a-b); return a.map(v => s.indexOf(v)+1); };
      return r(pearson(rank(v1), rank(v2)));
    }
    if (/pearson|correlation/.test(text)) return r(pearson(v1, v2));
    if (/slope/.test(text) && !/intercept/.test(text)) {
      const mx = mean(v1), my = mean(v2);
      return r(v1.reduce((s, xi, i) => s + (xi - mx) * (v2[i] - my), 0) / v1.reduce((s, xi) => s + (xi - mx) ** 2, 0));
    }
    if (/intercept/.test(text)) {
      const mx = mean(v1), my = mean(v2), slp = v1.reduce((s, xi, i) => s + (xi - mx) * (v2[i] - my), 0) / v1.reduce((s, xi) => s + (xi - mx) ** 2, 0);
      return r(my - slp * mx);
    }
    if (/coefficient of variation|std\/mean/.test(text)) return r(std(v1) / mean(v1));
    if (/percentile/.test(text)) {
      const m = text.match(/(\d+)(st|nd|rd|th)\s+percentile/), p = m ? +m[1] : 50;
      if (/(greater|above|more)/.test(text)) return v1.filter(v => v > pct(v1, p)).length;
      if (/(less|below|under)/.test(text)) return v1.filter(v => v < pct(v1, p)).length;
      return pct(v1, p);
    }
    if (/interquartile|iqr/.test(text)) return pct(v1, 75) - pct(v1, 25);
    if (/weighted mean/.test(text)) return r(v1.reduce((s, x, i) => s + x * v2[i], 0) / v2.reduce((s, x) => s + x, 0));
    if (/top\s+\d+/.test(text) && /(sum|total)/.test(text)) {
       const n = parseInt(text.match(/top\s+(\d+)/)[1]);
       return [...data].sort((a, b) => Number(b[c1]) - Number(a[c1])).slice(0, n).reduce((acc, f) => acc + Number(f[c2]), 0);
    }
    if (/(mean|average)/.test(text)) return r(mean(v1));
    if (/median/.test(text)) return median(v1);
    if (/standard deviation|(?<!std\/)std/.test(text)) return r(std(v1));
    if (/variance/.test(text)) return r(Math.pow(std(v1), 2));
    if (/range/.test(text)) return Math.max(...v1) - Math.min(...v1);
    if (/mode/.test(text)) {
      const freq = {}; v1.forEach(v => freq[v] = (freq[v] || 0) + 1);
      const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
      return isNaN(top) ? top : Number(top);
    }
    if (/maximum/.test(text)) return Math.max(...v1);
    if (/minimum/.test(text)) return Math.min(...v1);
    if (/(sum|total)/.test(text)) return r(v1.reduce((a, b) => a + b, 0));
    if (/(unique|distinct)/.test(text)) return new Set(v1).size;
    if (/(how many|count)/.test(text)) return data.length;
    return null;
  }

  // --- API WRAPPERS ---
  async function api(path, body = {}, method = 'POST') {
    const url = `${BASE}/${path}?email=${EMAIL}&week_id=${WEEK}`;
    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', 'Authorization': TOKEN ? `Bearer ${TOKEN}` : '' },
        body: method === 'POST' ? JSON.stringify(body) : null
      });
      return await res.json();
    } catch(e) { return null; }
  }

  // --- SOLVER LOGIC ---
  console.log("%c 🧩 LABYRINTH SOLVER v10 INITIATED ", "background: #111827; color: #10b981; font-weight: bold; font-size: 16px; padding: 10px;");
  
  const start = await api('start');
  if (!start?.session_token) return console.error("❌ Link failed. Check EMAIL/WEEK.");
  TOKEN = start.session_token; Q = start.question; room = start.current_room; moves = start.moves_used || 0;
  console.log(`📡 Connected. Session Token: ${TOKEN.slice(0, 15)}...`);

  async function explore() {
    console.log("🔦 Exploring maze...");
    const stack = [{ id: room, exits: (await api('look', {}, 'GET')).exits, from: null }];
    visited[room] = true;

    while (stack.length && moves < LIMIT - RESERVE && fragCount < 12) {
      const curr = stack[stack.length - 1];
      let nextDir = curr.exits.find(d => {
        const [dr, dc] = DELT[d];
        const nb = (Math.floor(curr.id/COLS)+dr)*COLS + (curr.id%COLS+dc);
        return nb >= 0 && nb < TOTAL && !visited[nb];
      });

      if (!nextDir) {
        stack.pop();
        if (stack.length && curr.from) {
          const res = await api('move', { direction: OPP[curr.from] });
          room = res.room_id; moves = res.moves_used || moves + 1;
        }
        continue;
      }

      const res = await api('move', { direction: nextDir });
      if (!res?.success) { visited[neighborId(curr.id, nextDir)] = true; continue; }
      
      room = res.room_id; moves = res.moves_used || moves + 1;
      visited[room] = true;
      if (res.is_exit_room) exitRoom = room;

      const lk = await api('look', {}, 'GET');
      if (lk.has_item) {
        const col = await api('collect');
        if (col.fragment_type === 'required') {
          frags.push({ room_id: room, ...col.fragment.data });
          fragCount++;
          console.log(`💎 Fragment #${fragCount} found!`);
        }
      }
      stack.push({ id: room, exits: lk.exits, from: nextDir });
      await sleep(250);
    }
  }

  await explore();
  if (exitRoom === null) exitRoom = 120; // Guess exit if not found

  // Navigation back to exit
  console.log(`🏁 Navigating to EXIT (Room ${exitRoom})...`);
  const queue = [[room, []]]; const seen = new Set([room]);
  let path = null;
  while(queue.length) {
    const [r, p] = queue.shift();
    if (r === exitRoom) { path = p; break; }
    // Note: Simple BFS for navigation
    const dirs = ['north','south','east','west'];
    for(const d of dirs) {
      const [dr, dc] = DELT[d];
      const nb = (Math.floor(r/COLS)+dr)*COLS + (r%COLS+dc);
      if(nb >=0 && nb < TOTAL && !seen.has(nb)) { seen.add(nb); queue.push([nb, [...p, d]]); }
    }
  }
  if (path) for (const d of path) await api('move', { direction: d });

  const ans = computeAnswer(Q);
  console.log(`🧮 Answer: ${ans}`);
  const final = await api('submit', { answer: ans });
  
  if (final.completion_token) {
    console.log("%c 🏆 MISSION COMPLETE ", "background: #065f46; color: #34d399; font-weight: bold; font-size: 18px; padding: 10px;");
    console.log(`JWT: ${final.completion_token}`);
  } else {
    console.log("❌ Submission failed. Check analytics.");
  }
})();
