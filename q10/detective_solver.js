/**
 * 🕵️ DETECTIVE SOLVER — v58.3 "THE VIGILANT SOVEREIGN"
 * ══════════════════════════════════════════════════════
 * Undefeated Hybrid Logic: High Visibility + Decoy Protection.
 * Targeted Bursts (10 nodes). Bridged Paths.
 * ══════════════════════════════════════════════════════
 */

const EMAIL = 'YOUR_EMAIL@ds.study.iitm.ac.in'; // 👈 Change your email
const WEEK  = '2026-W11';                        // 👈 Change current week

(async function runVigilantSovereign() {
  const BASE = 'https://tds-network-games.sanand.workers.dev/detective';

  async function api(method, path, body, tok, retries = 3) {
    const h = { 'content-type': 'application/json' };
    if (tok) h['x-session-token'] = tok;
    
    for (let i = 0; i < retries; i++) {
      const r = await fetch(BASE + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
      if (r.status === 429) {
          console.warn(`⏳ Rate limited. Retrying in ${1 + i}s...`);
          await new Promise(res => setTimeout(res, 1000 * (i + 1)));
          continue;
      }
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return { error: d.message || d.error || `HTTP ${r.status}`, status: r.status };
      return d;
    }
    return { error: 'Rate limit exceeded after retries', status: 429 };
  }

  function bfs(from, to, currentData) {
    from = parseInt(from); to = parseInt(to);
    if (from === to) return [from];
    const prev = { [from]: null }, q = [from];
    while (q.length) {
      const c = q.shift();
      if (c === to) {
        const p = []; let cur = to;
        while (cur !== null) { p.unshift(parseInt(cur)); cur = prev[cur]; }
        return p;
      }
      for (const nb of (currentData[c]?.neighbors ?? [])) {
        const n = parseInt(nb);
        if (!(n in prev)) { prev[n] = c; q.push(n); }
      }
    }
    return null;
  }

  // ── Setup State ────────────────────────────────────────────────
  const _allData = {}, _visited = new Set();
  let _qLeft = 55, _suspect = null, _clues = [];

  console.log("%c 🕵️ RESILIENT SOVEREIGN v58.4 INITIATED ", "background: #111; color: #fbbf24; font-weight: bold; border: 2px solid #fbbf24; padding: 10px;");
  
  const sess = await api('POST', '/start', { email: EMAIL, week: WEEK });
  const token = sess.session_token;
  const anc = sess.anchor_node;
  _clues = sess.clues || [];
  _qLeft = sess.max_queries ?? 55;

  console.log(`📍 Anchor: ${anc.id} | Budget: ${_qLeft} | Clues: ${_clues.join(', ')}`);
  _allData[anc.id] = anc; _visited.add(parseInt(anc.id));

  async function qNode(id) {
    id = parseInt(id);
    if (_visited.has(id)) return _allData[id];
    _visited.add(id); // Mark as visited BEFORE query to prevent infinite loops on 403/Failures
    
    const d = await api('GET', `/node/${id}`, undefined, token);
    if (d.id) {
      _allData[id] = d;
      _qLeft = d.queries_remaining ?? (_qLeft - 1);
      console.log(`  🔎 [Q:${_qLeft}] Node ${id} | Size: ${d.attributes?.avg_tx_size}`);
    } else {
      console.warn(`  ⚠️  Query skipped for Node ${id} (${d.error || 'Unknown Error'})`);
    }
    return d;
  }

  // Phase 1: Perimeter Sweep
  await Promise.all(anc.neighbors.map(id => qNode(id).catch(()=>{})));

  // Phase 2: Decoy-Safe Targeted Bursts
  let searchCount = 0;
  while (_qLeft > 5 && !_suspect) {
    const sorted = Object.values(_allData).sort((a,b) => (b.attributes?.avg_tx_size || 0) - (a.attributes?.avg_tx_size || 0));
    const bestSize = sorted[0].attributes?.avg_tx_size || 0;

    // Target Lock Hierarchy
    if (bestSize > 12000) { _suspect = parseInt(sorted[0].id); break; }
    if (bestSize > 8000 && searchCount >= 2) { _suspect = parseInt(sorted[0].id); break; }

    const lead = Object.values(_allData)
      .filter(n => (n.neighbors || []).some(nb => !_visited.has(parseInt(nb))) && n.attributes?.avg_tx_size > 200)
      .sort((a,b) => b.attributes?.avg_tx_size - a.attributes?.avg_tx_size)[0];

    if (!lead) break;

    const burst = lead.neighbors.filter(id => !_visited.has(parseInt(id))).slice(0, 10);
    console.log(`🔥 Expanding lead node ${lead.id} (Size: ${lead.attributes.avg_tx_size})...`);

    await Promise.all(burst.map(id => qNode(id).catch(()=>{})));
    searchCount++;
  }

  if (!_suspect) {
    const final = Object.values(_allData).filter(n => n.id !== anc.id).sort((a,b) => (b.attributes?.avg_tx_size || 0) - (a.attributes?.avg_tx_size || 0));
    _suspect = parseInt(final[0].id);
  }

  let path = bfs(anc.id, _suspect, _allData);
  // Bridging missing links
  if (!path && _qLeft > 0) {
    console.warn("📍 Path broken. Bridging links...");
    for (let nb of (_allData[_suspect]?.neighbors || [])) {
      if (_qLeft <= 0) break;
      await qNode(nb); path = bfs(anc.id, _suspect, _allData); if (path) break;
    }
  }

  if (path) {
    console.log(`🚀 SUBMITTING: [${path.join(' → ')}]`);
    const resp = await api('POST', '/submit', { compromised_node: _suspect, path: path }, token);
    console.log("%c 🏆 MISSION SUCCESSFUL ", "background: #111; color: #fbbf24; font-weight: bold; padding: 10px;");
    console.log("JWT:", resp.completion_token || resp);
  } else {
    console.error("❌ Critical: No path to target established.");
  }
})();
