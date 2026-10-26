# OEMS Welding and Hot Work Calculator

A web version of the "Welding" tab of the OEMS Welding and Hot Work Calculator v1.0 DRAFT Google Sheet. It follows the OEMS Non-Manufacturing Welding and Hot Work Exposure Assessment Methodology v1.6 and Procedure v1.6. Yellow fields are entered or picked; green fields are calculated, as in the sheet.

Plain HTML, CSS, and JavaScript with no build step. Open `index.html`, or deploy as a static site (on Vercel, leave the framework preset as "Other").

- `index.html`: the page
- `data.js`: the Metals library and the Tables, copied from the sheet
- `calc.js`: the calculation logic, with the sheet cell each piece comes from
- `app.js`: connects the form to the calculation
- `style.css`: the styles
- `tests/check.js`: runs the scenarios in `tests/scenarios.js` and compares them with values read from the sheet (`tests/sheet-results.json`). Run `node tests/check.js`; add `--markdown` to write `tests/results.md`.

The ACGIH TLV and adopted other-source codes, which are entered on the sheet's Metals tab, are entered on each Gate 1 row here.

This tool supports the evaluator's professional judgment and does not replace it.
