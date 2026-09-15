// Türkiye tax depreciation & amortisation — briefing deck for China Finance HQ
const PptxGenJS = require("pptxgenjs");

const NAVY = "1B2A4A";
const NAVY_SOFT = "2E4470";
const PALE = "EEF2F8";
const CARD = "F7F9FC";
const CRIMSON = "C8102E";
const INK = "1A1A1A";
const MUTED = "6B7280";
const WHITE = "FFFFFF";
const GREEN = "1E7A46";

const HEAD = "Cambria";
const BODY = "Calibri";

const W = 13.3, H = 7.5;
const M = 0.7;

const pres = new PptxGenJS();
pres.layout = "LAYOUT_WIDE";
pres.author = "Finance";
pres.title = "Türkiye · Depreciation and Amortisation for Tax Purposes";

const shadow = () => ({ type: "outer", color: "9AA5B8", blur: 10, offset: 2, angle: 90, opacity: 0.25 });

function titleBar(slide, text, kicker) {
  if (kicker) {
    slide.addText(kicker.toUpperCase(), {
      x: M, y: 0.42, w: W - 2 * M, h: 0.26, isTextBox: true, margin: 0,
      fontFace: BODY, fontSize: 11, bold: true, color: CRIMSON, charSpacing: 2,
    });
  }
  slide.addText(text, {
    x: M, y: kicker ? 0.68 : 0.55, w: W - 2 * M, h: 0.72, isTextBox: true, margin: 0,
    fontFace: HEAD, fontSize: 32, bold: true, color: NAVY, valign: "top",
  });
}

function footnote(slide, text) {
  slide.addText(text, {
    x: M, y: H - 0.88, w: W - 2 * M, h: 0.38, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 9, italic: true, color: MUTED, valign: "bottom",
  });
}

function card(slide, x, y, w, h, fill) {
  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.08, fill: { color: fill || CARD },
    line: { color: "DDE4EE", width: 0.75 }, shadow: shadow(),
  });
}

function numDot(slide, x, y, n, color) {
  slide.addShape(pres.ShapeType.ellipse, {
    x, y, w: 0.42, h: 0.42, fill: { color: color || NAVY }, line: { color: color || NAVY },
  });
  slide.addText(String(n), {
    x, y, w: 0.42, h: 0.42, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 14, bold: true, color: WHITE, align: "center", valign: "middle",
  });
}

function stat(slide, x, y, w, value, label, color) {
  slide.addText(value, {
    x, y, w, h: 0.85, isTextBox: true, margin: 0,
    fontFace: HEAD, fontSize: 40, bold: true, color: color || NAVY, align: "left", valign: "middle",
  });
  slide.addText(label, {
    x, y: y + 0.82, w, h: 0.75, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 12, color: MUTED, align: "left", valign: "top",
  });
}

/* ============================================================ 1 TITLE */
let s = pres.addSlide();
s.background = { color: NAVY };
s.addText("TÜRKİYE · TAX BRIEFING", {
  x: M, y: 1.9, w: W - 2 * M, h: 0.3, isTextBox: true, margin: 0,
  fontFace: BODY, fontSize: 12, bold: true, color: "8FA8D4", charSpacing: 3,
});
s.addText("Depreciation and Amortisation", {
  x: M, y: 2.3, w: W - 2 * M, h: 0.9, isTextBox: true, margin: 0,
  fontFace: HEAD, fontSize: 46, bold: true, color: WHITE,
});
s.addText("Turkish tax treatment of fixed assets and intangibles, with worked examples", {
  x: M, y: 3.25, w: 9.2, h: 0.5, isTextBox: true, margin: 0,
  fontFace: BODY, fontSize: 17, color: "CADCFC",
});
s.addShape(pres.ShapeType.rect, { x: M, y: 4.05, w: 1.5, h: 0.035, fill: { color: CRIMSON }, line: { color: CRIMSON } });
s.addText([
  { text: "Prepared for", options: { fontSize: 11, color: "8FA8D4", breakLine: true } },
  { text: "China Finance HQ", options: { fontSize: 16, bold: true, color: WHITE, breakLine: true } },
], { x: M, y: 4.45, w: 4, h: 0.8, isTextBox: true, margin: 0, fontFace: BODY });
s.addText([
  { text: "Basis", options: { fontSize: 11, color: "8FA8D4", breakLine: true } },
  { text: "Tax Procedure Law No. 213 · 2026 thresholds", options: { fontSize: 16, bold: true, color: WHITE, breakLine: true } },
], { x: 5.6, y: 4.45, w: 7, h: 0.8, isTextBox: true, margin: 0, fontFace: BODY });
s.addNotes("Scope: Turkish tax book treatment. Statutory/IFRS book figures differ and are reconciled in the tax return.");

