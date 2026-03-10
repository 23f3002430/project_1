(async () => {

// ============================================================
//  The Signal — Auto Solver v11 (BULLETPROOF)
//  Works for any week, any email, any map, any inventory
//
//  HOW TO USE:
//  1. Go to https://tds-network-games.sanand.workers.dev/signal/
//  2. Set your EMAIL below
//  3. Paste entire script into DevTools Console → Enter
// ============================================================

const EMAIL = 'YOUR_EMAIL@ds.study.iitm.ac.in'; // ← CHANGE THIS

const BASE = 'https://tds-network-games.sanand.workers.dev/signal';
const sl   = ms => new Promise(r => setTimeout(r, ms));
let TOKEN  = null;

const log = msg => console.log(msg);
const ok  = msg => console.log(`  ✅ ${msg}`);
const err = msg => console.log(`  ❌ ${msg}`);
const inf = msg => console.log(`  ℹ️  ${msg}`);

// ── API ───────────────────────────────────────────────────────
const GET  = ep => fetch(`${BASE}/${ep}`, {
    headers: { 'x-session-token': TOKEN }
}).then(r => r.json());

const POST = (ep, body) => fetch(`${BASE}/${ep}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-session-token': TOKEN },
    body: JSON.stringify(body)
}).then(r => r.json());

const look    = ()        => GET('look');
const getInv  = ()        => GET('inventory');
const examine = t         => GET(`examine?target=${t}`);
const moveDir = dir       => POST('move',    { direction: dir });
const takeItem= item      => POST('take',    { item });
const combine = (a, b)    => POST('combine', { item_a: a, item_b: b });
const useIt   = (t, v)    => POST('use',     { target: t, value: v });
const useArr  = (t, arr)  => POST('use',     { target: t, inputs: arr });

// ── NAVIGATION ────────────────────────────────────────────────
// ADJ: { roomId: { neighborId: { dir, locked, requires } } }
// Built entirely from live /look responses — never from /map
const ADJ = {};

function learnExits(room, exits) {
    if (!ADJ[room]) ADJ[room] = {};
    for (const [dir, info] of Object.entries(exits || {})) {
        ADJ[room][info.to] = {
            dir,
            locked: info.locked || false,
            requires: info.requires || null
        };
    }
}

function unlockPath(item) {
    let unlocked = 0;
    for (const neighbors of Object.values(ADJ)) {
        for (const info of Object.values(neighbors)) {
            if (info.requires === item && info.locked) {
                info.locked = false;
                unlocked++;
            }
        }
    }
    if (unlocked) inf(`Unlocked ${unlocked} path(s) requiring ${item}`);
}

function bfsPath(from, to) {
    if (from === to) return [];
    const queue = [[from, []]];
    const visited = new Set([from]);
    while (queue.length) {
        const [cur, path] = queue.shift();
        for (const [neighbor, info] of Object.entries(ADJ[cur] || {})) {
            if (info.locked || visited.has(neighbor)) continue;
            const newPath = [...path, info.dir];
            if (neighbor === to) return newPath;
            visited.add(neighbor);
            queue.push([neighbor, newPath]);
        }
    }
    return null;
}

async function goTo(target) {
    for (let i = 0; i < 30; i++) {
        const state = await look();
        learnExits(state.room, state.exits);
        if (state.room === target) return true;
        const path = bfsPath(state.room, target);
        if (!path || path.length === 0) return false;
        await moveDir(path[0]);
        await sl(250);
    }
    return false;
}

// ── BFS ROOM CRAWLER ─────────────────────────────────────────
// Discovers all reachable rooms by walking the graph live
async function crawlAllRooms(onVisit) {
    const visited = new Set();
    const queue = [];

    // Start from current room
    const start = await look();
    learnExits(start.room, start.exits);
    queue.push(start.room);

    while (queue.length) {
        const target = queue.shift();
        if (visited.has(target)) continue;

        const reached = await goTo(target);
        if (!reached) { inf(`Cannot reach ${target} yet`); continue; }

        const state = await look();
        learnExits(state.room, state.exits);
        visited.add(state.room);

        await onVisit(state);

        // Enqueue newly discovered unlocked neighbors
        for (const [neighbor, info] of Object.entries(ADJ[state.room] || {})) {
            if (!info.locked && !visited.has(neighbor)) {
                queue.push(neighbor);
            }
        }
    }

    return visited;
}

// ── START ─────────────────────────────────────────────────────
log('='.repeat(60));
log('  The Signal — Auto Solver v11 (Bulletproof)');
log('='.repeat(60));

const startData = await POST('start', { email: EMAIL });
TOKEN = startData.session_token || startData.token;
log(`Token: ${TOKEN}`);
if (!TOKEN) { err('No token — check your email'); return; }

// ── Phase 1: Crawl all reachable rooms, collect all items ─────
log('\n📦 Phase 1: Collecting items from all reachable rooms...');
const inventory = [];

await crawlAllRooms(async (state) => {
    if (state.room === 'CORE_CHAMBER') return; // skip exit room for now
    log(`\n📍 ${state.room}`);
    for (const item of (state.items_here || [])) {
        const res = await takeItem(item);
        await sl(150);
        if (!res.error) { ok(`Took ${item}`); inventory.push(item); }
        else inf(`Skip ${item}: ${res.message}`);
    }
});

log(`\nInventory: ${inventory.join(', ')}`);

// ── Phase 2: Craft all known recipes ─────────────────────────
log('\n🔧 Phase 2: Crafting...');

// Known fixed recipes (confirmed not to change week to week)
const RECIPES = [
    ['CLEANING_CLOTH',  'SOLVENT_BOTTLE', null],         // → DEMAGNETISER
    ['DEMAGNETISER',    'ACCESS_CARD',    null],         // → REPAIRED_ACCESS_CARD
    ['FREQUENCY_TUNER', 'POWER_CELL',     null],         // → POWERED_TUNER
];

async function tryCraft(a, b) {
    if (!inventory.includes(a) || !inventory.includes(b)) return null;
    const res = await combine(a, b);
    await sl(200);
    if (res.success && res.output) {
        ok(`${a} + ${b} → ${res.output}`);
        inventory.splice(inventory.indexOf(a), 1);
        inventory.splice(inventory.indexOf(b), 1);
        inventory.push(res.output);
        // Unlock any doors this item enables
        unlockPath(res.output);
        return res.output;
    }
    return null;
}

// Try recipes in order — output of one feeds into next
for (const [a, b] of RECIPES) {
    await tryCraft(a, b);
}

log(`Inventory: ${inventory.join(', ')}`);

// ── Phase 3: Re-crawl newly unlocked rooms ────────────────────
log('\n🔓 Phase 3: Collecting items from newly unlocked rooms...');

await crawlAllRooms(async (state) => {
    if (state.room === 'CORE_CHAMBER') return;
    const newItems = (state.items_here || []).filter(i => !inventory.includes(i));
    for (const item of newItems) {
        const res = await takeItem(item);
        await sl(150);
        if (!res.error) { ok(`Took ${item}`); inventory.push(item); }
    }
});

// Try crafting again with any new items
for (const [a, b] of RECIPES) {
    await tryCraft(a, b);
}

log(`Final inventory: ${inventory.join(', ')}`);

// ── Phase 4: Read puzzle requirements from /inventory ─────────
log('\n🔍 Phase 4: Reading puzzle state...');
const invData = await getInv();
const puzzles = invData.puzzles || {};
log(`Puzzles: ${JSON.stringify(puzzles)}`);

// ── Phase 5: Solve PIN ────────────────────────────────────────
log('\n🔐 Phase 5: Solving PIN...');

let frag1 = puzzles.PUZZLE_1_PIN?.fragment || null;
if (frag1) {
    ok(`PIN already solved: ${frag1}`);
} else {
    // Find INSPECTION_CERTIFICATE and NOTEBOOK in inventory
    const certItem = inventory.find(i => i.includes('CERT') || i.includes('INSPECTION'));
    const noteItem = inventory.find(i => i.includes('NOTE') || i.includes('BOOK'));

    if (!certItem || !noteItem) {
        err(`Missing cert (${certItem}) or notebook (${noteItem})`); return;
    }

    const certEx = await examine(certItem);
    const noteEx = await examine(noteItem);
    inf(`CERT: ${certEx.description}`);
    inf(`NOTE: ${noteEx.description}`);

    const yearMatch     = certEx.description.match(/inspection date[:\s]*(\d{4})/i);
    const sublevelMatch = noteEx.description.match(/level\s+(\d+)\s+sublevel/i)
                       || noteEx.description.match(/sublevel[^\d]*(\d+)/i)
                       || noteEx.description.match(/floor[^\d]*(\d+)/i)
                       || noteEx.description.match(/number (\d+) is circled/i);

    const year     = yearMatch     ? parseInt(yearMatch[1])     : null;
    const sublevel = sublevelMatch ? parseInt(sublevelMatch[1]) : null;
    const pin      = (year && sublevel) ? year + sublevel : null;

    inf(`Year: ${year}, Sublevel: ${sublevel}, PIN: ${pin}`);
    if (!pin) { err('Could not extract PIN'); return; }

    // Find room with PIN_TERMINAL feature
    let pinRoom = null;
    for (const [room, neighbors] of Object.entries(ADJ)) {
        const state = await (async () => {
            const reached = await goTo(room);
            if (!reached) return null;
            return look();
        })();
        if (!state) continue;
        const features = state.features || [];
        if (features.some(f => f.id === 'PIN_TERMINAL')) { pinRoom = room; break; }
    }

    if (!pinRoom) { err('Could not find PIN_TERMINAL'); return; }
    await goTo(pinRoom);
    const pinRes = await useIt('PIN_TERMINAL', pin);
    inf(`PIN result: ${JSON.stringify(pinRes)}`);
    frag1 = pinRes.fragment || pinRes.fragment_revealed;
    if (!frag1) { err(`PIN failed: ${pinRes.message}`); return; }
    ok(`Fragment 1: ${frag1}`);
}

// ── Phase 6: Solve Frequency ──────────────────────────────────
log('\n📡 Phase 6: Solving Frequency...');

let frag2 = puzzles.PUZZLE_2_FREQUENCY?.fragment || null;
if (frag2) {
    ok(`Frequency already solved: ${frag2}`);
} else {
    const sigItem = inventory.find(i => i.includes('SIGNAL_LOG'));
    const bakItem = inventory.find(i => i.includes('BACKUP_LOG'));
    const tuner   = inventory.find(i => i.includes('POWERED_TUNER'));

    if (!sigItem || !bakItem) { err('Missing SIGNAL_LOG or BACKUP_LOG'); return; }
    if (!tuner)               { err('Missing POWERED_TUNER');            return; }

    const sigEx = await examine(sigItem);
    const bakEx = await examine(bakItem);

    const sigFreqs = [...sigEx.description.matchAll(/(\d{2,3}\.\d)\s*MHz/g)].map(m => m[1]);
    const bakFreqs = [...bakEx.description.matchAll(/(\d{2,3}\.\d)\s*MHz/g)].map(m => m[1]);
    inf(`SIGNAL: [${sigFreqs.join(', ')}]`);
    inf(`BACKUP: [${bakFreqs.join(', ')}]`);

    const matchFreq = sigFreqs.find(f => bakFreqs.includes(f));
    if (!matchFreq) { err('No matching frequency'); return; }
    inf(`Match: ${matchFreq} MHz`);

    // Find room with RADIO_TRANSMITTER
    let radioRoom = null;
    for (const room of Object.keys(ADJ)) {
        const reached = await goTo(room);
        if (!reached) continue;
        const state = await look();
        if ((state.features || []).some(f => f.id === 'RADIO_TRANSMITTER')) {
            radioRoom = room; break;
        }
    }

    if (!radioRoom) { err('Could not find RADIO_TRANSMITTER'); return; }
    await goTo(radioRoom);
    const freqRes = await useIt('RADIO_TRANSMITTER', matchFreq);
    inf(`FREQ result: ${JSON.stringify(freqRes)}`);
    frag2 = freqRes.fragment || freqRes.fragment_revealed;
    if (!frag2) { err(`Frequency failed: ${freqRes.message}`); return; }
    ok(`Fragment 2: ${frag2}`);
}

// ── Phase 7: Verify ───────────────────────────────────────────
log('\n🔗 Phase 7: Verifying...');

let frag3 = puzzles.PUZZLE_3_VERIFY?.fragment || null;
if (frag3) {
    ok(`Verify already solved: ${frag3}`);
} else {
    // Find room with TERMINAL_3
    let verifyRoom = null;
    for (const room of Object.keys(ADJ)) {
        const reached = await goTo(room);
        if (!reached) continue;
        const state = await look();
        if ((state.features || []).some(f => f.id === 'TERMINAL_3')) {
            verifyRoom = room; break;
        }
    }

    if (!verifyRoom) { err('Could not find TERMINAL_3'); return; }
    await goTo(verifyRoom);
    const verifyRes = await useArr('TERMINAL_3', [frag1, frag2]);
    inf(`VERIFY result: ${JSON.stringify(verifyRes)}`);
    frag3 = verifyRes.fragment || verifyRes.fragment_revealed;

    // Fallback: read from inventory puzzles
    if (!frag3) {
        const inv2 = await getInv();
        frag3 = inv2?.puzzles?.PUZZLE_3_VERIFY?.fragment;
    }
    if (!frag3) { err(`Verify failed: ${verifyRes.message}`); return; }
    ok(`Fragment 3: ${frag3}`);
}

// ── Phase 8: Exit ─────────────────────────────────────────────
log('\n🚪 Phase 8: Escaping...');
const passcode = `${frag1}${frag2}${frag3}`;
inf(`Passcode: ${passcode}`);

// Find room with EXIT_KEYPAD
let exitRoom = null;
for (const room of Object.keys(ADJ)) {
    const reached = await goTo(room);
    if (!reached) continue;
    const state = await look();
    if ((state.features || []).some(f => f.id === 'EXIT_KEYPAD')) {
        exitRoom = room; break;
    }
}

// Also try CORE_CHAMBER directly
if (!exitRoom) {
    unlockPath('REPAIRED_ACCESS_CARD'); // ensure unlocked
    const reached = await goTo('CORE_CHAMBER');
    if (reached) exitRoom = 'CORE_CHAMBER';
}

if (!exitRoom) { err('Could not find EXIT_KEYPAD'); return; }
await goTo(exitRoom);
const exitRes = await useIt('EXIT_KEYPAD', passcode);
inf(`EXIT result: ${JSON.stringify(exitRes)}`);

const jwt = exitRes.completion_token || exitRes.token || exitRes.jwt;
if (jwt) {
    log('\n' + '='.repeat(60));
    log('🏆 ESCAPED!');
    log(`Score: ${exitRes.score}`);
    log('JWT:');
    log('='.repeat(60));
    log(jwt);
    log('='.repeat(60));
} else {
    err(`Exit failed: ${JSON.stringify(exitRes)}`);
}

})();
