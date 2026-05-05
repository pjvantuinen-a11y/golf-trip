import { useState, useCallback, useRef, useEffect } from "react";

// ─── PASSWORD ──────────────────────────────────────────────────────────────────
const CORRECT_PASSWORD = "golf2025";

// ─── TRIPS CONFIG ──────────────────────────────────────────────────────────────
// To add a new trip, append an entry. roundNames: label for each of the 4 rounds.
const TRIPS = [
  {
    id: "spring2026", label: "Spring 2026", storageKey: "golf_scores_spring2026_v7",
    roundNames: ["Tiburon", "Mustang", "Hammock Bay", "The Rookery"],
    // Course data per round. null = use defaults. Provide { par, si, yds } arrays (18 values each).
    courses: [
      {
        name: "Tiburon (Black)",
        par: [4,4,4,3,4,5,3,4,5, 3,4,4,3,4,5,4,4,5],
        si:  [5,1,9,15,13,7,17,11,3, 16,14,8,18,6,12,2,4,10],
        yds: [354,394,366,180,360,481,134,340,541, 174,339,406,188,376,517,383,426,506],
      },
      {
        name: "Mustang",
        par: [5,4,4,4,3,4,5,3,4, 5,4,3,4,5,4,3,4,4],
        si:  [11,9,7,1,17,5,13,15,3, 10,4,14,6,8,2,16,12,18],
        yds: [462,363,374,395,142,361,507,128,363, 477,399,132,338,515,430,141,355,360],
      },
      {
        name: "Hammock Bay",
        par: [4,3,4,4,5,4,3,5,4, 4,3,5,4,4,4,5,3,4],
        si:  [5,15,11,1,9,3,13,17,7, 8,16,18,12,4,2,14,10,6],
        yds: [380,145,365,394,496,365,157,466,357, 342,136,453,331,351,405,500,167,379],
      },
      {
        name: "The Rookery",
        par: [4,4,3,5,4,4,4,3,5, 4,5,4,4,3,5,3,4,4],
        si:  [13,11,17,15,1,9,3,7,5, 10,4,12,2,14,16,18,8,6],
        yds: [361,321,134,508,397,363,374,170,500, 386,537,379,417,168,483,146,347,364],
      },
    ],
    // Pre-populated scores [roundIndex][playerId] = array of 18 gross scores
    scorecardLinks: [
      { name: "Tiburon (Black)",      url: "https://www.tiburonnaples.com/Files/Library/BLACKCOURSE2023.PDF" },
      { name: "Mustang at Lely",      url: "https://www.lelyresortgolfandcountryclub.com/wp-content/uploads/sites/63/2026/02/2026-Lely-Mustang-Scorecard-web.pdf" },
      { name: "Hammock Bay",          url: "https://img1.wsimg.com/blobby/go/9a779eda-1c94-4638-b73d-5849c939071d/downloads/54d48c87-2e24-43d4-b362-091fd501d7c3/Hammock%20Bay%20FL%209.25.pdf?ver=1775834256489" },
      { name: "The Rookery at Marco", url: "https://img1.wsimg.com/blobby/go/9a779eda-1c94-4638-b73d-5849c939071d/downloads/c9864d5f-5a7e-43d8-9059-7923107af86d/Rookery%20at%20Marco%209.25.pdf?ver=1775834256404" },
    ],
    preScores: {
      0: {
        jared:   [4,7,4,4,7,8,4,6,8, 4,5,6,6,6,7,6,7,8],
        brandon: [5,5,5,4,5,7,5,5,7, 3,7,6,3,4,5,7,6,5],
        travis:  [6,5,5,4,5,7,5,7,7, 4,5,5,5,5,5,5,6,5],
        patrick: [4,5,4,3,4,5,3,4,5, 5,5,5,4,5,6,7,4,4],
      },
      1: {
        jared:   [5,5,6,6,3,6,7,3,5, 5,5,3,6,7,5,5,6,5],
        brandon: [7,5,5,4,6,5,6,4,7, 6,6,4,5,6,6,4,5,4],
        travis:  [6,4,5,4,2,7,6,3,5, 5,2,3,6,6,6,3,5,6],
        patrick: [6,4,3,5,4,5,5,4,6, 7,5,4,4,6,4,4,4,7],
      },
      2: {
        jared:   [7,4,4,6,6,5,4,4,4, 4,6,6,6,5,5,6,4,7],
        brandon: [4,4,5,6,6,4,3,7,7, 7,4,5,5,6,6,8,4,5],
        travis:  [5,4,5,5,6,6,4,5,5, 4,6,7,6,5,7,6,4,5],
        patrick: [4,4,4,5,6,6,3,5,4, 4,6,6,7,5,7,6,3,5],
      },
      3: {
        jared:   [5,4,4,6,7,5,5,5,8, 5,8,5,8,4,7,6,6,6],
        brandon: [6,6,4,7,6,4,5,5,6, 5,7,4,6,4,7,4,5,5],
        travis:  [4,4,3,7,7,4,4,4,5, 5,6,4,6,4,5,4,6,5],
        patrick: [4,5,4,6,7,4,4,3,6, 5,8,5,6,3,6,5,6,6],
      },
    },
  },
  {
    id: "fall2026", label: "Fall 2026", storageKey: "golf_scores_fall2026",
    roundNames: ["Round 1", "Round 2", "Round 3", "Round 4"],
    courses: [null, null, null, null],
    preScores: {},
    players: [
      { id: "jared",   name: "Jared",   handicap: 21 },
      { id: "brandon", name: "Brandon", handicap: 18 },
      { id: "travis",  name: "Travis",  handicap: 12 },
      { id: "patrick", name: "Patrick", handicap: 10 },
    ],
  },
];

