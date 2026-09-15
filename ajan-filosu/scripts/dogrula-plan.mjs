#!/usr/bin/env node
// Kullanim: node scripts/dogrula-plan.mjs plan/2026-07-29-plan.md
//
// FAZ 1'in "sana bir daha bakma" varsayimini kaldirir: plani LLM'in kendi
// okumasina birakmak yerine, "ayni dalgada ayni dosyaya yazma" ve
// "dalgada en fazla 4 is" kurallarini programatik olarak dogrular.
// planla adiminin sonunda, DUR demeden once calistirilmasi beklenir.

import { readFileSync } from "node:fs";
import { validatePlan } from "./lib/dogrula.mjs";

const planPath = process.argv[2];
if (!planPath) {
  console.error("Kullanım: node scripts/dogrula-plan.mjs <plan-dosyasi.md>");
  process.exit(2);
}

let text;
try {
  text = readFileSync(planPath, "utf8");
} catch (err) {
  console.error(`Plan dosyası okunamadı: ${planPath}\n${err.message}`);
  process.exit(2);
}

const { errors, warnings, jobs, waves } = validatePlan(text);

console.log(`# Plan doğrulama · ${planPath}\n`);
console.log(`İş sayısı: ${Object.keys(jobs).length}`);
console.log(`Dalga sayısı: ${waves.length}\n`);

if (warnings.length) {
  console.log("## Uyarılar");
  for (const w of warnings) console.log(`  - ${w}`);
  console.log("");
}

if (errors.length) {
  console.log("## Hatalar");
  for (const e of errors) console.log(`  - ${e}`);
  console.log("\nSonuç: GEÇERSİZ. Koşmadan önce planı düzelt.");
  process.exit(1);
}

console.log("Sonuç: GEÇERLİ. Yazma çakışması ve dalga sınırı ihlali bulunamadı.");
process.exit(0);
