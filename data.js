// Data copied from the OEMS Welding and Hot Work Calculator v1.0 DRAFT Google Sheet.
// Metals tab rows 3 to 23 and Tables tab T1 to T17. Source: OEMS Non-Manufacturing
// Welding and Hot Work Methodology v1.6 and Procedure v1.6 (17 Oct 2026).
// Change a value here only when the sheet (and the Methodology) changes.
// Blank cells are "".

// Metals tab. Limits in mg/m³. The ACGIH TLV (column E) and the adopted
// other-source codes (column P) are entered per constituent on the page.
const METALS = [
  // id, name (B), cas (C), library name (D), niosh (F), weel (G), osha (H), cal (I), codes (M), other codes (O), gate 2 standard (R)
  { id: "OEMS-CHEM-000537", name: "Iron oxide (fume)", cas: "1309-37-1", lib: "IRON OXIDE FUME", niosh: 5, weel: "", osha: 10, cal: 5, codes: "H370, H372", other: "H315, H319, H335, H370, H372", gate2: "" },
  { id: "OEMS-CHEM-000584", name: "Manganese (fume)", cas: "7439-96-5", lib: "MANGANESE, COMPOUNDS & FUME (as Mn)", niosh: 1, weel: "", osha: "", cal: 0.2, codes: "", other: "H319, H360, H370, H372", gate2: "" },
  { id: "OEMS-CHEM-000270", name: "Chromium (metal)", cas: "7440-47-3", lib: "CHROMIUM, METAL & INSOLUBLE SALTS (as Cr)", niosh: 0.5, weel: "", osha: 1, cal: 0.5, codes: "H317, H319, H334, H335", other: "H317, H319, H334, H335, H341, H371", gate2: "29 CFR 1910.1026 (Cr(VI) formed by the process)" },
  { id: "OEMS-CHEM-000269", name: "Hexavalent chromium", cas: "18540-29-9", lib: "CHROMIUM VI COMPOUNDS (HEXAVALENT CHROMIUM)", niosh: 0.0002, weel: "", osha: 0.005, cal: 0.005, codes: "", other: "H350, H350i", gate2: "29 CFR 1910.1026" },
  { id: "OEMS-CHEM-000683", name: "Nickel (metal, insoluble)", cas: "7440-02-0", lib: "NICKEL, METAL & INSOLUBLE COMPOUNDS (as Ni)", niosh: 0.015, weel: "", osha: 1, cal: 0.5, codes: "", other: "H334, H341, H350, H360, H370, H372", gate2: "" },
  { id: "OEMS-CHEM-000981", name: "Zinc oxide (fume)", cas: "1314-13-2", lib: "ZINC OXIDE, DUST & FUME", niosh: 5, weel: "", osha: 5, cal: 5, codes: "H400, H410", other: "H333, H361, H370, H372, H400, H410", gate2: "" },
  { id: "OEMS-CHEM-000287", name: "Copper (fume)", cas: "7440-50-8", lib: "COPPER, FUME (as Cu)", niosh: 0.1, weel: "", osha: 0.1, cal: 0.1, codes: "H317, H335, H370", other: "H317, H335, H370, H372", gate2: "" },
  { id: "OEMS-CHEM-000138", name: "Aluminium (metal)", cas: "7429-90-5", lib: "ALUMINUM, METAL (as Al)", niosh: 10, weel: "", osha: 15, cal: 10, codes: "H261, H370, H372", other: "H261, H370, H372", gate2: "" },
  { id: "OEMS-CHEM-000643", name: "Molybdenum (insoluble)", cas: "7439-98-7", lib: "MOLYBDENUM, DUST & INSOLUBLE COMPOUNDS (as Mo)", niosh: "", weel: "", osha: 15, cal: 10, codes: "", other: "H319, H335, H361", gate2: "" },
  { id: "OEMS-CHEM-000959", name: "Vanadium pentoxide", cas: "1314-62-1", lib: "VANADIUM, RESPIRABLE DUST & FUME (as V₂O₅)", niosh: "", weel: "", osha: "", cal: 0.05, codes: "H301, H330, H335, H341, H350, H361, H362, H372, H411", other: "H301, H319, H330, H335, H340, H341, H350, H361, H362, H370, H372, H411", gate2: "" },
  { id: "OEMS-CHEM-000280", name: "Cobalt (metal, fume)", cas: "7440-48-4", lib: "COBALT METAL, DUST & FUME (as Co)", niosh: 0.05, weel: "", osha: 0.1, cal: 0.02, codes: "H317, H334, H341, H350, H360, H413", other: "H317, H319, H330, H334, H335, H341, H350, H350i, H360, H370, H372, H413", gate2: "" },
  { id: "OEMS-CHEM-000563", name: "Lead (inorganic)", cas: "7439-92-1", lib: "LEAD, INORGANIC (as Pb)", niosh: 0.05, weel: "", osha: 0.05, cal: 0.01, codes: "H351, H360, H362, H370, H372", other: "H332, H341, H351, H360, H362, H370, H372", gate2: "29 CFR 1910.1025" },
  { id: "OEMS-CHEM-000218", name: "Cadmium (fume)", cas: "1306-19-0", lib: "CADMIUM FUME (as Cd)", niosh: "", weel: "", osha: 0.005, cal: 0.005, codes: "H318, H400, H410", other: "H315, H318, H319, H330, H341, H350, H361, H370, H372, H400, H410", gate2: "29 CFR 1910.1027" },
  { id: "OEMS-CHEM-000185", name: "Beryllium", cas: "7440-41-7", lib: "BERYLLIUM & COMPOUNDS (as Be)", niosh: "", weel: "", osha: 0.0002, cal: 0.0002, codes: "", other: "H319, H330, H334, H335, H350, H350i, H370, H372", gate2: "29 CFR 1910.1024" },
  { id: "OEMS-CHEM-000156", name: "Arsenic (inorganic)", cas: "7440-38-2", lib: "ARSENIC, INORGANIC COMPOUNDS (as As)", niosh: "", weel: "", osha: 0.01, cal: 0.01, codes: "", other: "H319, H331, H341, H350, H360, H370, H372", gate2: "29 CFR 1910.1018" },
  { id: "OEMS-CHEM-000915", name: "Titanium dioxide", cas: "13463-67-7", lib: "TITANIUM DIOXIDE", niosh: "", weel: "", osha: 15, cal: 10, codes: "H320, H335, H372", other: "H319, H320, H335, H351, H372", gate2: "" },
  { id: "OEMS-CHEM-000578", name: "Magnesium oxide (fume)", cas: "1309-48-4", lib: "MAGNESIUM OXIDE (FUME)", niosh: "", weel: "", osha: 15, cal: 10, codes: "H319, H335", other: "H319, H335", gate2: "" },
  { id: "OEMS-CHEM-000464", name: "Fluorides (as F)", cas: "16984-48-8", lib: "FLUORIDES (as F)", niosh: 2.5, weel: "", osha: 2.5, cal: 2.5, codes: "", other: "", gate2: "" },
  { id: "OEMS-CHEM-000837", name: "Silver (metal)", cas: "7440-22-4", lib: "SILVER, METAL & SOLUBLE COMPOUNDS (as Ag)", niosh: 0.01, weel: "", osha: 0.01, cal: 0.01, codes: "", other: "H320, H360, H370, H372", gate2: "" },
  { id: "OEMS-CHEM-000913", name: "Tin (inorganic)", cas: "7440-31-5", lib: "TIN, INORGANIC COMPOUNDS (EXCEPT OXIDES) (as Sn)", niosh: 2, weel: "", osha: 2, cal: 2, codes: "", other: "H319, H335, H372", gate2: "" },
  { id: "OEMS-CHEM-000169", name: "Barium (soluble)", cas: "7440-39-3", lib: "BARIUM, SOLUBLE COMPOUNDS (EXCEPT BARIUM SULFATE)", niosh: 0.5, weel: "", osha: 0.5, cal: 0.5, codes: "", other: "H319, H335, H370, H372", gate2: "" },
];