// ─── SHARED CONFIG ─────────────────────────────────────────────────────────────
const DEFAULT_PLAYERS = [
  { id: "jared",   name: "Jared",   handicap: 14 },
  { id: "brandon", name: "Brandon", handicap: 8  },
  { id: "travis",  name: "Travis",  handicap: 0  },
  { id: "patrick", name: "Patrick", handicap: 0  },
];

function getPlayers(trip) {
  return trip?.players || DEFAULT_PLAYERS;
}

const ROUND_TEAMS = [
  [["jared", "travis"], ["brandon", "patrick"]],
  [["jared", "brandon"], ["travis", "patrick"]],
  [["jared", "patrick"], ["brandon", "travis"]],
  [["jared", "travis"], ["brandon", "patrick"]],
];

const HOLES = Array.from({ length: 18 }, (_, i) => i + 1);

// Default course data (used when a round has no specific course)
const DEFAULT_PAR  = [4,4,4,3,4,5,3,4,5, 4,3,5,4,4,3,5,4,4];
const DEFAULT_SI   = [5,1,9,15,13,7,17,11,3, 2,11,4,13,6,15,8,17,12];
const DEFAULT_YDS  = [null,null,null,null,null,null,null,null,null, null,null,null,null,null,null,null,null,null];

function getCourseData(trip, roundIndex) {
  const c = trip.courses?.[roundIndex];
  if (!c) return { par: DEFAULT_PAR, si: DEFAULT_SI, yds: DEFAULT_YDS, name: null };
  return { par: c.par, si: c.si, yds: c.yds, name: c.name };
}

// ─── SCORE HELPERS ─────────────────────────────────────────────────────────────
function getStrokesOnHole(handicapStrokes, si) {
  if (handicapStrokes >= 18 && si <= 18) return 1 + (handicapStrokes >= 36 && si <= (handicapStrokes - 18) ? 1 : 0);
  return si <= handicapStrokes ? 1 : 0;
}

function initScores() {
  const s = {};
  DEFAULT_PLAYERS.forEach(p => { s[p.id] = Array.from({ length: 4 }, () => Array(18).fill(null)); });
  return s;
}

function initScoresWithPreset(trip) {
  const s = initScores();
  if (trip.preScores) {
    Object.entries(trip.preScores).forEach(([rIdx, playerMap]) => {
      Object.entries(playerMap).forEach(([pid, holeScores]) => {
        if (s[pid]) s[pid][parseInt(rIdx)] = [...holeScores];
      });
    });
  }
  return s;
}

function getNet(gross, playerId, holeIndex, par, si, players) {
  if (gross === null) return null;
  const pl = players || DEFAULT_PLAYERS;
  const p = pl.find(x => x.id === playerId);
  const minHcp = Math.min(...pl.map(x => x.handicap));
  const relHcp = p.handicap - minHcp;
  return gross - getStrokesOnHole(relHcp, si[holeIndex]);
}

function getBestBallResult(scores, roundIndex, par, si, players) {
  const teams = ROUND_TEAMS[roundIndex];
  const [t1, t2] = teams;
  let t1pts = 0, t2pts = 0;
  const holes = [];
  for (let h = 0; h < 18; h++) {
    const t1nets = t1.map(pid => getNet(scores[pid][roundIndex][h], pid, h, par, si, players)).filter(x => x !== null);
    const t2nets = t2.map(pid => getNet(scores[pid][roundIndex][h], pid, h, par, si, players)).filter(x => x !== null);
    if (t1nets.length === 0 || t2nets.length === 0) { holes.push(null); continue; }
    const t1best = Math.min(...t1nets);
    const t2best = Math.min(...t2nets);
    let res;
    if (t1best < t2best) { t1pts++; res = 1; }
    else if (t2best < t1best) { t2pts++; res = 2; }
    else { res = 0; }
    holes.push(res);
  }
  return { t1pts, t2pts, holes, teams };
}

function getMatchPlayStatus(t1pts, t2pts, holesPlayed) {
  const diff = t1pts - t2pts;
  const remaining = 18 - holesPlayed;
  if (holesPlayed === 0) return "All Square";
  if (diff === 0) return "All Square";
  const leader = diff > 0 ? 1 : 2;
  const abs = Math.abs(diff);
  if (abs > remaining) return `Team ${leader} wins ${abs}&${remaining}`;
  if (remaining === 0) return abs > 0 ? `Team ${leader} wins ${abs} UP` : "All Square - Tied!";
  return `Team ${leader} ${abs} UP (${remaining} to play)`;
}

function getEclecticScores(scores, trip) {
  const players = getPlayers(trip);
  const eclectic = {};
  players.forEach(p => {
    eclectic[p.id] = Array(18).fill(null);
    for (let h = 0; h < 18; h++) {
      const nets = [];
      for (let r = 0; r < 4; r++) {
        const { par, si } = getCourseData(trip, r);
        const gross = scores[p.id][r][h];
        if (gross !== null) nets.push(getNet(gross, p.id, h, par, si, players));
      }
      if (nets.length > 0) eclectic[p.id][h] = Math.min(...nets);
    }
  });
  return eclectic;
}

function getTotalNet(scores, playerId, roundIndex, par, si, players) {
  let total = 0, played = 0;
  for (let h = 0; h < 18; h++) {
    const gross = scores[playerId][roundIndex][h];
    if (gross !== null) { total += getNet(gross, playerId, h, par, si, players); played++; }
  }
  return { total, played };
}

function getOverallNetScore(scores, playerId, trip) {
  const players = getPlayers(trip);
  let total = 0, rounds = 0;
  for (let r = 0; r < 4; r++) {
    const { par, si } = getCourseData(trip, r);
    const { total: rt, played } = getTotalNet(scores, playerId, r, par, si, players);
    if (played === 18) { total += rt; rounds++; }
  }
  return { total, rounds };
}

