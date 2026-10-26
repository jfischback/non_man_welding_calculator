// Calculation logic copied from the "Welding" tab of the OEMS Welding and Hot Work
// Calculator v1.0 DRAFT Google Sheet. The sheet cell each piece comes from is noted.
// Blank inputs and blank results are "" to match the sheet's ="" checks.

if (typeof module !== "undefined") {
  Object.assign(globalThis, require("./data.js"));
}

const ADMIN_CREDIT = TABLES.controls[1][2]; // Tables!C48, 15%
const FAN_TEXT = "A fan blowing fume away is not a control: it moves fume to others. Record it.";
const CHLORINATED = "Chlorinated solvent residue";

// Sheets works to 15 significant digits; this keeps JS float noise out of
// comparisons and text (e.g. 61.750000000000004 -> 61.75).
function clean(x) {
  return Number(x.toPrecision(15));
}

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

// VALUE(LEFT(text, 1)) on a pick-list text like "4 – Welder at the work ...".
function lead(text) {
  return text === "" ? "" : Number(text.charAt(0));
}

// MATCH(value, Tables!$B$58:$B$62, 1): the band is the last cutoff at or below the residual.
function band(residual) {
  let b = "";
  TABLES.bands.forEach((from, i) => {
    if (clean(residual) >= from) b = i + 1;
  });
  return b;
}

// Hazard from a particulate limit in mg/m³ (Metals!L, Welding!G13 "lh").
function hazardFromLimit(v) {
  if (v > 10) return 1;
  if (v > 1) return 2;
  if (v > 0.1) return 3;
  if (v > 0.01) return 4;
  return 5;
}

// Metals!N: the highest T12 hazard among the primary codes (M) and adopted codes (P).
function hazardFromCodes(codes, adopted) {
  let max = 0;
  (codes + "," + adopted).split(",").forEach((c) => {
    const h = TABLES.hcodes[c.trim().toUpperCase()];
    if (h > max) max = h;
  });
  return max;
}

const metalByName = (name) => METALS.find((m) => m.name === name);

// Welding!D13 (limit used) and E13 (limit source used) for one Gate 1 row.
function limitFor(metal, pickIn, acgih) {
  const acg = acgih, nio = metal.niosh, weel = metal.weel, osha = metal.osha, cal = metal.cal;
  const pick = pickIn === "" ? "Lowest available" : pickIn;
  const big = 1e99;
  const or = (v) => (v === "" ? big : v);

  const dflt = acg !== "" ? acg : osha !== "" ? osha : nio !== "" ? nio : weel !== "" ? weel : "";
  const dsrc = acg !== "" ? "ACGIH TLV (entered)" : osha !== "" ? "OSHA PEL" : nio !== "" ? "NIOSH REL" : weel !== "" ? "AIHA WEEL" : "None";

  const lowm = Math.min(or(acg), or(osha), or(cal), or(nio), or(weel));
  const low = lowm >= big ? "" : lowm;
  const lsrc = lowm >= big ? "None"
    : acg === lowm ? "ACGIH TLV (entered)"
    : osha === lowm ? "OSHA PEL"
    : cal === lowm ? "Cal/OSHA PEL"
    : nio === lowm ? "NIOSH REL"
    : "AIHA WEEL";

  const picked = { "OSHA": [osha, "OSHA PEL"], "Cal/OSHA": [cal, "Cal/OSHA PEL"], "NIOSH": [nio, "NIOSH REL"], "AIHA": [weel, "AIHA WEEL"], "ACGIH": [acg, "ACGIH TLV (entered)"] }[pick] || ["", ""];
  const [pk, psrc] = picked;

  let v, src;
  if (pick === "Default order") { v = dflt; src = dsrc; }
  else if (pick === "Lowest available") { v = low; src = lsrc; }
  else if (pk !== "") { v = pk; src = psrc; }
  else { v = low; src = lsrc + " (picked source has no value: lowest used)"; }

  return { limit: v === "" ? "None" : v, source: src };
}