/* ============================================================ 2 EXEC SUMMARY */
s = pres.addSlide();
titleBar(s, "What HQ needs to know", "Executive summary");
const exec = [
  ["Rates are fixed by law, not by policy", "Useful lives come from a binding official schedule, asset by asset and sector by sector. Management cannot choose them. A longer life may be elected; a shorter one never."],
  ["Inflation adjustment is suspended", "For 2025, 2026 and 2027 no inflation adjustment is applied, regardless of whether the statutory trigger is met. An optional annual revaluation replaces it and protects the depreciation base."],
  ["Passenger cars are capped", "Unique to this asset class: the deductible cost is capped and the excess is permanently non-deductible. It is a permanent difference, not timing."],
];
exec.forEach((row, i) => {
  const y = 1.70 + i * 1.55;
  card(s, M, y, W - 2 * M, 1.4);
  numDot(s, M + 0.32, y + 0.28, i + 1);
  s.addText(row[0], {
    x: M + 0.95, y: y + 0.2, w: W - 2 * M - 1.3, h: 0.36, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 16, bold: true, color: NAVY,
  });
  s.addText(row[1], {
    x: M + 0.95, y: y + 0.6, w: W - 2 * M - 1.3, h: 0.7, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 13, color: INK,
  });
});
footnote(s, "Detail and worked examples follow. All figures are 2026 amounts unless stated otherwise.");

/* ============================================================ 3 LEGAL FRAMEWORK */
s = pres.addSlide();
titleBar(s, "Legal framework", "Where the rules come from");
const legal = [
  ["Tax Procedure Law No. 213 (VUK)", "Arts. 313–321 set what is depreciable, the methods and the periods. Repeated Art. 315 governs declining balance."],
  ["Depreciation List", "General Communiqué No. 333 (2004), amended nine times since. The binding schedule of useful lives, several hundred lines, differentiated by sector."],
  ["Income Tax Law No. 193", "Art. 40 restricts passenger car costs. Annual amounts are set by communiqué, most recently No. 332 for 2026."],
  ["Annual threshold updates", "The direct expensing limit and car caps are re-set every January. Any model built on them must be refreshed yearly."],
];
legal.forEach((row, i) => {
  const x = i % 2 === 0 ? M : W / 2 + 0.15;
  const y = i < 2 ? 1.8 : 4.05;
  card(s, x, y, (W - 2 * M - 0.3) / 2, 1.95);
  s.addShape(pres.ShapeType.ellipse, { x: x + 0.3, y: y + 0.28, w: 0.34, h: 0.34, fill: { color: PALE }, line: { color: NAVY, width: 1 } });
  s.addText(row[0], {
    x: x + 0.78, y: y + 0.24, w: (W - 2 * M - 0.3) / 2 - 1.1, h: 0.62, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 15, bold: true, color: NAVY,
  });
  s.addText(row[1], {
    x: x + 0.3, y: y + 0.95, w: (W - 2 * M - 0.3) / 2 - 0.6, h: 0.85, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 12, color: INK,
  });
});

/* ============================================================ 4 WHAT QUALIFIES */
s = pres.addSlide();
titleBar(s, "What is depreciated, and what is expensed at once", "Scope");
card(s, M, 1.8, 5.6, 3.1, PALE);
s.addText("Expensed immediately", {
  x: M + 0.35, y: 2.0, w: 5, h: 0.4, isTextBox: true, margin: 0,
  fontFace: BODY, fontSize: 16, bold: true, color: NAVY,
});
stat(s, M + 0.35, 2.45, 5, "TRY 12,000", "2026 threshold, VAT excluded. Assets below this are deducted in full in the year of purchase.", CRIMSON);
s.addText("Assets that form one economic and technical unit are tested together against the limit, not item by item.", {
  x: M + 0.35, y: 4.0, w: 5, h: 0.75, isTextBox: true, margin: 0,
  fontFace: BODY, fontSize: 12, color: INK,
});