const TABLES = {
  // T1. Process Fume generation (PF) — pick the highest-fume process used in the scenario
  process: [
    ["Submerged arc (SAW)", 1],
    ["Resistance or spot welding", 1],
    ["Gas tungsten arc (GTAW / TIG)", 2],
    ["Laser welding", 2],
    ["GMAW / MIG, short-circuit transfer", 3],
    ["Torch brazing", 3],
    ["Laser cutting of metal", 3],
    ["Shielded metal arc (SMAW / stick)", 4],
    ["GMAW, spray or pulsed transfer", 4],
    ["Oxy-fuel cutting", 4],
    ["Plasma cutting", 4],
    ["Flux-cored arc (FCAW)", 5],
    ["Air carbon arc gouging", 5],
    ["Thermal spraying of metal", 5],
  ],

  // T2. Field Position
  field: [
    "1 – Automated or robotic cell; worker outside the cell during the arc",
    "2 – Operator of a mechanised process, standing back, beyond arm's reach of the arc",
    "3 – Fitter or helper within arm's reach, not over the arc",
    "4 – Welder at the work, normal flat or horizontal position",
    "5 – Head over or in the plume: vertical-up, overhead, inside a vessel or tank, or leaning in to see the puddle",
  ],

  // T3. Room / General Ventilation (unknown ventilation = without)
  room: [
    "1 – Outdoors, or 2,000 sq ft or more with working ventilation, not downwind or in a trapped pocket",
    "2 – 2,000 sq ft or more without working ventilation, or 200 to 2,000 sq ft with",
    "3 – 200 to 2,000 sq ft without working ventilation, or under 200 sq ft with",
    "4 – Under 200 sq ft, no working ventilation, not sealed",
    "5 – Under 200 sq ft, enclosed, minimal or no air exchange (also: inside a tank or vessel — refer to confined space)",
  ],

  // T4. Duration — time in the fume zone per day, not arc-on time
  duration: [
    "1 – Under 15 minutes",
    "2 – 15 to under 30 minutes",
    "3 – 30 minutes to under 1 hour",
    "4 – 1 to under 2 hours",
    "5 – 2 hours or more",
  ],

  // T5. Control levels: [level, pick text, reduction]
  controls: [
    [1, "1 – None", 0],
    [2, "2 – Administrative only (scored as None — use the administrative credit instead)", 0.15],
    [3, "3 – General ventilation, 3 to 6 air changes per hour (6 included)", 0.3],
    [4, "4 – Good general ventilation, over 6 to 12 air changes per hour", 0.4],
    [5, "5 – Good general ventilation with capture at emission points", 0.55],
    [6, "6 – Capture at points of emission with containment wherever practical", 0.65],
    [7, "7 – Containment", 0.75],
    [8, "8 – Primary and secondary containment", 0.85],
  ],

  // T6. Bands on the unrounded residual: residual from (band = position, 1 to 5)
  bands: [0, 1, 2, 3, 4],

  // T7. Risk matrix (rows = hazard 1 to 5; columns = band 1 to 5)
  risk: [
    ["Very Low", "Very Low", "Low", "Low", "Low"],
    ["Very Low", "Low", "Low", "Medium", "Medium"],
    ["Low", "Medium", "Medium", "High", "High"],
    ["Medium", "Medium", "High", "High", "Very High"],
    ["Medium", "High", "High", "Very High", "Very High"],
  ],

  // T8. Risk rank (highest constituent governs)
  riskRank: ["Very Low", "Low", "Medium", "High", "Very High"],

  // T9. Confidence (picked by the reviewer; never changes the score)
  confidence: [
    "4 – Well characterised — identity and properties reliably established",
    "3 – Partially characterised — primary agent understood, some constituents uncertain",
    "2 – Poorly characterised — agent suspected, composition not reliably established",
    "1 – Uncharacterised — agent cannot reasonably be identified",
  ],

  // T10. Decision (risk row, confidence column 4, 3, 2, 1)
  decision: {
    "Very Low": ["Acceptable", "Acceptable", "Acceptable — document basis", "Acceptable — document basis"],
    "Low": ["Acceptable", "Acceptable", "Verify controls", "Verify controls"],
    "Medium": ["Evaluate controls", "Evaluate controls", "Uncertain — characterise or control", "Uncertain — characterise or control"],
    "High": ["Control", "Control", "Control", "Control"],
    "Very High": ["Control", "Control", "Control", "Control"],
  },

  // T12. H-code to hazard
  hcodes: {
    H315: 1, H319: 1, H335: 2, H302: 2, H312: 2, H301: 3, H311: 3, H331: 3, H332: 3,
    H361: 3, H371: 3, H373: 3, H341: 4, H351: 4, H317: 4, H300: 5, H310: 5, H330: 5,
    H314: 5, H318: 5, H334: 5, H340: 5, H350: 5, H350I: 5, H360: 5, H370: 5, H372: 5,
  },

  // T14. Gate 3 — surface and what to do
  surface: [
    ["Clean / mill scale", "None"],
    ["Galvanised", "Add zinc oxide to the inventory"],
    ["Painted or primed — composition known", "Add the coating's metals to the inventory; check Gate 2 for lead and chromate"],
    ["Painted or primed — composition unknown", "Run the Smoke and Thermal Emission assessment in parallel"],
    ["Chlorinated solvent residue", "STOP — phosgene risk. Part must be dry and clean, and degreasing moved away, before assessing"],
    ["Oil or cutting fluid", "Record it; run the Smoke and Thermal Emission assessment in parallel"],
  ],

  // T15. Gases — screen, then route to direct-reading measurement
  gases: [
    ["Ozone", "GTAW or GMAW, especially on aluminium or stainless, argon-rich shielding; intense ultraviolet"],
    ["Nitrogen dioxide", "Oxy-fuel cutting and welding; plasma cutting"],
    ["Carbon monoxide", "GMAW with CO₂ or CO₂-rich shielding; oxy-fuel; poorly ventilated spaces"],
    ["Phosgene", "Any chlorinated solvent residue on the part or in the area — Gate 3 stop rule"],
    ["Hydrogen fluoride / fluorides", "Low-hydrogen SMAW electrodes; fluoride-bearing FCAW fluxes"],
    ["Oxygen deficiency", "Inert shielding gas in an enclosed or low-lying space"],
  ],

  // T16. Pick lists
  from: ["Consumable", "Base metal", "Coating"],
  basis: ["Measured", "Observed", "Documented", "Estimated", "Unresolved"],
  yesNo: ["Yes", "No"],
  controlType: ["None", "General ventilation", "Extraction arm or fume gun", "Downdraft or backdraft table", "Overhead canopy hood", "Booth or enclosure", "Fan blowing fume away"],
  positioned: ["Yes", "No", "Not applicable"],
  limitPick: ["Lowest available", "Default order", "OSHA", "Cal/OSHA", "NIOSH", "AIHA", "ACGIH"],
  admin: ["No", "Yes — written task procedure, workers trained, seen followed"],

  // T17. Base metal: [name, suggested metals (;), Gate 2 triggered by the base metal itself, note]
  baseMetal: [
    ["Carbon steel", "Iron oxide (fume); Manganese (fume)", "", ""],
    ["Stainless steel", "Iron oxide (fume); Manganese (fume); Chromium (metal); Nickel (metal, insoluble); Hexavalent chromium", "29 CFR 1910.1026 (Cr(VI) formed by the process)", "Cr(VI) is listed for stainless on its own (Gate 2 rule)"],
    ["Chromium-containing alloy", "Chromium (metal); Hexavalent chromium", "29 CFR 1910.1026 (Cr(VI) formed by the process)", "Cr(VI) is listed for any chromium-bearing base metal (Gate 2 rule)"],
    ["Nickel-containing alloy", "Nickel (metal, insoluble)", "", ""],
    ["Aluminium or aluminium alloy", "Aluminium (metal)", "", "Add other alloy constituents from the material specification"],
    ["Copper or copper alloy", "Copper (fume)", "", "Add other alloy constituents from the material specification"],
    ["Brass", "Copper (fume); Zinc oxide (fume)", "", "Add lead if the brass contains lead"],
    ["Lead-containing material", "Lead (inorganic)", "29 CFR 1910.1025", ""],
    ["Cadmium-containing material", "Cadmium (fume)", "29 CFR 1910.1027", ""],
    ["Beryllium-containing alloy", "Beryllium", "29 CFR 1910.1024", ""],
    ["Cobalt-containing alloy", "Cobalt (metal, fume)", "", ""],
    ["Other (record in notes)", "", "", "Build the list from the material specification"],
  ],
};

if (typeof module !== "undefined") module.exports = { METALS, TABLES };
