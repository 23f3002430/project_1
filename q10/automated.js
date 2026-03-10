async function solveDetective() {
  const EMAIL = 'PASTE_YOUR_EMAIL_HERE'; //enter your mail id here
  const BASE  = 'https://tds-network-games.sanand.workers.dev';

  async function api(method, path, body, tok) {
    const h = { 'Content-Type': 'application/json' };
    if (tok) h['X-Session-Token'] = tok;
    const r = await fetch(BASE + path, {
      method, headers: h,
      body: body ? JSON.stringify(body) : undefined
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || d.error || `HTTP ${r.status}`);
    return d;
  }

  // ── STEP 1: Start ──────────────────────────────────────
  console.log('🚀 Starting...');
  const session = await api('POST', '/detective/start', { email: EMAIL });
  const token   = session.session_token;
  const anchor  = session.anchor_node;
  const clues   = session.clues.join(' ').toLowerCase();
  console.log('Anchor:', anchor.id, '| Clues:', session.clues);

  // ── STEP 2: Pick metric from clues ─────────────────────
  let sortMetric;
  if (clues.includes('size') || clues.includes('dwarfs') || clues.includes('massive') || clues.includes('large')) {
    sortMetric = 'avg_tx_size';
  } else if (clues.includes('rare') || clues.includes('infrequent')) {
    sortMetric = 'tx_count_daily';
  } else if (clues.includes('few') || clues.includes('counterpart')) {
    sortMetric = 'counterparty_count';
  } else {
    sortMetric = 'avg_tx_size'; // default
  }
  console.log(`📊 Metric: ${sortMetric}`);

  function score(attrs) {
    if (!attrs) return 0;
    if (sortMetric === 'avg_tx_size')        return attrs.avg_tx_size ?? 0;
    if (sortMetric === 'tx_count_daily')     return 1000 - (attrs.tx_count_daily ?? 999);
    if (sortMetric === 'counterparty_count') return 1000 - (attrs.counterparty_count ?? 999);
    return attrs.avg_tx_size ?? 0;
  }

  // ── STEP 3: Greedy single-path traversal ───────────────
  // Follow ONLY the single best node each round — don't spread out!
  let allData = { [anchor.id]: anchor };
  let visited = new Set([anchor.id]);
  let queriesUsed = 0;
  let suspect = null;

  // Collect ALL scores to find global outlier
  let allScores = [{ id: anchor.id, score: score(anchor.attributes) }];

  async function queryNode(id) {
    if (visited.has(id)) return allData[id];
    const d = await api('GET', `/detective/node/${id}`, undefined, token);
    visited.add(id); allData[id] = d; queriesUsed++;
    const s = score(d.attributes);
    allScores.push({ id, score: s });
    console.log(`Node ${id} | tx_size: ${d.attributes?.avg_tx_size} | tx_count: ${d.attributes?.tx_count_daily} | counterparty: ${d.attributes?.counterparty_count} | score: ${s} | left: ${d.queries_remaining}`);
    return d;
  }

  // Start from anchor neighbors, pick best one, then go deep
  let frontier = [...anchor.neighbors];

  while (frontier.length && queriesUsed < 40) {
    // Query all current frontier
    let results = [];
    for (const id of frontier) {
      if (visited.has(id)) continue;
      const d = await queryNode(id);
      results.push({ id, score: score(d.attributes), neighbors: d.neighbors ?? [] });
    }

    // Sort by score
    results.sort((a, b) => b.score - a.score);
    const best = results[0];

    // Check if best is a MASSIVE outlier vs median
    const median = results[Math.floor(results.length / 2)]?.score ?? 0;
    console.log(`Best: Node ${best?.id} (score: ${best?.score}) | Median: ${median}`);

    if (best && best.score > median * 5 && best.score > 2000) {
      suspect = best.id;
      console.log(`🚨 SUSPECT: Node ${suspect} (score: ${best.score})`);
      break;
    }

    // Follow ONLY the top 1 node deeper (greedy single path!)
    frontier = best.neighbors.filter(id => !visited.has(id));
    console.log(`➡️ Following Node ${best.id} deeper...`);
  }

  // Fallback: global highest score
  if (!suspect) {
    allScores.sort((a, b) => b.score - a.score);
    suspect = allScores[0].id;
    console.log(`⚠️ Fallback: Node ${suspect} (score: ${allScores[0].score})`);
  }

  // ── STEP 4: Build shortest path ────────────────────────
  function shortestPath(from, to) {
    let prev = { [from]: null }, queue = [from];
    while (queue.length) {
      let c = queue.shift();
      if (c == to) {
        let p = [];
        while (c !== null) { p.unshift(parseInt(c)); c = prev[c]; }
        return p;
      }
      for (let nb of (allData[c]?.neighbors ?? [])) {
        if (!(nb in prev)) { prev[nb] = c; queue.push(nb); }
      }
    }
    return null;
  }

  let path = shortestPath(anchor.id, parseInt(suspect));

  // Query suspect neighbors if path missing
  if (!path) {
    console.log('🔍 Querying suspect neighbors for path...');
    for (const nb of allData[suspect]?.neighbors ?? []) {
      await queryNode(nb);
      path = shortestPath(anchor.id, parseInt(suspect));
      if (path) break;
    }
  }

  // Query neighbors of neighbors if still missing
  if (!path) {
    console.log('🔍 Going one level deeper for path...');
    for (const nb of allData[suspect]?.neighbors ?? []) {
      for (const nb2 of allData[nb]?.neighbors ?? []) {
        await queryNode(nb2);
        path = shortestPath(anchor.id, parseInt(suspect));
        if (path) break;
      }
      if (path) break;
    }
  }

  console.log(`\n🛤️ Path: [${path?.join(' → ')}]`);
  console.log(`📊 Queries used: ${queriesUsed}`);

  // ── STEP 5: Submit ─────────────────────────────────────
  console.log(`\nSubmitting node=${suspect}, path=[${path?.join(', ')}]`);
  const result = await api('POST', '/detective/submit', {
    compromised_node: parseInt(suspect),
    path: path
  }, token);

  console.log('Response:', result);

  if (result.completion_token) {
    console.log('\n🎉 SUCCESS! Score:', result.score);
    console.log('══════════════════════════════════════════');
    console.log(result.completion_token);
    console.log('══════════════════════════════════════════');
  } else {
    console.warn('⚠️ Failed:', JSON.stringify(result));
  }

  return result;
}

solveDetective();