card(s, M + 5.9, 1.8, W - 2 * M - 5.9, 3.1);
s.addText("Depreciated over its useful life", {
  x: M + 6.25, y: 2.0, w: 5.5, h: 0.4, isTextBox: true, margin: 0,
  fontFace: BODY, fontSize: 16, bold: true, color: NAVY,
});
s.addText([
  { text: "Held in the business for more than one year", options: { bullet: true, breakLine: true } },
  { text: "Subject to wear, obsolescence or depletion", options: { bullet: true, breakLine: true } },
  { text: "Recorded at acquisition cost; no residual value is deducted", options: { bullet: true, breakLine: true } },
  { text: "Land is never depreciated; buildings on it are", options: { bullet: true, breakLine: false } },
], {
  x: M + 6.25, y: 2.5, w: 5.4, h: 2.1, isTextBox: true, margin: 0,
  fontFace: BODY, fontSize: 13, color: INK, paraSpaceAfter: 8,
});
footnote(s, "VUK Art. 313. Turkish tax depreciation is computed on full cost: unlike IFRS, residual value is not deducted from the depreciable base.");

/* ============================================================ 5 USEFUL LIVES */
s = pres.addSlide();
titleBar(s, "Useful lives are prescribed, not estimated", "The depreciation schedule");
s.addText("This is the structural difference HQ should note. Turkish tax law does not set a handful of statutory minimums and let management estimate within them. It publishes a detailed schedule and the taxpayer applies the line that fits the asset.", {
  x: M, y: 1.72, w: W - 2 * M, h: 0.62, isTextBox: true, margin: 0,
  fontFace: BODY, fontSize: 13, color: INK,
});
const HDRCELL = { bold: true, color: WHITE, fill: { color: NAVY }, align: "center" };
const lives = [
  [{ text: "Asset class", options: { bold: true, color: WHITE, fill: { color: NAVY } } },
   { text: "Useful life", options: HDRCELL },
   { text: "Annual rate", options: { bold: true, color: WHITE, fill: { color: NAVY }, align: "center" } }],
  ["Buildings (commercial / industrial)", { text: "50 years", options: { align: "center" } }, { text: "2.00%", options: { align: "center" } }],
  ["Machinery and equipment (sector dependent)", { text: "5–15 years", options: { align: "center" } }, { text: "6.7–20%", options: { align: "center" } }],
  ["Passenger cars", { text: "5 years", options: { align: "center" } }, { text: "20.0%", options: { align: "center" } }],
  ["Office furniture and fixtures", { text: "5 years", options: { align: "center" } }, { text: "20.0%", options: { align: "center" } }],
  ["Computers and hardware", { text: "4 years", options: { align: "center" } }, { text: "25.0%", options: { align: "center" } }],
  ["Computer software", { text: "3 years", options: { align: "center" } }, { text: "33.3%", options: { align: "center" } }],
  ["Intangible rights (patents, know-how, licences)", { text: "15 years", options: { align: "center" } }, { text: "6.66%", options: { align: "center" } }],
];
s.addTable(lives, {
  x: M, y: 2.5, w: W - 2 * M, colW: [6.4, 2.75, 2.75],
  fontFace: BODY, fontSize: 13, color: INK, border: { type: "solid", color: "DDE4EE", pt: 0.75 },
  fill: { color: WHITE }, rowH: 0.38, valign: "middle",
  autoPage: false,
});
footnote(s, "Indicative figures from the Depreciation List (VUK General Communiqué No. 333 as amended). Where an asset serves more than one sector, the longest life and lowest rate applies. Confirm the line for each specific asset before filing.");