// ─── STYLES ────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --green: #1a3a2a; --green-mid: #2d5a3d; --green-light: #4a8c5c;
    --fairway: #c8d9a0; --white: #f5f0e8; --ink: #1a1a14;
    --gold: #c9a84c; --red: #b84444; --card: rgba(245,240,232,0.96);
  }
  body { background: var(--green); font-family: 'DM Sans', sans-serif; color: var(--ink); }
  .app {
    min-height: 100vh;
    background: radial-gradient(ellipse at 20% 0%, rgba(74,140,92,0.3) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 100%, rgba(29,90,61,0.4) 0%, transparent 50%),
      linear-gradient(160deg, #0f2419 0%, #1a3a2a 40%, #0f2419 100%);
    padding: 0 0 60px 0;
  }
  .header { text-align: center; padding: 36px 20px 8px; position: relative; }
  .header::after { content: ''; display: block; width: 120px; height: 2px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent); margin: 16px auto 0; }
  .header h1 { font-family: 'Playfair Display', serif; font-size: clamp(24px,5vw,42px);
    font-weight: 900; color: var(--white); letter-spacing: 0.02em; line-height: 1.1; }
  .header h1 span { color: var(--gold); }
  .header p { color: var(--fairway); font-size: 13px; letter-spacing: 0.15em;
    text-transform: uppercase; margin-top: 6px; font-weight: 300; }

  .trip-nav { display: flex; justify-content: center; gap: 0; padding: 20px 16px 0; flex-wrap: wrap; }
  .trip-tab {
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12);
    color: rgba(200,217,160,0.6); font-family: 'Playfair Display', serif; font-size: 13px;
    font-weight: 700; letter-spacing: 0.03em; padding: 10px 22px; cursor: pointer; transition: all 0.2s; position: relative;
  }
  .trip-tab:first-child { border-radius: 8px 0 0 8px; }
  .trip-tab:last-child  { border-radius: 0 8px 8px 0; }
  .trip-tab:only-child  { border-radius: 8px; }
  .trip-tab:not(:first-child) { border-left: none; }
  .trip-tab:hover { background: rgba(255,255,255,0.1); color: var(--white); }
  .trip-tab.active { background: var(--gold); border-color: var(--gold); color: var(--ink); }
  .trip-tab.active::after { content: ''; position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%);
    width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid var(--gold); }

  .nav { display: flex; justify-content: center; gap: 6px; padding: 24px 16px 20px; flex-wrap: wrap; }
  .nav-btn { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15);
    color: var(--fairway); font-family: 'DM Mono', monospace; font-size: 11px;
    letter-spacing: 0.1em; text-transform: uppercase; padding: 8px 16px; border-radius: 4px;
    cursor: pointer; transition: all 0.2s; }
  .nav-btn:hover { background: rgba(255,255,255,0.12); color: var(--white); }
  .nav-btn.active { background: var(--gold); border-color: var(--gold); color: var(--ink); font-weight: 500; }

  .container { max-width: 960px; margin: 0 auto; padding: 0 16px; }
  .card { background: var(--card); border-radius: 12px; padding: 24px; margin-bottom: 16px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.3); }
  .card-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700;
    color: var(--green); margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
  .card-title .badge { background: var(--green); color: var(--gold); font-family: 'DM Mono', monospace;
    font-size: 10px; letter-spacing: 0.1em; padding: 3px 8px; border-radius: 3px; text-transform: uppercase; }

  .score-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .score-table th { background: var(--green); color: var(--fairway); font-family: 'DM Mono', monospace;
    font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; padding: 8px 6px; text-align: center; }
  .score-table th.player-col { text-align: left; padding-left: 12px; min-width: 80px; }
  .score-table th.yds-lbl { color: #7ab890; }
  .score-table th.si-lbl  { color: #8fc4a0; }
  .score-table td { padding: 4px 3px; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.06); }
  .score-table td.player-name { text-align: left; padding-left: 12px; font-weight: 500; font-size: 13px; white-space: nowrap; }
  .score-table td.player-name .hcp { font-family: 'DM Mono', monospace; font-size: 10px; color: #888; margin-left: 4px; }
  .score-table .info-row-cell { font-family: 'DM Mono', monospace; font-size: 11px; padding: 3px 3px;
    text-align: center; border-bottom: 1px solid rgba(0,0,0,0.04); }
  .score-table .info-row-cell.label { text-align: left; padding-left: 12px; font-size: 10px;
    letter-spacing: 0.08em; text-transform: uppercase; }

  .score-input { width: 36px; height: 30px; border: 1px solid #ddd; border-radius: 4px; text-align: center;
    font-family: 'DM Mono', monospace; font-size: 13px; color: var(--ink); background: white; transition: border-color 0.15s; }
  .score-input:focus { outline: none; border-color: var(--green-light); background: #f0faf4; }
  .score-input.birdie { background: #ffd700; border-color: #c9a000; }
  .score-input.eagle  { background: #ff8c00; color: white; border-color: #cc7000; }
  .score-input.bogey  { background: #ffeeee; border-color: #ffbbbb; }
  .score-input.double { background: #ffd0d0; border-color: #ffaaaa; }

  .total-cell { font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500;
    background: rgba(26,58,42,0.05); padding: 4px 8px !important; }
  .net-cell { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--green-mid); padding: 4px 8px !important; }
  .teams-row { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
  .team-block { flex: 1; min-width: 160px; border-radius: 8px; padding: 14px 16px; border: 2px solid; }
  .team-block.t1 { background: rgba(26,58,42,0.08); border-color: var(--green-mid); }
  .team-block.t2 { background: rgba(184,68,68,0.06); border-color: var(--red); }
  .team-label { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.12em;
    text-transform: uppercase; margin-bottom: 6px; font-weight: 500; }
  .t1 .team-label { color: var(--green-mid); }
  .t2 .team-label { color: var(--red); }
  .team-players { font-size: 15px; font-weight: 500; }
  .match-status { text-align: center; font-family: 'Playfair Display', serif; font-size: 18px;
    font-weight: 700; padding: 12px; border-radius: 8px; background: var(--green); color: var(--gold); margin-bottom: 16px; }
  .hole-results { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
  .hole-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center;
    justify-content: center; font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500; border: 1px solid rgba(0,0,0,0.1); }
  .hole-dot.t1-win  { background: var(--green-mid); color: white; }
  .hole-dot.t2-win  { background: var(--red); color: white; }
  .hole-dot.halved  { background: #e8e0d0; color: #666; }
  .hole-dot.unplayed { background: #f0ebe0; color: #bbb; border-style: dashed; }
  .leaderboard { width: 100%; border-collapse: collapse; }
  .leaderboard th { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.1em;
    text-transform: uppercase; color: #666; padding: 8px 12px; text-align: left; border-bottom: 2px solid rgba(0,0,0,0.1); }
  .leaderboard th.right { text-align: right; }
  .leaderboard td { padding: 12px 12px; border-bottom: 1px solid rgba(0,0,0,0.07); }
  .leaderboard td.right { text-align: right; }
  .leaderboard tr:last-child td { border-bottom: none; }
  .rank { width: 28px; height: 28px; background: var(--green); color: var(--gold); border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
    font-family: 'DM Mono', monospace; font-size: 12px; font-weight: 500; }
  .rank.gold { background: var(--gold); color: var(--ink); }
  .score-big { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--green); }
  .score-sub { font-family: 'DM Mono', monospace; font-size: 11px; color: #888; margin-top: 2px; }
  .eclectic-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .eclectic-table th { background: var(--green); color: var(--fairway); font-family: 'DM Mono', monospace;
    font-size: 9px; letter-spacing: 0.07em; text-transform: uppercase; padding: 6px 4px; text-align: center; }
  .eclectic-table th.player-col { text-align: left; padding-left: 10px; }
  .eclectic-table td { padding: 5px 4px; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.05); }
  .eclectic-table td.player-name { text-align: left; padding-left: 10px; font-weight: 500; }
  .eclectic-cell { font-family: 'DM Mono', monospace; }
  .eclectic-cell.eagle  { color: #cc7000; font-weight: 700; }
  .eclectic-cell.birdie { color: #b8860b; font-weight: 600; }
  .eclectic-cell.par    { color: var(--green-mid); }
  .eclectic-cell.bogey  { color: #cc4444; }
  .eclectic-cell.double { color: #991111; font-weight: 600; }
  .eclectic-cell.empty  { color: #ccc; }
  .section-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(0,0,0,0.12), transparent); margin: 16px 0; }
  .round-tabs { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
  .round-tab { background: rgba(26,58,42,0.08); border: 1px solid rgba(26,58,42,0.2);
    color: var(--green-mid); font-family: 'DM Mono', monospace; font-size: 11px;
    letter-spacing: 0.08em; text-transform: uppercase; padding: 6px 14px; border-radius: 4px; cursor: pointer; }
  .round-tab.active { background: var(--green); color: var(--gold); border-color: var(--green); }
  .info-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
  .info-chip { background: rgba(26,58,42,0.08); border: 1px solid rgba(26,58,42,0.15);
    border-radius: 20px; padding: 4px 12px; font-size: 12px; font-family: 'DM Mono', monospace; color: var(--green-mid); }
  .course-name-tag { font-family: 'DM Mono', monospace; font-size: 11px; color: #777;
    letter-spacing: 0.06em; margin-bottom: 12px; }
  .scorecard-links { max-width: 960px; margin: 32px auto 0; padding: 0 16px; }
  .scorecard-links-card { background: rgba(245,240,232,0.06); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; padding: 20px 24px; }
  .scorecard-links-title { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.15em;
    text-transform: uppercase; color: var(--fairway); margin-bottom: 14px; opacity: 0.7; }
  .scorecard-links-grid { display: flex; flex-wrap: wrap; gap: 10px; }
  .scorecard-link-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15);
    color: var(--fairway); font-family: 'DM Mono', monospace; font-size: 11px;
    letter-spacing: 0.06em; padding: 9px 16px; border-radius: 6px;
    text-decoration: none; transition: all 0.2s; cursor: pointer;
  }
  .scorecard-link-btn:hover { background: rgba(201,168,76,0.15); border-color: var(--gold); color: var(--gold); }
  .scorecard-link-btn svg { opacity: 0.7; flex-shrink: 0; }
  @keyframes fadeInUp {
    from { opacity:0; transform:translateX(-50%) translateY(12px); }
    to   { opacity:1; transform:translateX(-50%) translateY(0); }
  }
  @keyframes shake {
    0%,100%{transform:translateX(0)} 15%{transform:translateX(-8px)} 30%{transform:translateX(8px)}
    45%{transform:translateX(-6px)} 60%{transform:translateX(6px)} 75%{transform:translateX(-3px)} 90%{transform:translateX(3px)}
  }
`;

// ─── PASSWORD GATE ─────────────────────────────────────────────────────────────
function PasswordGate({ onUnlock }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const attempt = () => {
    if (input === CORRECT_PASSWORD) {
      onUnlock();
    } else {
      setError(true); setShake(true); setInput("");
      setTimeout(() => setShake(false), 600);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg, #0f2419 0%, #1a3a2a 40%, #0f2419 100%)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <style>{css}</style>
      <div style={{ background:"rgba(245,240,232,0.97)", borderRadius:16, padding:"48px 40px",
        maxWidth:380, width:"100%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.5)",
        animation: shake ? "shake 0.6s ease" : "none" }}>
        <div style={{fontSize:48, marginBottom:16}}>⛳</div>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:900,color:"#1a3a2a",marginBottom:6}}>
          Golf Trip <span style={{color:"#c9a84c"}}>2026</span>
        </h1>
        <p style={{fontSize:13,color:"#888",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:32,fontFamily:"'DM Mono',monospace"}}>
          Members Only
        </p>
        <input ref={inputRef} type="password" placeholder="Enter password" value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && attempt()}
          style={{ width:"100%", padding:"12px 16px", border:`2px solid ${error?"#b84444":"#ddd"}`,
            borderRadius:8, fontSize:15, fontFamily:"'DM Mono',monospace", textAlign:"center",
            outline:"none", marginBottom:12, background: error ? "#fff5f5" : "white",
            transition:"border-color 0.2s, background 0.2s", letterSpacing:"0.2em" }} />
        {error && <p style={{color:"#b84444",fontSize:12,marginBottom:12,fontFamily:"'DM Mono',monospace"}}>Incorrect password. Try again.</p>}
        <button onClick={attempt}
          onMouseEnter={e => e.target.style.background="#2d5a3d"}
          onMouseLeave={e => e.target.style.background="#1a3a2a"}
          style={{ width:"100%", padding:"12px", background:"#1a3a2a", color:"#c9a84c", border:"none",
            borderRadius:8, fontSize:13, fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em",
            textTransform:"uppercase", cursor:"pointer", fontWeight:500, transition:"background 0.2s" }}>
          Enter →
        </button>
      </div>
    </div>
  );
}

// ─── SINGLE TRIP INSTANCE ──────────────────────────────────────────────────────
function TripApp({ trip }) {
  const [tab, setTab] = useState("scorecard");
  const [activeRound, setActiveRound] = useState(0);
  const [toast, setToast] = useState(null);
  const [scores, setScores] = useState(() => {
    try {
      const saved = localStorage.getItem(trip.storageKey);
      if (saved) return JSON.parse(saved);
      const preset = initScoresWithPreset(trip);
      localStorage.setItem(trip.storageKey, JSON.stringify(preset));
      return preset;
    } catch { return initScoresWithPreset(trip); }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(trip.storageKey);
      if (saved) { setScores(JSON.parse(saved)); }
      else {
        const preset = initScoresWithPreset(trip);
        localStorage.setItem(trip.storageKey, JSON.stringify(preset));
        setScores(preset);
      }
    } catch { setScores(initScoresWithPreset(trip)); }
    setTab("scorecard");
    setActiveRound(0);
  }, [trip.storageKey]);

  const showToast = (msg, color = "#2d5a3d") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };

  const saveScores = () => {
    try {
      localStorage.setItem(trip.storageKey, JSON.stringify(scores));
      showToast("✓ Scores saved!");
    } catch { showToast("✗ Save failed", "#b84444"); }
  };

  const setScore = useCallback((playerId, roundIndex, holeIndex, value) => {
    const num = value === "" ? null : parseInt(value, 10);
    if (value !== "" && (isNaN(num) || num < 1 || num > 15)) return;
    setScores(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[playerId][roundIndex][holeIndex] = value === "" ? null : num;
      return next;
    });
  }, []);

  const resetScores = () => {
    if (confirm(`Reset ALL scores for Golf Trip ${trip.label}? This cannot be undone.`)) {
      const fresh = initScoresWithPreset(trip);
      setScores(fresh);
      localStorage.setItem(trip.storageKey, JSON.stringify(fresh));
      showToast("Scores reset", "#b84444");
    }
  };

  return (
    <>
      {toast && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
          background: toast.color, color:"white", padding:"12px 28px", borderRadius:8,
          fontFamily:"'DM Mono',monospace", fontSize:13, letterSpacing:"0.06em",
          zIndex:9999, boxShadow:"0 4px 20px rgba(0,0,0,0.4)",
          animation:"fadeInUp 0.3s ease", whiteSpace:"nowrap" }}>{toast.msg}</div>
      )}
      <nav className="nav">
        {[
          { id: "scorecard", label: "Scorecard" },
          { id: "matchplay", label: "Match Play" },
          { id: "individual", label: "Net Scores" },
          { id: "eclectic",  label: "Eclectic" },
        ].map(t => (
          <button key={t.id} className={`nav-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
        <button className="nav-btn" onClick={saveScores} style={{borderColor:"#c9a84c",color:"#c9a84c"}}>💾 Save</button>
        <button className="nav-btn" onClick={resetScores} style={{borderColor:"#c44",color:"#c44"}}>Reset</button>
      </nav>
      <div className="container">
        {tab === "scorecard"  && <ScorecardTab scores={scores} setScore={setScore} activeRound={activeRound} setActiveRound={setActiveRound} trip={trip} />}
        {tab === "matchplay"  && <MatchPlayTab scores={scores} activeRound={activeRound} setActiveRound={setActiveRound} trip={trip} />}
        {tab === "individual" && <IndividualTab scores={scores} trip={trip} />}
        {tab === "eclectic"   && <EclecticTab scores={scores} trip={trip} />}
      </div>
    </>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function GolfTripApp() {
  const [unlocked, setUnlocked] = useState(() => {
    try { return sessionStorage.getItem("golf_unlocked") === "yes"; } catch { return false; }
  });
  const [activeTrip, setActiveTrip] = useState(TRIPS[0].id);

  const handleUnlock = () => {
    try { sessionStorage.setItem("golf_unlocked", "yes"); } catch {}
    setUnlocked(true);
  };

  if (!unlocked) return <PasswordGate onUnlock={handleUnlock} />;

  const currentTrip = TRIPS.find(t => t.id === activeTrip) || TRIPS[0];

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <h1>⛳ Golf <span>Trip</span></h1>
          <p>Jared · Brandon · Travis · Patrick</p>
        </div>
        <div className="trip-nav">
          {TRIPS.map(trip => (
            <button key={trip.id} className={`trip-tab ${activeTrip === trip.id ? "active" : ""}`}
              onClick={() => setActiveTrip(trip.id)}>
              {trip.label}
            </button>
          ))}
        </div>
        <TripApp key={currentTrip.id} trip={currentTrip} />
        {currentTrip.scorecardLinks && (
          <div className="scorecard-links">
            <div className="scorecard-links-card">
              <div className="scorecard-links-title">📄 Official Scorecards</div>
              <div className="scorecard-links-grid">
                {currentTrip.scorecardLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="scorecard-link-btn">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 2h4v1H3v6h6V7h1v2.5a.5.5 0 01-.5.5h-7a.5.5 0 01-.5-.5v-7A.5.5 0 012 2z" fill="currentColor"/>
                      <path d="M7 2h3v3h-1V3.7L5.85 6.85l-.7-.7L8.3 3H7V2z" fill="currentColor"/>
                    </svg>
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── SCORECARD TAB ─────────────────────────────────────────────────────────────
function ScorecardTab({ scores, setScore, activeRound, setActiveRound, trip }) {
  const teams = ROUND_TEAMS[activeRound];
  const players = getPlayers(trip);
  const minHcp = Math.min(...players.map(p => p.handicap));
  const { par, si, yds, name } = getCourseData(trip, activeRound);
  const roundNames = trip.roundNames || ["Round 1","Round 2","Round 3","Round 4"];

  return (
    <>
      <div className="card">
        <div className="card-title">
          Score Entry
          <span className="badge">{roundNames[activeRound]}</span>
        </div>
        <div className="round-tabs">
          {[0,1,2,3].map(r => (
            <button key={r} className={`round-tab ${activeRound === r ? "active" : ""}`} onClick={() => setActiveRound(r)}>
              {roundNames[r]}
            </button>
          ))}
        </div>
        {name && <div className="course-name-tag">📍 {name}</div>}
        <div className="teams-row">
          {teams.map((team, ti) => (
            <div key={ti} className={`team-block t${ti+1}`}>
              <div className="team-label">Team {ti+1}</div>
              <div className="team-players">{team.map(pid => players.find(p => p.id === pid).name).join(" & ")}</div>
            </div>
          ))}
        </div>
        <div className="info-row">
          {players.map(p => {
            const rel = p.handicap - minHcp;
            return <div key={p.id} className="info-chip">{p.name}: {rel > 0 ? `+${rel} strokes` : "scratch"}</div>;
          })}
        </div>
        <div style={{overflowX:"auto"}}>
          <ScoreEntryTable scores={scores} setScore={setScore} roundIndex={activeRound} section="front" par={par} si={si} yds={yds} trip={trip} />
        </div>
        <div className="section-divider" />
        <div style={{overflowX:"auto"}}>
          <ScoreEntryTable scores={scores} setScore={setScore} roundIndex={activeRound} section="back" par={par} si={si} yds={yds} trip={trip} />
        </div>
      </div>
    </>
  );
}

function ScoreEntryTable({ scores, setScore, roundIndex, section, par, si, yds, trip }) {
  const holeNums = section === "front" ? HOLES.slice(0,9) : HOLES.slice(9);
  const holeIdxs = section === "front" ? Array.from({length:9},(_,i)=>i) : Array.from({length:9},(_,i)=>i+9);
  const hasYds = yds && yds.some(y => y !== null);

  return (
    <table className="score-table">
      <thead>
        <tr>
          <th className="player-col">Player</th>
          {holeNums.map(h => <th key={h}>{h}</th>)}
          <th>Gross</th><th>Net</th>
        </tr>
        {hasYds && (
          <tr>
            <th className="player-col yds-lbl">Yds</th>
            {holeIdxs.map(i => <th key={i} className="yds-lbl">{yds[i] ?? "—"}</th>)}
            <th className="yds-lbl">{holeIdxs.reduce((s,i) => s + (yds[i] || 0), 0)}</th>
            <th></th>
          </tr>
        )}
        <tr>
          <th className="player-col" style={{color:"#8ab",fontWeight:400}}>Par</th>
          {holeIdxs.map(i => <th key={i} style={{color:"#8ab",fontWeight:400}}>{par[i]}</th>)}
          <th style={{color:"#8ab",fontWeight:400}}>{holeIdxs.reduce((s,i)=>s+par[i],0)}</th>
          <th></th>
        </tr>
        <tr>
          <th className="player-col si-lbl">SI</th>
          {holeIdxs.map(i => <th key={i} className="si-lbl">{si[i]}</th>)}
          <th></th><th></th>
        </tr>
      </thead>
      <tbody>
        {(trip ? getPlayers(trip) : DEFAULT_PLAYERS).map(player => {
          const grossTotal = holeIdxs.reduce((s,i) => s + (scores[player.id][roundIndex][i] || 0), 0);
          const netTotal = holeIdxs.reduce((s,i) => {
            const g = scores[player.id][roundIndex][i];
            return g !== null ? s + getNet(g, player.id, i, par, si) : s;
          }, 0);
          const playedCount = holeIdxs.filter(i => scores[player.id][roundIndex][i] !== null).length;
          return (
            <tr key={player.id}>
              <td className="player-name">{player.name}<span className="hcp">({player.handicap})</span></td>
              {holeIdxs.map(hIdx => {
                const gross = scores[player.id][roundIndex][hIdx];
                const p = par[hIdx];
                let cls = "";
                if (gross !== null) {
                  if (gross <= p - 2) cls = "eagle";
                  else if (gross === p - 1) cls = "birdie";
                  else if (gross === p + 1) cls = "bogey";
                  else if (gross >= p + 2) cls = "double";
                }
                return (
                  <td key={hIdx}>
                    <input className={`score-input ${cls}`} type="number" min="1" max="15"
                      value={gross === null ? "" : gross}
                      onChange={e => setScore(player.id, roundIndex, hIdx, e.target.value)} />
                  </td>
                );
              })}
              <td className="total-cell">{playedCount > 0 ? grossTotal : "—"}</td>
              <td className="net-cell">{playedCount > 0 ? netTotal : "—"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── MATCH PLAY TAB ────────────────────────────────────────────────────────────
function MatchPlayTab({ scores, activeRound, setActiveRound, trip }) {
  const roundNames = trip.roundNames || ["Round 1","Round 2","Round 3","Round 4"];
  return (
    <>
      <div className="card">
        <div className="card-title">Best Ball Match Play</div>
        <div className="round-tabs">
          {[0,1,2,3].map(r => (
            <button key={r} className={`round-tab ${activeRound === r ? "active" : ""}`} onClick={() => setActiveRound(r)}>
              {roundNames[r]}
            </button>
          ))}
        </div>
        <RoundMatchPlay scores={scores} roundIndex={activeRound} trip={trip} />
      </div>
      <div className="card">
        <div className="card-title">All Rounds Summary</div>
        {[0,1,2,3].map(r => <RoundMatchSummary key={r} scores={scores} roundIndex={r} trip={trip} roundName={roundNames[r]} />)}
      </div>
    </>
  );
}

function RoundMatchPlay({ scores, roundIndex, trip }) {
  const { par, si } = getCourseData(trip, roundIndex);
  const players = getPlayers(trip);
  const { t1pts, t2pts, holes, teams } = getBestBallResult(scores, roundIndex, par, si, players);
  const holesPlayed = holes.filter(h => h !== null).length;
  const status = getMatchPlayStatus(t1pts, t2pts, holesPlayed);
  return (
    <>
      <div className="teams-row">
        {teams.map((team, ti) => (
          <div key={ti} className={`team-block t${ti+1}`}>
            <div className="team-label">Team {ti+1}</div>
            <div className="team-players">{team.map(pid => players.find(p => p.id === pid).name).join(" & ")}</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700,marginTop:8,color:ti===0?"#2d5a3d":"#b84444"}}>
              {holesPlayed > 0 ? (ti === 0 ? t1pts : t2pts) : "—"}
              <span style={{fontSize:13,fontFamily:"'DM Sans',sans-serif",fontWeight:400,color:"#888",marginLeft:4}}>holes won</span>
            </div>
          </div>
        ))}
      </div>
      <div className="match-status">{holesPlayed === 0 ? "No scores entered yet" : status}</div>
      <div style={{fontSize:12,color:"#666",marginBottom:8,fontFamily:"'DM Mono',monospace",letterSpacing:"0.05em"}}>HOLE BY HOLE</div>
      <div className="hole-results">
        {holes.map((res, i) => (
          <div key={i} className={`hole-dot ${res === null ? "unplayed" : res === 1 ? "t1-win" : res === 2 ? "t2-win" : "halved"}`}
            title={`Hole ${i+1}`}>{i+1}</div>
        ))}
      </div>
      <div style={{display:"flex",gap:12,marginTop:10,fontSize:11,color:"#888",fontFamily:"'DM Mono',monospace"}}>
        <span><span style={{display:"inline-block",width:10,height:10,borderRadius:"50%",background:"#2d5a3d",marginRight:4}}/>Team 1</span>
        <span><span style={{display:"inline-block",width:10,height:10,borderRadius:"50%",background:"#b84444",marginRight:4}}/>Team 2</span>
        <span><span style={{display:"inline-block",width:10,height:10,borderRadius:"50%",background:"#e8e0d0",border:"1px solid #ccc",marginRight:4}}/>Halved</span>
      </div>
    </>
  );
}

function RoundMatchSummary({ scores, roundIndex, trip, roundName }) {
  const { par, si } = getCourseData(trip, roundIndex);
  const players = getPlayers(trip);
  const { t1pts, t2pts, holes, teams } = getBestBallResult(scores, roundIndex, par, si, players);
  const holesPlayed = holes.filter(h => h !== null).length;
  const status = holesPlayed === 0 ? "Not started" : getMatchPlayStatus(t1pts, t2pts, holesPlayed);
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid rgba(0,0,0,0.07)"}}>
      <div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#888",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{roundName}</div>
        <div style={{fontSize:13}}>
          <span style={{color:"#2d5a3d",fontWeight:500}}>{teams[0].map(id=>players.find(p=>p.id===id).name).join(" & ")}</span>
          <span style={{color:"#999",margin:"0 6px"}}>vs</span>
          <span style={{color:"#b84444",fontWeight:500}}>{teams[1].map(id=>players.find(p=>p.id===id).name).join(" & ")}</span>
        </div>
      </div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,textAlign:"right",color:holesPlayed===0?"#aaa":"var(--ink)"}}>
        {status}
      </div>
    </div>
  );
}

// ─── INDIVIDUAL NET SCORES TAB ─────────────────────────────────────────────────
function IndividualTab({ scores, trip }) {
  const roundNames = trip.roundNames || ["Round 1","Round 2","Round 3","Round 4"];
  const players = getPlayers(trip);
  const standings = players.map(p => {
    const { total, rounds } = getOverallNetScore(scores, p.id, trip);
    const roundNets = Array.from({length:4}, (_,r) => {
      const { par, si } = getCourseData(trip, r);
      const { total: rt, played } = getTotalNet(scores, p.id, r, par, si, players);
      return { net: played === 18 ? rt : null, played };
    });
    return { player: p, total, rounds, roundNets };
  }).sort((a,b) => {
    if (a.rounds === 0 && b.rounds === 0) return 0;
    if (a.rounds === 0) return 1;
    if (b.rounds === 0) return -1;
    return a.total - b.total;
  });

  return (
    <div className="card">
      <div className="card-title">Overall Net Score <span className="badge">4 Rounds</span></div>
      <p style={{fontSize:12,color:"#888",marginBottom:16}}>Lowest combined net score across all 4 completed rounds wins.</p>
      <table className="leaderboard">
        <thead>
          <tr>
            <th></th><th>Player</th>
            {roundNames.map((n,i) => <th key={i} className="right" style={{fontSize:9}}>{n}</th>)}
            <th className="right">Total</th>
          </tr>
        </thead>
        <tbody>
          {standings.map(({ player, total, rounds, roundNets }, idx) => (
            <tr key={player.id}>
              <td><span className={`rank ${idx===0&&rounds>0?"gold":""}`}>{idx+1}</span></td>
              <td>
                <div style={{fontWeight:500}}>{player.name}</div>
                <div style={{fontSize:11,color:"#888",fontFamily:"'DM Mono',monospace"}}>HCP {player.handicap}</div>
              </td>
              {roundNets.map((rn, ri) => (
                <td key={ri} className="right">
                  {rn.net !== null
                    ? <span className="score-big" style={{fontSize:16}}>{rn.net}</span>
                    : rn.played > 0
                    ? <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"#aaa"}}>{rn.played}/18</span>
                    : <span style={{color:"#ddd"}}>—</span>}
                </td>
              ))}
              <td className="right">
                {rounds > 0
                  ? <><div className="score-big">{total}</div><div className="score-sub">{rounds} round{rounds>1?"s":""}</div></>
                  : <span style={{color:"#ccc",fontFamily:"'DM Mono',monospace"}}>—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── ECLECTIC TAB ──────────────────────────────────────────────────────────────
function EclecticTab({ scores, trip }) {
  // Use round 0's par for eclectic vs-par display (or default)
  const { par: displayPar } = getCourseData(trip, 0);
  const eclectic = getEclecticScores(scores, trip);
  const players = getPlayers(trip);
  const totals = players.map(p => {
    const holes = eclectic[p.id];
    const complete = holes.filter(h => h !== null).length;
    const total = holes.reduce((s, h) => s + (h || 0), 0);
    const netVsPar = holes.reduce((s, h, i) => h !== null ? s + (h - displayPar[i]) : s, 0);
    return { player: p, holes, complete, total, netVsPar };
  }).sort((a,b) => b.complete - a.complete || a.total - b.total);

  function cellClass(net, par) {
    if (net === null) return "empty";
    const diff = net - par;
    if (diff <= -2) return "eagle";
    if (diff === -1) return "birdie";
    if (diff === 0) return "par";
    if (diff === 1) return "bogey";
    return "double";
  }

  return (
    <div className="card">
      <div className="card-title">Eclectic Scores <span className="badge">Best Net Per Hole</span></div>
      <p style={{fontSize:12,color:"#888",marginBottom:16}}>Best net score on each hole across all 4 rounds.</p>
      <div style={{overflowX:"auto"}}>
        <table className="eclectic-table">
          <thead>
            <tr>
              <th className="player-col">Player</th>
              {HOLES.slice(0,9).map(h => <th key={h}>{h}</th>)}
              <th>Out</th>
              {HOLES.slice(9).map(h => <th key={h}>{h}</th>)}
              <th>In</th><th>Tot</th><th>+/-</th>
            </tr>
            <tr>
              <th className="player-col" style={{color:"#8ab",fontWeight:400}}>Par</th>
              {displayPar.slice(0,9).map((p,i) => <th key={i} style={{color:"#8ab",fontWeight:400}}>{p}</th>)}
              <th style={{color:"#8ab",fontWeight:400}}>{displayPar.slice(0,9).reduce((s,p)=>s+p,0)}</th>
              {displayPar.slice(9).map((p,i) => <th key={i} style={{color:"#8ab",fontWeight:400}}>{p}</th>)}
              <th style={{color:"#8ab",fontWeight:400}}>{displayPar.slice(9).reduce((s,p)=>s+p,0)}</th>
              <th style={{color:"#8ab",fontWeight:400}}>{displayPar.reduce((s,p)=>s+p,0)}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {totals.map(({ player, holes, total, netVsPar }) => {
              const frontTotal = holes.slice(0,9).reduce((s,h)=>s+(h||0),0);
              const backTotal = holes.slice(9).reduce((s,h)=>s+(h||0),0);
              const frontComplete = holes.slice(0,9).filter(h=>h!==null).length;
              const backComplete = holes.slice(9).filter(h=>h!==null).length;
              return (
                <tr key={player.id}>
                  <td className="player-name">{player.name}</td>
                  {holes.slice(0,9).map((h,i) => (
                    <td key={i}><span className={`eclectic-cell ${cellClass(h, displayPar[i])}`}>{h !== null ? h : "·"}</span></td>
                  ))}
                  <td style={{fontFamily:"'DM Mono',monospace",fontWeight:500,background:"rgba(0,0,0,0.03)"}}>
                    {frontComplete > 0 ? frontTotal : "—"}
                  </td>
                  {holes.slice(9).map((h,i) => (
                    <td key={i}><span className={`eclectic-cell ${cellClass(h, displayPar[i+9])}`}>{h !== null ? h : "·"}</span></td>
                  ))}
                  <td style={{fontFamily:"'DM Mono',monospace",fontWeight:500,background:"rgba(0,0,0,0.03)"}}>
                    {backComplete > 0 ? backTotal : "—"}
                  </td>
                  <td style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700}}>
                    {frontComplete + backComplete > 0 ? total : "—"}
                  </td>
                  <td style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:500,
                    color: netVsPar < 0 ? "#c9a000" : netVsPar > 0 ? "#b84444" : "#2d5a3d"}}>
                    {frontComplete + backComplete > 0
                      ? (netVsPar === 0 ? "E" : netVsPar > 0 ? `+${netVsPar}` : netVsPar)
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{display:"flex",gap:16,marginTop:16,flexWrap:"wrap",fontSize:11,fontFamily:"'DM Mono',monospace",color:"#888"}}>
        {[["eagle","#cc7000","≤-2"],["birdie","#b8860b","-1"],["par","#2d5a3d","E"],["bogey","#cc4444","+1"],["double","#991111","≥+2"]].map(([cls,col,lbl])=>(
          <span key={cls}><span style={{color:col,fontWeight:600}}>{lbl}</span> {cls}</span>
        ))}
      </div>
    </div>
  );
}