function calculate(i) {
  const r = {};
  const surface = i.surface;

  // 02 Gates — Gate 1 constituent rows (Welding rows 13 to 20)
  r.rows = i.rows.map((row) => {
    if (row.metal === "") return { limit: "", source: "", osha: "", hazard: "", risk: "" };
    const m = metalByName(row.metal);
    const { limit, source } = limitFor(m, row.pick, row.acgih);
    const hc = hazardFromCodes(m.codes, row.adopted);
    const lh = isNum(limit) ? hazardFromLimit(limit) : 0;
    return {
      limit,
      source,
      osha: m.osha === "" ? "—" : m.osha, // F13
      hazard: lh > 0 ? lh : hc > 0 ? hc : "Band needed", // G13
    };
  });

  // Gate 2 — regulated metal (B22)
  const h = i.rows
    .filter((row) => row.metal !== "" && metalByName(row.metal).gate2 !== "")
    .map((row) => row.metal + " (" + metalByName(row.metal).gate2 + ")")
    .join("; ");
  const base = TABLES.baseMetal.find((b) => b[0] === i.baseMetal);
  const s = base && base[2] !== "" ? i.baseMetal + " base metal (" + base[2] + ")" : "";
  const t = [s, h].filter((x) => x !== "").join("; ");
  r.gate2 = t === "" ? "No — Tier 1 (scored)" : "Tier 3 — measure: " + t;

  const listed = i.rows.map((row) => row.metal);

  // Gate 3 — surface (B23)
  r.gate3 = surface === "" ? "Pick the surface in 01"
    : TABLES.surface.find((x) => x[0] === surface)[1] +
      (surface === "Galvanised" && !listed.includes("Zinc oxide (fume)") ? " — not yet listed in Gate 1" : "");

  // Base metal — metals to list (B24)
  if (i.baseMetal === "") {
    r.baseList = "Pick the base metal in 01";
  } else {
    const [, sug, , note] = base;
    const sds = "Add the consumable's fume constituents from its SDS.";
    if (sug === "") {
      r.baseList = note + ". " + sds;
    } else {
      const miss = sug.split(";").map((x) => x.trim()).filter((x) => !listed.includes(x)).join("; ");
      r.baseList = (miss === "" ? "All base-metal metals listed. " : "Add to Gate 1: " + miss + ". ") + sds + (note === "" ? "" : " " + note + ".");
    }
  }

  // 03 Factors
  r.pfInput = i.process === "" ? "Pick the process in 01" : i.process; // B28
  if (i.process === "") {
    r.pf = ""; // C28
  } else {
    const pfbase = TABLES.process.find((p) => p[0] === i.process)[1];
    const pfadj = i.process === "Resistance or spot welding" && surface !== "" && surface !== "Clean / mill scale" ? 2 : pfbase;
    r.pf = Math.min(5, pfadj + (i.topCurrent === "Yes" ? 1 : 0));
  }
  r.pfCheck = i.topCurrent === "Yes" && i.pfBasis !== "Estimated" ? "Step-up applied: label Estimated" : ""; // E28
  r.ep = 5; // C30
  r.fp = lead(i.field); // C31
  r.rm = lead(i.room); // C32
  r.roomCheck = i.room.charAt(0) === "5" ? "If inside a tank or vessel: refer to the confined-space program" : ""; // E32

  // Environment (B33, C33)
  if (r.fp === "" || r.rm === "") {
    r.envText = "";
    r.en = "";
  } else {
    const mean = (r.fp + r.rm) / 2;
    r.envText = "Mean " + mean.toFixed(2) + (r.fp === 5 && mean < 4 ? "; Direct Plume Floor applied" : "");
    r.en = r.fp === 5 ? Math.max(4, mean) : mean;
  }
  r.d = lead(i.duration); // C34

  // Exposure Score (C35)
  r.es = [r.pf, r.ep, r.en, r.d].every(isNum) ? Math.pow(r.pf * r.ep * r.en * r.d, 1 / 4) : "";

  // 04 Controls — credited control level (B42)
  if (i.controlLevel === "") {
    r.level = "";
  } else {
    const pickd = lead(i.controlLevel);
    const l = pickd === 2 ? 1 : pickd;
    const tp = i.controlType;
    if (tp === "Fan blowing fume away") r.level = 1;
    else if (tp === "Overhead canopy hood") r.level = Math.min(l, 4);
    else if ((tp === "Extraction arm or fume gun" || tp === "Downdraft or backdraft table") && i.positioned !== "Yes") r.level = Math.min(l, 4);
    else r.level = l;
  }

  // Reduction (D42)
  r.reduction = r.level === "" ? "" : TABLES.controls.find((c) => c[0] === r.level)[2];

  // Effective reduction with the administrative credit, capped at the next engineering level
  // (the shared piece of E42 and B43). VLOOKUP past level 8 is an error, so the cap is 1.
  const adminYes = i.admin.slice(0, 3) === "Yes";
  let eff = "", uncapped = "";
  if (r.reduction !== "") {
    uncapped = 1 - (1 - r.reduction) * (1 - ADMIN_CREDIT);
    const next = TABLES.controls.find((c) => c[0] === Math.max(3, r.level + 1));
    eff = Math.min(uncapped, next ? next[2] : 1);
  }

  // Note (E42)
  if (i.controlLevel === "") {
    r.controlNote = "";
  } else {
    let note = "";
    if (adminYes && r.reduction !== "") {
      note = "Effective reduction with the administrative credit: " + Number(clean(eff * 100).toFixed(2)) + "%" +
        (clean(eff) < clean(uncapped) ? " (capped at the next engineering level)" : "") + ". ";
    }
    const l = lead(i.controlLevel);
    if (i.controlType === "Fan blowing fume away") note += FAN_TEXT;
    else if (r.level < l) note += "Capped at level 4: " + (i.controlType === "Overhead canopy hood"
      ? "a canopy draws the plume through the breathing zone; credit as general ventilation"
      : "capture is credited only when positioned as required");
    r.controlNote = note.replace(/ +/g, " ").trim();
  }

  // Residual (B43)
  r.residual = r.es === "" || r.reduction === "" ? "" : r.es * (1 - (adminYes ? eff : r.reduction));

  // 05 Result — Tier (B46)
  r.tier = surface === CHLORINATED ? "STOPPED — see Gate 3"
    : i.sampling === "Yes" || r.gate2.slice(0, 6) === "Tier 3"
      ? "Tier 3 — measure. The score below is for priority only; it never replaces a regulatory exposure determination."
      : "Tier 1 — scored";

  r.band = r.residual === "" ? "" : band(r.residual); // F47

  // Risk per constituent: whole fume (H12) and rows (H13 to H20)
  r.fumeRisk = r.band === "" ? "" : TABLES.risk[5 - 1][r.band - 1];
  r.rows.forEach((row, k) => {
    if (i.rows[k].metal === "" || r.band === "") row.risk = "";
    else row.risk = isNum(row.hazard) ? TABLES.risk[row.hazard - 1][r.band - 1] : "Hazard unresolved";
  });

  // Risk (F48): the highest rank among the constituent risks
  const risks = [r.fumeRisk, ...r.rows.map((row) => row.risk)];
  const rank = Math.max(0, ...risks.map((x) => TABLES.riskRank.indexOf(x) + 1));
  r.risk = risks.every((x) => x === "") || rank === 0 ? "" : TABLES.riskRank[rank - 1];

  // Governing constituent (B48)
  if (r.risk === "") {
    r.governing = "";
  } else {
    const names = [{ name: "Welding fume (whole)", hazard: 5, risk: r.fumeRisk }]
      .concat(r.rows.map((row, k) => ({ name: i.rows[k].metal, hazard: row.hazard, risk: row.risk })));
    r.governing = names.filter((x) => x.risk === r.risk).map((x) => x.name + " (hazard " + x.hazard + ")").join(", ");
  }

  // Decision (F49)
  r.decision = surface === CHLORINATED ? "Stopped — see Status"
    : r.risk === "" || i.confidence === "" ? ""
    : TABLES.decision[r.risk][4 - lead(i.confidence)];

  // Band-sensitivity (B50). As in the sheet, the re-band uses the engineering
  // reduction (D42) only and is compared with the band in F47.
  const bases = [i.pfBasis, i.fieldBasis, i.roomBasis, i.durationBasis];
  if (r.band === "") {
    r.sensitive = "";
  } else if (!bases.includes("Estimated")) {
    r.sensitive = "No — nothing Estimated";
  } else {
    const red = r.reduction;
    const bnd = (pf, fp, rm, d) => band(Math.pow(pf * 5 * (fp === 5 ? Math.max(4, (fp + rm) / 2) : (fp + rm) / 2) * d, 1 / 4) * (1 - red));
    const { pf, fp, rm, d } = r;
    const up = (x) => Math.min(5, x + 1);
    const moves =
      (i.pfBasis === "Estimated" && bnd(up(pf), fp, rm, d) !== r.band) ||
      (i.fieldBasis === "Estimated" && bnd(pf, up(fp), rm, d) !== r.band) ||
      (i.roomBasis === "Estimated" && bnd(pf, fp, up(rm), d) !== r.band) ||
      (i.durationBasis === "Estimated" && bnd(pf, fp, rm, up(d)) !== r.band);
    r.sensitive = moves
      ? "Yes — get better information, take the more conservative score, or document why the score was kept"
      : "No — one level higher on each Estimated factor gives the same band";
  }

  // Status (B51)
  const bandNeeded = i.rows.filter((row, k) => r.rows[k].hazard === "Band needed").map((row) => row.metal);
  if (surface === CHLORINATED) {
    r.status = "STOP — chlorinated solvent residue. The part must be dry and clean, and degreasing moved away, before assessing.";
  } else if (bases.includes("Unresolved")) {
    r.status = "Not Determinable — Insufficient Information";
  } else if (bandNeeded.length > 0) {
    r.status = "Incomplete Pending Additional Information — complete a NIOSH band for: " + bandNeeded.join(", ");
  } else if (r.gate3.includes("not yet listed in Gate 1") || r.baseList.slice(0, 14) === "Add to Gate 1:") {
    r.status = "Incomplete Pending Additional Information — Gate 1 fume inventory not complete (see Gate 3 and Base metal above)";
  } else {
    r.status = r.band === "" ? "Fill in 01 to 04" : "Complete";
  }

  return r;
}

if (typeof module !== "undefined") module.exports = { calculate };