/* ============================================================ 6 METHODS */
s = pres.addSlide();
titleBar(s, "Four choices the taxpayer controls", "Methods and elections");
const methods = [
  ["Straight-line", "The default. Equal amounts across the official life.", "Available to all taxpayers"],
  ["Declining balance", "Twice the normal rate, capped at 50%, applied to net book value. The final year's balance is written off in full.", "Balance-sheet taxpayers only"],
  ["Daily basis", "Depreciation runs from the day of acquisition rather than taking a full year.", "Optional, since 2021"],
  ["Longer useful life", "A life up to twice the official one may be elected, never beyond 50 years, at the same rate each year.", "Optional, since 2021"],
];
methods.forEach((m, i) => {
  const x = M + (i % 2) * ((W - 2 * M) / 2 + 0.15);
  const y = i < 2 ? 1.8 : 4.0;
  const w = (W - 2 * M - 0.3) / 2;
  card(s, x, y, w, 1.95);
  s.addText(m[0], {
    x: x + 0.32, y: y + 0.22, w: w - 0.64, h: 0.4, isTextBox: true, margin: 0,
    fontFace: HEAD, fontSize: 19, bold: true, color: NAVY,
  });
  s.addText(m[1], {
    x: x + 0.32, y: y + 0.68, w: w - 0.64, h: 0.8, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 12.5, color: INK,
  });
  s.addText(m[2], {
    x: x + 0.32, y: y + 1.5, w: w - 0.64, h: 0.3, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 11, bold: true, italic: true, color: CRIMSON,
  });
});
footnote(s, "A taxpayer may switch from declining balance to straight-line, but never the other way. Once made, the election binds the asset for its life.");

/* ============================================================ 7 EXAMPLE SL vs DB */
s = pres.addSlide();
titleBar(s, "Straight-line vs declining balance", "Worked example · machinery, TRY 4.8m, 10 years");
s.addChart(pres.ChartType.bar, [
  { name: "Straight-line", labels: ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7", "Y8", "Y9", "Y10"],
    values: [480000, 480000, 480000, 480000, 480000, 480000, 480000, 480000, 480000, 480000] },
  { name: "Declining balance", labels: ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7", "Y8", "Y9", "Y10"],
    values: [960000, 768000, 614400, 491520, 393216, 314573, 251658, 201327, 161061, 644245] },
], {
  x: M, y: 1.85, w: 7.9, h: 4.25,
  barDir: "col", chartColors: [NAVY_SOFT, CRIMSON],
  showTitle: false, showLegend: true, legendPos: "t", legendFontFace: BODY, legendFontSize: 11,
  catAxisLabelColor: MUTED, valAxisLabelColor: MUTED,
  catAxisLabelFontFace: BODY, valAxisLabelFontFace: BODY,
  catAxisLabelFontSize: 10, valAxisLabelFontSize: 10,
  valGridLine: { color: "E8ECF2", size: 0.75 }, catGridLine: { style: "none" },
  valAxisLabelFormatCode: "#,##0",
});
card(s, 8.85, 1.85, W - M - 8.85, 4.25, PALE);
s.addText("What changes", {
  x: 9.15, y: 2.05, w: 3.2, h: 0.35, isTextBox: true, margin: 0,
  fontFace: BODY, fontSize: 15, bold: true, color: NAVY,
});
stat(s, 9.15, 2.5, 3.2, "TRY 960,000", "Year 1 under declining balance, against 480,000 straight-line.", CRIMSON);
s.addText("What does not change", {
  x: 9.15, y: 4.05, w: 3.2, h: 0.35, isTextBox: true, margin: 0,
  fontFace: BODY, fontSize: 15, bold: true, color: NAVY,
});
stat(s, 9.15, 4.5, 3.2, "TRY 0", "Difference in total deductions over the asset's life.", GREEN);
footnote(s, "Declining balance is a timing benefit, not a permanent saving. Under persistent inflation and high nominal rates that timing is economically material. Source: model tab 'Ex2 SL vs Declining'.");

