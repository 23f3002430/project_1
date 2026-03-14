/**
 * 🕵️ GRAPH DETECTIVE — AUTO SOLVER (v26 EFFICIENT HUNTER)
 * ══════════════════════════════════════════════════════
 * Paste this into the console at:
 * https://tds-network-games.sanand.workers.dev/detective/
 */

const EMAIL = 'yourroll@ds.study.iitm.ac.in'; // <--- EDIT YOUR EMAIL
const WEEK  = '2026-W11';                     // <--- EDIT CURRENT WEEK

(async function runDetectiveSolver() {
  const BASE = 'https://tds-network-games.sanand.workers.dev/detective';
  let TOKEN=null, _qLeft=55, _suspect=null, _clues=[], _allData={}, _visited=new Set(), _anchor=null;

  console.log("%c 🕵️ DETECTIVE v26 INITIATED ", "background: #111827; color: #f59e0b; font-weight: bold; font-size: 16px; padding: 10px;");

  // --- STATS LOGIC (MAD-based) ---
  function getScore(id) {
    const d = _allData[id]; if (!d?.attributes) return 0;
    const txt = _clues.join(' ').toLowerCase();
    const nodes = Object.values(_allData).filter(n => n.attributes);
    if (nodes.length < 3) return 0;
    const getZ = (k, rev=false) => {
      const vs = nodes.map(n => n.attributes[k] ?? 0).sort((a,b)=>a-b);
      const med = vs[Math.floor(vs.length/2)];
      const mad = vs.map(v => Math.abs(v-med)).sort((a,b)=>a-b)[Math.floor(vs.length/2)] || 1;
      const z = ((d.attributes[k] ?? med) - med) / (mad * 1.48);
      return rev ? -z : z;
    };
    let s = [];
    if (txt.match(/size|massive|dwarf|enormous/)) s.push(getZ('avg_tx_size'));
    if (txt.match(/volume|extraord/))           s.push(getZ('tx_volume_daily'));
    if (txt.match(/rare|infrequ|pattern/))      s.push(getZ('tx_count_daily', true));
    if (txt.match(/few|isolated|counterpart/))  s.push(getZ('counterparty_count', true));
    return s.reduce((a, b) => a + Math.max(0, b), 0);
  }

  // --- BFS PATHFINDING ---
  function findPath(from, to) {
    const prev={[from]:null}, q=[from];
    while(q.length) {
      const c = q.shift();
      if(c==to) { let p=[]; let curr=to; while(curr!=null){p.unshift(parseInt(curr)); curr=prev[curr];} return p;}
      for(const nb of (_allData[c]?.neighbors||[])) {
        if(!(nb in prev)) { prev[nb]=c; q.push(nb); }
      }
    }
    return null;
  }

  const start = await (await fetch(`${BASE}/start?email=${EMAIL}&week_id=${WEEK}`, {method:'POST'})).json();
  if(!start.session_token) return console.error("❌ Failed to start.");
  TOKEN=start.session_token; _anchor=start.anchor_node; _clues=start.clues; _qLeft=start.max_queries;
  _allData[_anchor.id] = _anchor; _visited.add(_anchor.id);

  console.log("Phase 1: Scanning Perimeter...");
  let leads = [];
  const pNb = [..._anchor.neighbors].sort((a,b) => b-a);
  for(const id of pNb) {
    if(_qLeft <= 5) break;
    const res = await (await fetch(`${BASE}/node/${id}?email=${EMAIL}&week_id=${WEEK}`, {headers:{'Authorization':`Bearer ${TOKEN}`}})).json();
    _allData[id] = res; _visited.add(id); leads.push(res);
    _qLeft = res.queries_remaining ?? (_qLeft-1);
    console.log(`Node ${id} scored: ${getScore(id).toFixed(1)}`);
  }

  console.log("Phase 2: Climbing...");
  leads.sort((a,b) => getScore(b.id) - getScore(a.id));
  let curr = leads[0];
  while(_qLeft > 3 && !_suspect) {
    const sc = getScore(curr.id);
    if(sc > 15 && (curr.neighbors?.length||0) <= 3) { _suspect=curr.id; break; }
    const nbs = curr.neighbors.filter(id => !_visited.has(parseInt(id))).sort((a,b)=>b-a);
    if(nbs.length) {
      const nextId = nbs[0];
      const res = await (await fetch(`${BASE}/node/${nextId}?email=${EMAIL}&week_id=${WEEK}`, {headers:{'Authorization':`Bearer ${TOKEN}`}})).json();
      _allData[nextId] = res; _visited.add(nextId); curr = res;
      _qLeft = res.queries_remaining ?? (_qLeft-1);
    } else {
      const front = Object.values(_allData).filter(n => n.neighbors && n.neighbors.some(nb => !_visited.has(parseInt(nb))));
      if(!front.length) break;
      curr = front.sort((a,b) => getScore(b.id)-getScore(a.id))[0];
    }
  }

  if(!_suspect) _suspect = parseInt(Object.keys(_allData).sort((a,b)=>getScore(b)-getScore(a))[0]);
  console.log(`🎯 TARGET IDENTIFIED: Node ${_suspect}`);
  
  const path = findPath(_anchor.id, _suspect);
  const sub = await (await fetch(`${BASE}/submit?email=${EMAIL}&week_id=${WEEK}`, {
    method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${TOKEN}`},
    body: JSON.stringify({target_node_id: _suspect, proof_path: path})
  })).json();

  if(sub.completion_token) {
    console.log("%c 🏆 TARGET ELIMINATED ", "background: #7c2d12; color: #fbbf24; font-weight: bold; font-size: 18px; padding: 10px;");
    console.log(`JWT: ${sub.completion_token}`);
  }
})();
