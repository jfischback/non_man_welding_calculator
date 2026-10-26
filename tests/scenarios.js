// Test scenarios run through both the Google Sheet (a test copy) and calc.js.
// Picks use the first character of the pick-list text: field "5" = "5 – Head over ...".
// "acgih" and "adopted" were entered on the sheet's Metals tab (columns E and P).
module.exports = [
  {
    name: "S1 Worked example (Procedure section 13)",
    process: "GMAW, spray or pulsed transfer", baseMetal: "Carbon steel", surface: "Clean / mill scale", sampling: "No",
    rows: [
      { metal: "Manganese (fume)", from: "Consumable", pick: "Lowest available" },
      { metal: "Iron oxide (fume)", from: "Consumable", pick: "Lowest available" },
    ],
    topCurrent: "No", pfBasis: "Documented", field: "5", fieldBasis: "Observed", room: "2", roomBasis: "Observed",
    duration: "5", durationBasis: "Observed", controlLevel: "5", controlType: "Extraction arm or fume gun",
    positioned: "Yes", admin: "No", confidence: "4",
  },
  {
    name: "S2 FCAW on galvanised stainless, canopy hood, admin credit, Estimated factors",
    process: "Flux-cored arc (FCAW)", baseMetal: "Stainless steel", surface: "Galvanised", sampling: "No",
    rows: [
      { metal: "Manganese (fume)", from: "Consumable", pick: "ACGIH", acgih: 0.02 },
      { metal: "Iron oxide (fume)", from: "Base metal", pick: "Default order" },
      { metal: "Chromium (metal)", from: "Base metal", pick: "NIOSH" },
      { metal: "Nickel (metal, insoluble)", from: "Base metal", pick: "OSHA" },
    ],
    topCurrent: "Yes", pfBasis: "Estimated", field: "4", fieldBasis: "Estimated", room: "3", roomBasis: "Observed",
    duration: "3", durationBasis: "Estimated", controlLevel: "6", controlType: "Overhead canopy hood",
    positioned: "Not applicable", admin: "Yes", confidence: "3",
  },
  {
    name: "S3 Spot welding oiled aluminium, sampling data, admin-only level",
    process: "Resistance or spot welding", baseMetal: "Aluminium or aluminium alloy", surface: "Oil or cutting fluid", sampling: "Yes",
    rows: [
      { metal: "Aluminium (metal)", from: "Base metal", pick: "Cal/OSHA" },
      { metal: "Magnesium oxide (fume)", from: "Consumable", pick: "AIHA" },
      { metal: "Vanadium pentoxide", from: "Coating", pick: "", adopted: "H350" },
    ],
    topCurrent: "No", pfBasis: "Documented", field: "1", fieldBasis: "Documented", room: "1", roomBasis: "Measured",
    duration: "1", durationBasis: "Observed", controlLevel: "2", controlType: "General ventilation",
    positioned: "Not applicable", admin: "No", confidence: "2",
  },
  {
    name: "S4 Gouging with chlorinated residue, fan, unresolved factor",
    process: "Air carbon arc gouging", baseMetal: "Other (record in notes)", surface: "Chlorinated solvent residue", sampling: "No",
    rows: [
      { metal: "Copper (fume)", from: "Base metal", pick: "Default order" },
      { metal: "Cobalt (metal, fume)", from: "Consumable", pick: "Lowest available" },
    ],
    topCurrent: "No", pfBasis: "Observed", field: "5", fieldBasis: "Unresolved", room: "5", roomBasis: "Observed",
    duration: "2", durationBasis: "Observed", controlLevel: "7", controlType: "Fan blowing fume away",
    positioned: "No", admin: "Yes", confidence: "1",
  },
  {
    name: "S5 SMAW on painted brass with lead, booth level 8, admin credit",
    process: "Shielded metal arc (SMAW / stick)", baseMetal: "Brass", surface: "Painted or primed — composition known", sampling: "No",
    rows: [
      { metal: "Copper (fume)", from: "Consumable", pick: "Lowest available" },
      { metal: "Lead (inorganic)", from: "Coating", pick: "OSHA" },
    ],
    topCurrent: "No", pfBasis: "Estimated", field: "2", fieldBasis: "Observed", room: "4", roomBasis: "Estimated",
    duration: "4", durationBasis: "Observed", controlLevel: "8", controlType: "Booth or enclosure",
    positioned: "Yes", admin: "Yes", confidence: "4",
  },
  {
    name: "S6 TIG on nickel alloy, arm not positioned",
    process: "Gas tungsten arc (GTAW / TIG)", baseMetal: "Nickel-containing alloy", surface: "Clean / mill scale", sampling: "No",
    rows: [
      { metal: "Nickel (metal, insoluble)", from: "Base metal", pick: "" },
    ],
    topCurrent: "No", pfBasis: "Documented", field: "3", fieldBasis: "Observed", room: "2", roomBasis: "Observed",
    duration: "5", durationBasis: "Estimated", controlLevel: "5", controlType: "Extraction arm or fume gun",
    positioned: "No", admin: "No", confidence: "4",
  },
];