/* ============================================================ 8 CARS: CAPS */
s = pres.addSlide();
titleBar(s, "Passenger cars carry caps no other asset has", "2026 restrictions");
const caps = [
  ["TRY 1,380,000", "Depreciable cost cap\nÖTV and VAT excluded"],
  ["TRY 2,600,000", "Depreciable cost cap\nÖTV and VAT capitalised"],
  ["TRY 1,200,000", "ÖTV and VAT cap\nif expensed directly"],
  ["TRY 46,000", "Monthly rental cap\nVAT excluded"],
];
caps.forEach((c, i) => {
  const w = (W - 2 * M - 0.45) / 4;
  const x = M + i * (w + 0.15);
  card(s, x, 1.85, w, 2.0);
  s.addText(c[0], {
    x: x + 0.15, y: 2.15, w: w - 0.3, h: 0.6, isTextBox: true, margin: 0,
    fontFace: HEAD, fontSize: 22, bold: true, color: NAVY, align: "center", valign: "middle",
  });
  s.addText(c[1], {
    x: x + 0.15, y: 2.8, w: w - 0.3, h: 0.9, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 11.5, color: MUTED, align: "center", valign: "top",
  });
});
card(s, M, 4.1, W - 2 * M, 2.05, PALE);
s.addText("Two consequences", {
  x: M + 0.35, y: 4.3, w: 5, h: 0.35, isTextBox: true, margin: 0,
  fontFace: BODY, fontSize: 15, bold: true, color: NAVY,
});
s.addText([
  { text: "Cost above the cap is permanently non-deductible. It never reverses, so it is a permanent difference in the tax reconciliation, not a temporary one.", options: { bullet: true, breakLine: true } },
  { text: "First-year depreciation is pro-rated from the month of acquisition. The portion not taken in year 1 is deducted in the year after the useful life ends.", options: { bullet: true, breakLine: false } },
], {
  x: M + 0.35, y: 4.72, w: W - 2 * M - 0.7, h: 1.25, isTextBox: true, margin: 0,
  fontFace: BODY, fontSize: 13, color: INK, paraSpaceAfter: 8,
});
footnote(s, "Income Tax Law Art. 40/1, 40/5 and 40/7; 2026 amounts per Income Tax General Communiqué No. 332. Pro-rata rule: VUK Art. 320.");

/* ============================================================ 9 CARS: EXAMPLE */
s = pres.addSlide();
titleBar(s, "The purchase structure changes the deduction", "Worked example · car at TRY 2.0m + TRY 1.6m taxes, bought in April");
const rows = [
  [{ text: "", options: { fill: { color: NAVY } } },
   { text: "Option A\nTaxes expensed", options: { bold: true, color: WHITE, align: "center", fill: { color: NAVY } } },
   { text: "Option B\nTaxes capitalised", options: { bold: true, color: WHITE, align: "center", fill: { color: NAVY } } }],
  ["Depreciable base after cap", { text: "1,380,000", options: { align: "center" } }, { text: "2,600,000", options: { align: "center" } }],
  ["Taxes deducted in year 1", { text: "1,200,000", options: { align: "center" } }, { text: "—", options: { align: "center" } }],
  ["Year 1 depreciation (9 months)", { text: "207,000", options: { align: "center" } }, { text: "390,000", options: { align: "center" } }],
  ["Years 2–5, each", { text: "276,000", options: { align: "center" } }, { text: "520,000", options: { align: "center" } }],
  ["Year 6 (pro-rata catch-up)", { text: "69,000", options: { align: "center" } }, { text: "130,000", options: { align: "center" } }],
  [{ text: "Total deduction over life", options: { bold: true } },
   { text: "2,580,000", options: { bold: true, align: "center" } },
   { text: "2,600,000", options: { bold: true, align: "center" } }],
  [{ text: "Permanently disallowed", options: { bold: true, color: CRIMSON } },
   { text: "1,020,000", options: { bold: true, color: CRIMSON, align: "center" } },
   { text: "1,000,000", options: { bold: true, color: CRIMSON, align: "center" } }],
];
s.addTable(rows, {
  x: M, y: 1.95, w: 8.3, colW: [4.0, 2.15, 2.15],
  fontFace: BODY, fontSize: 12.5, color: INK,
  border: { type: "solid", color: "DDE4EE", pt: 0.75 }, fill: { color: WHITE },
  rowH: 0.42, valign: "middle", autoPage: false,
});
card(s, 9.35, 1.95, W - M - 9.35, 3.9, PALE);
s.addText("Read this before buying", {
  x: 9.6, y: 2.15, w: 2.8, h: 0.35, isTextBox: true, margin: 0,
  fontFace: BODY, fontSize: 14, bold: true, color: NAVY,
});
s.addText([
  { text: "The choice is made once, at acquisition, and cannot be revisited.", options: { bullet: true, breakLine: true } },
  { text: "At this price point Option B deducts TRY 20,000 more in total.", options: { bullet: true, breakLine: true } },
  { text: "Option A front-loads: 1.2m is deducted in year 1 rather than spread over five.", options: { bullet: true, breakLine: true } },
  { text: "The ranking flips at other price points. Run both.", options: { bullet: true, breakLine: false } },
], {
  x: 9.6, y: 2.6, w: 2.85, h: 3.05, isTextBox: true, margin: 0,
  fontFace: BODY, fontSize: 11.5, color: INK, paraSpaceAfter: 7,
});
footnote(s, "Figures computed in the accompanying model, tab 'Ex3 Passenger Car'. Change the price, tax and purchase month to re-run.");

