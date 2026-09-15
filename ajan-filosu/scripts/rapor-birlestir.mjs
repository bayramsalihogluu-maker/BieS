#!/usr/bin/env node
// Kullanim: node scripts/rapor-birlestir.mjs
//
// FAZ 3'un "uydurma rapor yazma" kuralini mekanik hale getirir: Bolum B'yi
// LLM'in hafizasindan yazmasi yerine dogrudan isler/<slug>/SONUC.md
// dosyalarindan kurar. Bos ya da eksik SONUC.md otomatik olarak
// "çıktı üretmedi" olarak isaretlenir, boylece bitmemis bir is yanlislikla
// "bitti" diye raporlanamaz. Cikan metin, rapor-format.md Bolum B'nin
// ilk taslagi olarak kullanilir.

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const ISLER_DIR = "isler";

if (!existsSync(ISLER_DIR)) {
  console.error(`${ISLER_DIR}/ klasörü yok. Kök dizinde mi çalıştırıyorsun?`);
  process.exit(2);
}

const slugs = readdirSync(ISLER_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

if (slugs.length === 0) {
  console.error(`${ISLER_DIR}/ altında iş klasörü yok, henüz koş çalışmamış olabilir.`);
  process.exit(2);
}

let done = 0;
let empty = 0;
const blocks = [];

for (const slug of slugs) {
  const sonucPath = join(ISLER_DIR, slug, "SONUC.md");
  let content = "";
  if (existsSync(sonucPath) && statSync(sonucPath).isFile()) {
    content = readFileSync(sonucPath, "utf8").trim();
  }
  const hasOutput = content.length > 0;
  if (hasOutput) done++;
  else empty++;

  const status = hasOutput ? "bitti" : "çıktı üretmedi";
  const body = hasOutput ? content : "_(SONUC.md boş ya da yok)_";
  blocks.push(`### ${slug} · **${status}**\n\n${body}`);
}

console.log(`# Filo koşusu · ham birleştirme (Bölüm B taslağı)\n`);
console.log(`Koşulan iş klasörü: ${slugs.length}`);
console.log(`SONUC.md dolu: ${done}`);
console.log(`SONUC.md boş/yok: ${empty}\n`);
console.log("---\n");
console.log(blocks.join("\n\n---\n\n"));
