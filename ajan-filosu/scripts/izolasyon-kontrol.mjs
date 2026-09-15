#!/usr/bin/env node
// Kullanim: node scripts/izolasyon-kontrol.mjs
//
// FAZ 3 / Bolum E'nin "her calisan gercekten kendi klasorunde mi kaldi"
// sorusunu LLM'in kendi ifadesine birakmak yerine `git status` uzerinden
// deterministik olarak yanitlar. koş bitiminde, rapor yazilmadan once
// calistirilmasi ve ciktisinin doğrudan rapora yapıştırılması beklenir.

import { execSync } from "node:child_process";

const ALLOWED_PREFIXES = ["isler/", "ciktilar/", "plan/"];

function sh(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

// ajan-filosu, kendi başına depo kökü olabileceği gibi (npx degit ile
// indirildiğinde) daha büyük bir deponun alt klasörü de olabilir. git
// status yolları her zaman depo köküne göre döner; burada onları
// ajan-filosu/ köküne göre yeniden yazıyoruz ki komut nereden
// çalıştırılırsa çalıştırılsın isler/ciktilar/plan kontrolü doğru çalışsın.
function repoRelativePrefix() {
  try {
    return sh("git rev-parse --show-prefix"); // orn: "ajan-filosu/" ya da ""
  } catch (err) {
    console.error("git rev-parse çalıştırılamadı, bir git deposu içinde miyiz?");
    console.error(err.message);
    process.exit(2);
  }
}

function gitStatus() {
  try {
    // -uall sart: varsayilan olarak git, tamami yeni olan bir klasoru tek
    // satira indirir ("?? isler/ornek-is/"). isler/<slug>/ klasorleri kosu
    // sirasinda yeni yaratildigi icin bu tam da bizim durumumuz; o zaman
    // icerideki SONUC.md hic gorunmez ve her is icin yanlis "eksik SONUC.md"
    // uyarisi verilir. "-- ." kapsami calisilan klasorle sinirlar, boylece
    // -uall buyuk bir deponun tamamini taramaz.
    return execSync("git status --porcelain=v1 -uall -- .", { encoding: "utf8" });
  } catch (err) {
    console.error("git status çalıştırılamadı, bir git deposu içinde miyiz?");
    console.error(err.message);
    process.exit(2);
  }
}

function parsePorcelainPath(line) {
  // "XY path" ya da yeniden adlandirmada "XY old -> new"
  const path = line.slice(3).trim();
  const arrowIdx = path.indexOf(" -> ");
  const cleaned = arrowIdx === -1 ? path : path.slice(arrowIdx + 4);
  return cleaned.replace(/^"(.*)"$/, "$1");
}

const prefix = repoRelativePrefix();
const raw = gitStatus();
const changed = raw
  .split("\n")
  .filter(Boolean)
  .map(parsePorcelainPath)
  .filter((p) => p.startsWith(prefix))
  .map((p) => p.slice(prefix.length));

const violations = [];
const writesBySlug = new Map();

for (const path of changed) {
  if (path.startsWith("isler/")) {
    const slug = path.split("/")[1];
    if (!writesBySlug.has(slug)) writesBySlug.set(slug, []);
    writesBySlug.get(slug).push(path);
    continue;
  }
  if (ALLOWED_PREFIXES.some((p) => path.startsWith(p))) continue;
  violations.push(path);
}

// ayni dosyaya iki farkli calisanin dokunmasi: isler/ altinda slug'a gore
// izole oldugu icin yapisal olarak imkansiz; asil risk yukaridaki
// "kendi klasoru disina yazma" ihlalidir.

console.log("# İzolasyon kontrolü\n");
console.log(
  `Kendi klasörü dışına yazan dosya: ${violations.length ? `VAR (${violations.length})` : "yok"}`
);
for (const v of violations) console.log(`  - ${v}`);

console.log(
  `\nDeğişen çalışan klasörleri: ${[...writesBySlug.keys()].join(", ") || "yok"}`
);
for (const [slug, files] of writesBySlug) {
  const hasSonuc = files.some((f) => f.endsWith("/SONUC.md"));
  if (!hasSonuc) {
    console.log(`  - UYARI: isler/${slug}/ için SONUC.md değişikliği görünmüyor.`);
  }
}

console.log(
  `\nEksik SONUC.md: ${
    [...writesBySlug.entries()].filter(([, f]) => !f.some((x) => x.endsWith("/SONUC.md"))).length
      ? "var"
      : "yok"
  }`
);

process.exit(violations.length ? 1 : 0);