/* ============================================================ 10 INTANGIBLES */
s = pres.addSlide();
titleBar(s, "Intangibles: classification decides the outcome", "Intangibles and special items");
const intan = [
  [{ text: "Item", options: { bold: true, color: WHITE, fill: { color: NAVY } } },
   { text: "Period", options: { bold: true, color: WHITE, align: "center", fill: { color: NAVY } } },
   { text: "Basis", options: { bold: true, color: WHITE, fill: { color: NAVY } } }],
  ["Computer software", { text: "3 years", options: { align: "center" } }, "Depreciation List item 4.3"],
  ["Licence or intangible right", { text: "15 years", options: { align: "center" } }, "Patents, know-how, licences"],
  ["Leasehold improvements", { text: "Lease term", options: { align: "center" } }, "VUK Art. 327, equal percentages; declining balance not allowed"],
  ["Leasehold improvements, term unknown", { text: "5 years", options: { align: "center" } }, "VUK Art. 327"],
  ["Goodwill", { text: "5 years", options: { align: "center" } }, "VUK Art. 326, equal instalments"],
  ["Formation and organisation expenses", { text: "5 years", options: { align: "center" } }, "VUK Art. 326, or expensed as incurred"],
];
s.addTable(intan, {
  x: M, y: 1.9, w: 8.2, colW: [3.5, 1.5, 3.2],
  fontFace: BODY, fontSize: 12, color: INK,
  border: { type: "solid", color: "DDE4EE", pt: 0.75 }, fill: { color: WHITE },
  rowH: 0.45, valign: "middle", autoPage: false,
});
card(s, 9.25, 1.9, W - M - 9.25, 3.55);
s.addText("Same payment, five times the wait", {
  x: 9.5, y: 2.1, w: 2.95, h: 0.6, isTextBox: true, margin: 0,
  fontFace: BODY, fontSize: 14, bold: true, color: NAVY,
});
stat(s, 9.5, 2.75, 2.95, "TRY 240,000", "Annual difference on a TRY 900,000 payment, depending on whether it is booked as software or as a licence.", CRIMSON);
s.addText("Decide and document the classification in the contract wording at purchase, not in the ledger afterwards.", {
  x: 9.5, y: 4.55, w: 2.95, h: 0.8, isTextBox: true, margin: 0,
  fontFace: BODY, fontSize: 11.5, italic: true, color: INK,
});
footnote(s, "Both routes deduct the same total cost, so this is timing. Under inflation, a deduction deferred twelve years is worth a fraction of its nominal value.");

