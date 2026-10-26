const form = document.getElementById("form");
const $ = (id) => document.getElementById(id);
const ROWS = 8; // Welding rows 13 to 20

// Pick lists for the selects, from the Tables data.
const LISTS = {
  process: TABLES.process.map((p) => p[0]),
  baseMetal: TABLES.baseMetal.map((b) => b[0]),
  surface: TABLES.surface.map((s) => s[0]),
  field: TABLES.field,
  room: TABLES.room,
  duration: TABLES.duration,
  controls: TABLES.controls.map((c) => c[1]),
  confidence: TABLES.confidence,
  metal: METALS.map((m) => m.name),
  from: TABLES.from,
  limitPick: TABLES.limitPick,
  basis: TABLES.basis,
  yesNo: TABLES.yesNo,
  controlType: TABLES.controlType,
  positioned: TABLES.positioned,
  admin: TABLES.admin,
};

function fill(select) {
  const blank = select.hasAttribute("data-noblank") ? [] : [""];
  for (const v of blank.concat(LISTS[select.dataset.list])) {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = v;
    select.append(o);
  }
}

// Gate 1 rows: yellow inputs on top, green results underneath.
function buildRows() {
  const html = [];
  for (let k = 0; k < ROWS; k++) {
    html.push(`
      <div class="row" id="row-${k}">
        <div class="ins">
          <div class="wide"><label class="lbl" for="metal-${k}">Constituent</label><select class="entry" id="metal-${k}" data-list="metal"></select></div>
          <div><label class="lbl" for="from-${k}">From</label><select class="entry" id="from-${k}" data-list="from"></select></div>
          <div><label class="lbl" for="pick-${k}">Limit to follow <span class="opt">blank = Lowest available</span></label><select class="entry" id="pick-${k}" data-list="limitPick"></select></div>
          <div><label class="lbl" for="acgih-${k}">ACGIH TLV (mg/m³) <span class="opt">optional</span></label><input class="entry" id="acgih-${k}" type="number" inputmode="decimal" min="0" step="any"></div>
          <div><label class="lbl" for="adopted-${k}">Adopted other-source codes <span class="opt">enter with reason</span></label><input class="entry" id="adopted-${k}" type="text" placeholder="e.g. H350"></div>
        </div>
        <p class="codes" id="codes-${k}"></p>
        <div class="outs">
          <div><span class="lbl">Limit used (mg/m³)</span><span class="calc" id="limit-${k}"></span></div>
          <div class="wide"><span class="lbl">Limit source used</span><span class="calc" id="source-${k}"></span></div>
          <div><span class="lbl">OSHA PEL (mg/m³)</span><span class="calc" id="osha-${k}"></span></div>
          <div><span class="lbl">Hazard</span><span class="calc" id="hazard-${k}"></span></div>
          <div><span class="lbl">Risk</span><span class="calc" id="risk-${k}"></span></div>
        </div>
      </div>`);
  }
  $("rows").innerHTML = html.join("");

  $("gasRows").innerHTML = TABLES.gases.map(([gas, when], k) => `
    <div class="gas">
      <p class="fname">${gas}</p>
      <p class="hint">Anticipate when: ${when}</p>
      <div class="gas-ins">
        <div><label class="lbl" for="gasAnt-${k}">Anticipated?</label><select class="entry" id="gasAnt-${k}" data-list="yesNo"></select></div>
        <div><label class="lbl" for="gasRoute-${k}">Routed to / reason screened out</label><input class="entry" id="gasRoute-${k}" type="text"></div>
      </div>
    </div>`).join("");
}

const val = (id) => $(id).value;

// ACGIH TLV: blank or not a number >= 0 is treated as blank.
function num(id) {
  const raw = val(id).trim();
  if (raw === "") return "";
  const v = Number(raw);
  return Number.isFinite(v) && v >= 0 ? v : "";
}

function readInputs() {
  const rows = [];
  for (let k = 0; k < ROWS; k++) {
    rows.push({ metal: val(`metal-${k}`), from: val(`from-${k}`), pick: val(`pick-${k}`), acgih: num(`acgih-${k}`), adopted: val(`adopted-${k}`) });
  }
  return {
    process: val("process"),
    baseMetal: val("baseMetal"),
    surface: val("surface"),
    sampling: val("sampling"),
    rows,
    topCurrent: val("topCurrent"),
    pfBasis: val("pfBasis"),
    field: val("field"),
    fieldBasis: val("fieldBasis"),
    room: val("room"),
    roomBasis: val("roomBasis"),
    duration: val("duration"),
    durationBasis: val("durationBasis"),
    controlLevel: val("controlLevel"),
    controlType: val("controlType"),
    positioned: val("positioned"),
    admin: val("admin"),
    confidence: val("confidence"),
  };
}

