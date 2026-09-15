// plan/*.md dosyasini FAZ 1 kurallarina karsi dogrular:
//   - bir dalgada en fazla 4 is
//   - "ayni anda" isaretli bir dalgada iki is ayni dosyaya yazamaz
//   - dalgalarda gecen her is Bolum A'da tanimli olmali (ve tersi)
// Sonuc { errors, warnings, jobs, waves } seklinde döner; CLI ve testler
// bunu ortak kullanir, boylece kural mantigi tek yerde yasar.

import { parseMarkdownTable, findColumn, normalize } from "./plan-parse.mjs";

const MAX_WAVE_SIZE = 4;

function splitList(raw) {
  if (!raw || raw.trim() === "-" || raw.trim() === "") return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function validatePlan(text) {
  const errors = [];
  const warnings = [];

  const jobsTable = parseMarkdownTable(text, "#");
  const wavesTable = parseMarkdownTable(text, "dalga");

  if (!jobsTable) {
    errors.push("Bölüm A (İşler) tablosu bulunamadı.");
    return { errors, warnings, jobs: {}, waves: [] };
  }
  if (!wavesTable) {
    errors.push("Bölüm C (Dalgalar) tablosu bulunamadı.");
    return { errors, warnings, jobs: {}, waves: [] };
  }

  const numCol = findColumn(jobsTable.header, "#");
  const writesCol = findColumn(jobsTable.header, "dosya");
  if (numCol === -1 || writesCol === -1) {
    errors.push(
      "Bölüm A tablosunda '#' ya da 'YAZACAĞI dosyalar' sütunu bulunamadı."
    );
    return { errors, warnings, jobs: {}, waves: [] };
  }

  const jobs = {};
  for (const row of jobsTable.rows) {
    const num = (row[numCol] || "").trim();
    if (!/^\d+$/.test(num)) continue; // bos sablon satiri
    jobs[num] = { writes: splitList(row[writesCol]) };
  }

  const waveCol = findColumn(wavesTable.header, "dalga");
  const jobsCol = findColumn(wavesTable.header, "isler");
  const modeCol = findColumn(wavesTable.header, "ayni anda");
  if (waveCol === -1 || jobsCol === -1) {
    errors.push(
      "Bölüm C tablosunda 'Dalga' ya da 'İşler' sütunu bulunamadı."
    );
    return { errors, warnings, jobs, waves: [] };
  }

  const waves = [];
  for (const row of wavesTable.rows) {
    const wave = (row[waveCol] || "").trim();
    if (!wave) continue;
    const jobNums = splitList(row[jobsCol]);
    const mode = normalize(modeCol === -1 ? "" : row[modeCol]);
    waves.push({ wave, jobs: jobNums, mode });
  }

  // her dalgadaki is sayisi
  for (const w of waves) {
    if (w.jobs.length > MAX_WAVE_SIZE) {
      errors.push(
        `Dalga ${w.wave}: ${w.jobs.length} iş var, en fazla ${MAX_WAVE_SIZE} olmalı.`
      );
    }
  }

  // dalga <-> is tablosu tutarliligi
  const jobNumsInWaves = new Set(waves.flatMap((w) => w.jobs));
  for (const n of Object.keys(jobs)) {
    if (!jobNumsInWaves.has(n)) {
      warnings.push(`İş ${n} Bölüm A'da var ama hiçbir dalgaya atanmamış.`);
    }
  }
  for (const w of waves) {
    for (const n of w.jobs) {
      if (!jobs[n]) {
        errors.push(
          `Dalga ${w.wave}: iş ${n} listelenmiş ama Bölüm A'da tanımlı değil.`
        );
      }
    }
  }

  // yazma catismasi: "ayni anda" = evet/paralel isaretli dalgalarda
  const sequentialMarkers = ["sirali", "tek", "hayir"];
  for (const w of waves) {
    if (w.jobs.length < 2) continue;
    const isSequential = sequentialMarkers.some((m) => w.mode.includes(m));
    if (isSequential) continue;

    for (let i = 0; i < w.jobs.length; i++) {
      for (let j = i + 1; j < w.jobs.length; j++) {
        const a = jobs[w.jobs[i]];
        const b = jobs[w.jobs[j]];
        if (!a || !b) continue; // yukarida zaten hata olarak eklendi
        const shared = a.writes.filter((f) => b.writes.includes(f));
        if (shared.length > 0) {
          errors.push(
            `Dalga ${w.wave}: iş ${w.jobs[i]} ve iş ${w.jobs[j]} aynı anda ` +
              `koşacak şekilde işaretli ama ikisi de aynı dosyaya yazıyor ` +
              `(${shared.join(", ")}).`
          );
        }
      }
    }
  }

  return { errors, warnings, jobs, waves };
}