/* ============================================================ 11 INFLATION */
s = pres.addSlide();
s.background = { color: NAVY };
s.addText("THE ITEM THAT MOVES THE NUMBERS", {
  x: M, y: 0.7, w: W - 2 * M, h: 0.3, isTextBox: true, margin: 0,
  fontFace: BODY, fontSize: 11, bold: true, color: "8FA8D4", charSpacing: 2,
});
s.addText("Inflation adjustment is suspended through 2027", {
  x: M, y: 1.05, w: W - 2 * M, h: 0.75, isTextBox: true, margin: 0,
  fontFace: HEAD, fontSize: 34, bold: true, color: WHITE,
});
s.addText("Law No. 7571 added Provisional Article 37 to the Tax Procedure Law (Official Gazette, 25 December 2025, No. 33118). For 2025, 2026 and 2027 financial statements are not adjusted for inflation, whether or not the statutory conditions are met. The President may extend this by up to three further periods.", {
  x: M, y: 1.95, w: W - 2 * M, h: 0.85, isTextBox: true, margin: 0,
  fontFace: BODY, fontSize: 14, color: "CADCFC",
});
const infl = [
  ["What is switched off", "Inflation adjustment under VUK Repeated Art. 298/A. Asset values and depreciation stay in historical lira."],
  ["What remains available", "Optional annual revaluation under VUK Repeated Art. 298/Ç. Assets are indexed by the official revaluation rate."],
  ["Why it matters", "The uplift is credited to a fund in equity and is not taxed, yet depreciation is then computed on the higher base."],
];
infl.forEach((c, i) => {
  const w = (W - 2 * M - 0.5) / 3;
  const x = M + i * (w + 0.25);
  s.addShape(pres.ShapeType.roundRect, {
    x, y: 3.1, w, h: 2.25, rectRadius: 0.08,
    fill: { color: NAVY_SOFT }, line: { color: "3C5488", width: 1 },
  });
  s.addText(c[0], {
    x: x + 0.28, y: 3.35, w: w - 0.56, h: 0.4, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 14, bold: true, color: WHITE,
  });
  s.addText(c[1], {
    x: x + 0.28, y: 3.8, w: w - 0.56, h: 1.3, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 12, color: "CADCFC",
  });
});
s.addText("2025 revaluation rate: 25.49%  ·  VUK General Communiqué No. 585, Official Gazette 27 November 2025", {
  x: M, y: 5.65, w: W - 2 * M, h: 0.4, isTextBox: true, margin: 0,
  fontFace: BODY, fontSize: 13, bold: true, color: WHITE,
});
s.addNotes("This is the single most important slide for a parent company comparing year-on-year Turkish depreciation figures.");

/* ============================================================ 12 REVALUATION EXAMPLE */
s = pres.addSlide();
titleBar(s, "What the revaluation election is worth", "Worked example · asset at TRY 4.8m, 10 years, 30% depreciated");
s.addChart(pres.ChartType.bar, [
  { name: "Without revaluation", labels: ["Gross cost", "Net book value", "Annual depreciation"], values: [4800000, 3360000, 480000] },
  { name: "With revaluation", labels: ["Gross cost", "Net book value", "Annual depreciation"], values: [6023520, 4216464, 602352] },
], {
  x: M, y: 1.95, w: 7.8, h: 3.9,
  barDir: "col", chartColors: [MUTED, NAVY_SOFT],
  showTitle: false, showLegend: true, legendPos: "t", legendFontFace: BODY, legendFontSize: 11,
  catAxisLabelColor: MUTED, valAxisLabelColor: MUTED,
  catAxisLabelFontFace: BODY, valAxisLabelFontFace: BODY,
  catAxisLabelFontSize: 11, valAxisLabelFontSize: 10,
  valGridLine: { color: "E8ECF2", size: 0.75 }, catGridLine: { style: "none" },
  valAxisLabelFormatCode: "#,##0",
});
card(s, 8.75, 1.95, W - M - 8.75, 3.9, PALE);
stat(s, 9.05, 2.2, 3.3, "+TRY 122,352", "Additional deductible depreciation every year, for this single asset.", GREEN);
stat(s, 9.05, 3.75, 3.3, "TRY 856,464", "Credited to a special fund in equity. Not taxed unless distributed or withdrawn.", NAVY);
s.addText("Optional and assessed annually.", {
  x: 9.05, y: 5.3, w: 3.3, h: 0.35, isTextBox: true, margin: 0,
  fontFace: BODY, fontSize: 11.5, italic: true, color: MUTED,
});
footnote(s, "Without revaluation, depreciation stays fixed in nominal lira while replacement cost rises, so the real value of the deduction erodes and taxable profit is overstated. Source: model tab 'Ex4 Revaluation'.");

