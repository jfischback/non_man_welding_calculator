// Compares calc.js with values read from the Google Sheet (Welding!A12:H51) for each
// scenario in scenarios.js. The sheet values were captured on 26 Oct 2026 from a test copy
// of OEMS Welding and Hot Work Calculator v1.0 DRAFT. Run: node tests/check.js
const fs = require("fs");
const S = require("./scenarios.js");
const { TABLES: T } = require("../data.js");
const { calculate } = require("../calc.js");
const ALL = JSON.parse(fs.readFileSync(__dirname + "/sheet-results.json"));
let failed = 0;
const tables = [];
S.forEach((s, n) => {
const v = ALL[n];
const g = (r, c) => (v[r] && v[r][c] !== undefined ? String(v[r][c]) : "");
const full = (list, c) => (c === "" ? "" : list.find((t) => t.charAt(0) === c));
const rows = [];
for (let k = 0; k < 8; k++) { const r = s.rows[k] || {}; rows.push({ metal: r.metal || "", from: r.from || "", pick: r.pick || "", acgih: r.acgih ?? "", adopted: r.adopted || "" }); }
const r = calculate({ process: s.process, baseMetal: s.baseMetal, surface: s.surface, sampling: s.sampling, rows,
  topCurrent: s.topCurrent, pfBasis: s.pfBasis, field: full(T.field, s.field), fieldBasis: s.fieldBasis, room: full(T.room, s.room), roomBasis: s.roomBasis,
  duration: full(T.duration, s.duration), durationBasis: s.durationBasis, controlLevel: T.controls.find((x) => String(x[0]) === s.controlLevel)[1],
  controlType: s.controlType, positioned: s.positioned, admin: s.admin === "Yes" ? T.admin[1] : "No", confidence: full(T.confidence, s.confidence) });
const f = (x, dp) => (typeof x === "number" ? x.toFixed(dp) : String(x));
const out = [];
const add = (label, sheet, web) => out.push([label, sheet, String(web)]);
add("Whole fume risk (H12)", g(0, 7), r.fumeRisk);
s.rows.forEach((row, k) => {
  const x = r.rows[k];
  add(`${row.metal}: limit (D${13 + k})`, g(1 + k, 3), x.limit);
  add(`${row.metal}: source (E${13 + k})`, g(1 + k, 4), x.source);
  add(`${row.metal}: OSHA PEL (F${13 + k})`, g(1 + k, 5), x.osha);
  add(`${row.metal}: hazard (G${13 + k})`, g(1 + k, 6), x.hazard);
  add(`${row.metal}: risk (H${13 + k})`, g(1 + k, 7), x.risk);
});
add("Gate 2 (B22)", g(10, 1), r.gate2);
add("Gate 3 (B23)", g(11, 1), r.gate3);
add("Base metal (B24)", g(12, 1), r.baseList);
add("PF score (C28)", g(16, 2), r.pf);
add("PF check (E28)", g(16, 4), r.pfCheck);
add("Field Position (C31)", g(19, 2), r.fp);
add("Room (C32)", g(20, 2), r.rm);
add("Room check (E32)", g(20, 4), r.roomCheck);
add("Environment text (B33)", g(21, 1), r.envText);
add("Environment (C33)", g(21, 2), f(r.en, 2));
add("Duration (C34)", g(22, 2), r.d);
add("Exposure Score (C35)", g(23, 2), f(r.es, 4));
add("Credited level (B42)", g(30, 1), r.level);
add("Reduction (D42)", g(30, 3), typeof r.reduction === "number" ? Math.round(r.reduction * 100) + "%" : r.reduction);
add("Control note (E42)", g(30, 4), r.controlNote);
add("Residual (B43)", g(31, 1), f(r.residual, 2));
add("Tier (B46)", g(34, 1), r.tier);
add("Band (F47)", g(35, 5), r.band);
add("Governing (B48)", g(36, 1), r.governing);
add("Risk (F48)", g(36, 5), r.risk);
add("Decision (F49)", g(37, 5), r.decision);
add("Band-sensitive (B50)", g(38, 1), r.sensitive);
add("Status (B51)", g(39, 1), r.status);
let bad = 0;
const md = ["| Output | Sheet | Web page | Match |", "|---|---|---|---|"];
for (const [l, a, b] of out) { const ok = a === b; if (!ok) bad++; md.push(`| ${l} | ${a || "(blank)"} | ${b || "(blank)"} | ${ok ? "✓" : "✗"} |`); }
tables.push(`### ${s.name}\n\n` + md.join("\n") + "\n");
console.log(s.name, "-", out.length, "outputs,", bad, "mismatches");
out.filter(([, a, b]) => a !== b).forEach((x) => console.log("  MISMATCH", JSON.stringify(x)));
failed += bad;
});
if (process.argv[2] === "--markdown") fs.writeFileSync(__dirname + "/results.md", "# Sheet vs web page\n\n" + tables.join("\n"));
process.exit(failed ? 1 : 0);
