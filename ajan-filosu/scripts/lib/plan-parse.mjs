// Ajan Filosu icin en az bagimlilikla markdown tablo ayristirici.
// plan/*.md dosyalarindaki GFM tablolarini { header, rows } seklinde okur.

function normalize(s) {
  return (s || "")
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .trim();
}

function splitRow(line) {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

function isTableRow(line) {
  return line.trim().startsWith("|") && line.trim().endsWith("|");
}

function isSeparatorRow(line) {
  return /^\|?[\s:|-]+\|?$/.test(line.trim()) && line.includes("-");
}

// headerPattern: normalize edilmis satirda arayacagimiz alt dize (ornek: "#" ya da "dalga")
export function parseMarkdownTable(text, headerNeedle) {
  const lines = text.split("\n");
  const needle = normalize(headerNeedle);
  const headerIdx = lines.findIndex(
    (l) => isTableRow(l) && normalize(l).includes(needle)
  );
  if (headerIdx === -1) return null;

  const header = splitRow(lines[headerIdx]);
  let i = headerIdx + 1;
  if (i < lines.length && isSeparatorRow(lines[i])) i++;

  const rows = [];
  while (i < lines.length && isTableRow(lines[i]) && !isSeparatorRow(lines[i])) {
    rows.push(splitRow(lines[i]));
    i++;
  }
  return { header, rows };
}

export function findColumn(header, needle) {
  const n = normalize(needle);
  return header.findIndex((h) => normalize(h).includes(n));
}

export { normalize };