/* ============================================================ 13 TAKEAWAYS */
s = pres.addSlide();
titleBar(s, "What we ask HQ to note", "Conclusions");
const take = [
  ["Do not read Turkish depreciation as an estimate", "Lives come from a binding schedule. Year-on-year movements reflect law and indexation changes, not management judgement."],
  ["Expect two kinds of difference", "Method and life differences reverse over time. Passenger car caps never reverse and must be tracked as permanent."],
  ["Revisit the revaluation election every year", "It is optional, it is not taxed, and while inflation adjustment stays suspended it is the main protection for the depreciation base."],
  ["Refresh thresholds each January", "The direct expensing limit and car caps are re-set annually. The attached model has one tab for these; update it and everything recalculates."],
];
take.forEach((t, i) => {
  const y = 1.72 + i * 1.16;
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y, w: W - 2 * M, h: 1.05, rectRadius: 0.06,
    fill: { color: i % 2 === 0 ? CARD : WHITE }, line: { color: "DDE4EE", width: 0.75 },
  });
  numDot(s, M + 0.3, y + 0.31, i + 1, i === 2 ? CRIMSON : NAVY);
  s.addText(t[0], {
    x: M + 0.95, y: y + 0.16, w: W - 2 * M - 1.3, h: 0.34, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 15, bold: true, color: NAVY,
  });
  s.addText(t[1], {
    x: M + 0.95, y: y + 0.52, w: W - 2 * M - 1.3, h: 0.45, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 12.5, color: INK,
  });
});
footnote(s, "Accompanying file: TR-Depreciation-Model-2026.xlsx. Every figure in this deck is a live formula there; change an input and the schedules recalculate.");

/* ============================================================ 14 SOURCES */
s = pres.addSlide();
s.background = { color: NAVY };
s.addText("Sources", {
  x: M, y: 0.6, w: W - 2 * M, h: 0.7, isTextBox: true, margin: 0,
  fontFace: HEAD, fontSize: 32, bold: true, color: WHITE,
});
const src = [
  "Tax Procedure Law No. 213, Arts. 313–321 — depreciable assets, methods, periods, pro-rata rule",
  "VUK Repeated Art. 315 — declining balance; twice the normal rate, capped at 50%",
  "VUK Arts. 320 and 320/A, as amended by Law No. 7338 (26.10.2021) — longer-life election and daily basis",
  "VUK Arts. 326 and 327 — goodwill, formation expenses and leasehold improvements",
  "VUK Repeated Art. 298/Ç — optional continuous revaluation of depreciable assets",
  "VUK Provisional Art. 37, added by Law No. 7571 Art. 34 — inflation adjustment suspended for 2025–2027 (Official Gazette 25.12.2025, No. 33118)",
  "VUK General Communiqué No. 333 (28.04.2004), as amended by Nos. 339, 345, 365, 389, 399, 406, 418, 439, 458 — the Depreciation List",
  "VUK General Communiqué No. 585 (Official Gazette 27.11.2025) — 2025 revaluation rate of 25.49%",
  "Income Tax Law No. 193, Arts. 40/1, 40/5, 40/7 and Income Tax General Communiqué No. 332 — 2026 passenger car limits",
];
s.addText(src.map((t, i) => ({
  text: t, options: { bullet: true, breakLine: i !== src.length - 1 },
})), {
  x: M, y: 1.5, w: W - 2 * M, h: 4.3, isTextBox: true, margin: 0,
  fontFace: BODY, fontSize: 13, color: "CADCFC", paraSpaceAfter: 10,
});
s.addText("Primary legislation is published in the Official Gazette and consolidated by the Revenue Administration (gib.gov.tr). Threshold amounts are re-set annually; figures here are the 2026 amounts.", {
  x: M, y: 6.1, w: W - 2 * M, h: 0.6, isTextBox: true, margin: 0,
  fontFace: BODY, fontSize: 11, italic: true, color: "8FA8D4",
});

pres.writeFile({ fileName: "/home/user/BieS/raporlar/TR-Depreciation-Amortisation-HQ-Briefing.pptx" })
  .then(f => console.log("written:", f));