// Number formats used in the sheet.
const fixed = (v, dp) => (typeof v === "number" ? v.toFixed(dp) : v);
const pct = (v) => (typeof v === "number" ? Math.round(v * 100) + "%" : v);
const text = (v) => (v === "" || v === undefined ? "" : String(v));

function set(id, value) {
  $(id).textContent = text(value);
}

function update() {
  const i = readInputs();
  const r = calculate(i);

  // Show the filled Gate 1 rows plus the next empty one.
  let last = -1;
  i.rows.forEach((row, k) => { if (row.metal !== "") last = k; });
  for (let k = 0; k < ROWS; k++) {
    $(`row-${k}`).hidden = k > last + 1;
    const row = r.rows[k];
    set(`limit-${k}`, row.limit);
    set(`source-${k}`, row.source);
    set(`osha-${k}`, row.osha);
    set(`hazard-${k}`, row.hazard);
    set(`risk-${k}`, row.risk);
    const m = METALS.find((x) => x.name === i.rows[k].metal);
    $(`codes-${k}`).textContent = m
      ? `H-codes (primary source): ${m.codes || "none"} · Other sources (shown, not used): ${m.other || "none"}`
      : "";
  }

  set("fumeRisk", r.fumeRisk);
  set("gate2", r.gate2);
  set("gate3", r.gate3);
  set("baseList", r.baseList);

  set("pfInput", r.pfInput);
  set("pf", r.pf);
  set("pfCheck", r.pfCheck);
  set("fp", r.fp);
  set("rm", r.rm);
  set("roomCheck", r.roomCheck);
  set("envText", r.envText);
  set("en", fixed(r.en, 2));
  set("d", r.d);
  set("es", fixed(r.es, 4));

  set("level", r.level);
  set("reduction", pct(r.reduction));
  set("residual", fixed(r.residual, 2));
  set("controlNote", r.controlNote);

  set("tier", r.tier);
  set("es2", fixed(r.es, 4));
  set("residual2", fixed(r.residual, 2));
  set("band", r.band);
  set("governing", r.governing);
  set("sensitive", r.sensitive);
  set("status", r.status);
  $("risk").textContent = r.risk || "--";
  $("decision").textContent = r.decision || "--";

  const pill = $("statusPill");
  pill.textContent = r.status === "Complete" ? "Complete" : r.status === "" ? "" : r.status.split(" — ")[0];
  pill.className = "pill " + (r.status === "Complete" ? "ok" : r.status.startsWith("STOP") ? "stop" : "warn");

  document.querySelectorAll(".check").forEach((el) => (el.hidden = el.textContent === ""));
}

// The worked example the sheet opens with (Procedure section 13).
const EXAMPLE = {
  assessmentId: "WORKED EXAMPLE — Procedure section 13",
  process: "GMAW, spray or pulsed transfer",
  baseMetal: "Carbon steel",
  consumable: "Solid wire",
  shieldingGas: "90/10 argon / CO₂",
  surface: "Clean / mill scale",
  location: "Bench, flat position",
  sampling: "No",
  "metal-0": "Manganese (fume)", "from-0": "Consumable", "pick-0": "Lowest available",
  "metal-1": "Iron oxide (fume)", "from-1": "Consumable", "pick-1": "Lowest available",
  pfBasis: "Documented",
  topCurrent: "No",
  field: TABLES.field[4],
  fieldBasis: "Observed",
  room: TABLES.room[1],
  roomBasis: "Observed",
  duration: TABLES.duration[4],
  durationBasis: "Observed",
  controlLevel: TABLES.controls[4][1],
  controlType: "Extraction arm or fume gun",
  positioned: "Yes",
  ppe: "Auto-darkening helmet",
  admin: "No",
  confidence: TABLES.confidence[0],
};

function clearAll() {
  form.querySelectorAll("input, select").forEach((el) => { el.value = ""; });
  $("admin").value = "No";
}

function load(values) {
  clearAll();
  for (const [id, v] of Object.entries(values)) $(id).value = v;
  update();
}

buildRows();
document.querySelectorAll("select[data-list]").forEach(fill);
form.addEventListener("input", update);
form.addEventListener("change", update);
$("loadExample").addEventListener("click", () => load(EXAMPLE));
$("clearAll").addEventListener("click", () => { clearAll(); update(); });
load(EXAMPLE);
