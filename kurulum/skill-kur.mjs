#!/usr/bin/env node
// Skill kurucu · bir depodaki skill'leri ~/.claude/skills/ altina kopyalar.
//
// NEDEN VAR: eklenti sistemi ("/plugin") her ortamda acik degil. Ama skill'ler
// eklentiye ihtiyac duymaz: ~/.claude/skills/<ad>/SKILL.md yolundaki her skill
// Claude Code tarafindan KENDILIGINDEN kesfedilir. Ne pazar yeri, ne kurulum
// adimi, ne settings.json kaydi gerekir. Yani "/plugin" calismasa da ayni
// sonuca varilir.
//
// VARSAYILAN: kuru kosu. Ne kuracagini ve her skill'in ne ise yaradigini yazar,
// hicbir dosyaya dokunmaz.
//
// Kullanim:
//   node kurulum/skill-kur.mjs <kaynak-dizin>
//   node kurulum/skill-kur.mjs <kaynak-dizin> --uygula
//   node kurulum/skill-kur.mjs <kaynak-dizin> --uygula --uzerine-yaz
//
// Ornek:
//   git clone https://github.com/obra/superpowers
//   node kurulum/skill-kur.mjs superpowers

import { readFileSync, existsSync, readdirSync, mkdirSync, cpSync, statSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import { homedir } from "node:os";

const args = process.argv.slice(2);
const UYGULA = args.includes("--uygula");
const UZERINE = args.includes("--uzerine-yaz");
const kaynakArg = args.find((a) => !a.startsWith("--"));

// --sec xlsx,docx,pdf  →  yalniz bu skill'leri kur.
// Bir depoda ise yaramayan 15 skill varsa hepsini kurmanin anlami yok:
// her biri kucuk de olsa sabit maliyete yazilir ve secim listesini
// kalabaliklastirir.
const secArg = args.find((a) => a.startsWith("--sec"));
let secilenler = null;
if (secArg) {
  const deger = secArg.includes("=")
    ? secArg.split("=")[1]
    : args[args.indexOf(secArg) + 1];
  if (!deger || deger.startsWith("--")) {
    console.error("--sec kullanımı: --sec xlsx,docx,pdf");
    process.exit(2);
  }
  secilenler = new Set(deger.split(",").map((s) => s.trim()).filter(Boolean));
}

if (!kaynakArg) {
  console.error(
    "Kullanım: node kurulum/skill-kur.mjs <kaynak-dizin> [--uygula] [--uzerine-yaz]\n\n" +
      "Örnek:\n" +
      "  git clone https://github.com/obra/superpowers\n" +
      "  node kurulum/skill-kur.mjs superpowers"
  );
  process.exit(2);
}

const kaynak = resolve(kaynakArg);
const HEDEF = join(homedir(), ".claude", "skills");

if (!existsSync(kaynak)) {
  console.error(`Kaynak dizin bulunamadı: ${kaynak}`);
  process.exit(2);
}

// skills/ alt klasoru varsa oradan, yoksa dizinin kendisinden oku.
const kok = existsSync(join(kaynak, "skills")) ? join(kaynak, "skills") : kaynak;

function frontmatterDescription(text) {
  if (!text.startsWith("---")) return "";
  const son = text.indexOf("\n---", 3);
  if (son === -1) return "";
  const blok = text.slice(3, son);
  const m = blok.match(/^description:\s*(.*)$/m);
  if (!m) return "";
  return m[1].trim().replace(/^["']|["']$/g, "");
}

const bulunan = [];
const elenen = [];
for (const ad of readdirSync(kok, { withFileTypes: true })) {
  if (!ad.isDirectory()) continue;
  const skillMd = join(kok, ad.name, "SKILL.md");
  if (!existsSync(skillMd)) continue;
  if (secilenler && !secilenler.has(ad.name)) {
    elenen.push(ad.name);
    continue;
  }
  const metin = readFileSync(skillMd, "utf8");
  bulunan.push({
    ad: ad.name,
    aciklama: frontmatterDescription(metin),
    kaynakYol: join(kok, ad.name),
    hedefYol: join(HEDEF, ad.name),
  });
}

if (bulunan.length === 0) {
  if (secilenler) {
    console.error(
      `--sec ile istediğin skill'ler bulunamadı: ${[...secilenler].join(", ")}\n` +
        `${kok} altındaki mevcut skill'ler: ${elenen.join(", ") || "yok"}`
    );
  } else {
    console.error(
      `${kok} altında skill bulunamadı.\n` +
        `Beklenen yapı: <kaynak>/skills/<ad>/SKILL.md ya da <kaynak>/<ad>/SKILL.md`
    );
  }
  process.exit(2);
}

if (secilenler) {
  const eksik = [...secilenler].filter((s) => !bulunan.some((b) => b.ad === s));
  if (eksik.length > 0) {
    console.error(`UYARI: şu isimler kaynakta yok: ${eksik.join(", ")}\n`);
  }
}

console.log(
  UYGULA ? "# Skill kurulumu · UYGULANIYOR\n" : "# Skill kurulumu · kuru koşu\n"
);
console.log(`Kaynak: ${kok}`);
console.log(`Hedef : ${HEDEF}\n`);
console.log(`${bulunan.length} skill seçildi.`);
if (elenen.length > 0) {
  console.log(`${elenen.length} skill --sec dışında kaldı, kurulmayacak.`);
}
console.log("");

const catisan = [];
for (const s of bulunan) {
  const varMi = existsSync(s.hedefYol);
  if (varMi) catisan.push(s.ad);
  const durum = varMi ? (UZERINE ? "ÜZERİNE YAZILACAK" : "ATLANACAK (zaten var)") : "kurulacak";
  console.log(`  ${s.ad}  ·  ${durum}`);
  if (s.aciklama) {
    const kisa = s.aciklama.length > 150 ? s.aciklama.slice(0, 150) + "..." : s.aciklama;
    console.log(`      ${kisa}`);
  } else {
    console.log(
      `      UYARI: description alanı yok. Bu skill kendiliğinden seçilmez.`
    );
  }
}

if (catisan.length > 0 && !UZERINE) {
  console.log(
    `\n  ${catisan.length} skill zaten kurulu, dokunulmayacak: ${catisan.join(", ")}`
  );
  console.log(`  Üzerine yazmak istersen --uzerine-yaz ekle.`);
}

let kurulan = 0;
if (UYGULA) {
  mkdirSync(HEDEF, { recursive: true });
  for (const s of bulunan) {
    if (existsSync(s.hedefYol) && !UZERINE) continue;
    cpSync(s.kaynakYol, s.hedefYol, { recursive: true });
    kurulan++;
  }
  console.log(`\n${kurulan} skill kuruldu.`);

  // Dogrulama: hedefte gercekten okunabilir SKILL.md var mi.
  let saglam = 0;
  for (const s of bulunan) {
    const md = join(s.hedefYol, "SKILL.md");
    if (existsSync(md) && statSync(md).isFile()) saglam++;
  }
  console.log(`Doğrulama: ${saglam}/${bulunan.length} skill hedefte okunabilir durumda.`);
  if (saglam < bulunan.length) {
    console.error("\nBazı skill'ler hedefe ulaşmadı, yukarıdaki listeyi kontrol et.");
    process.exit(1);
  }

  console.log(
    `\nClaude Code'u yeniden başlat (ya da yeni oturum aç). Skill'ler\n` +
      `kendiliğinden keşfedilir, ayrıca bir şey yapman gerekmez.\n\n` +
      `Kontrol: node kurulum/scripts/baglam-denetci.mjs`
  );
} else {
  console.log(`\n---`);
  console.log(`Bu bir kuru koşuydu, hiçbir dosyaya dokunulmadı. Uygulamak için:\n`);
  console.log(`  node ${process.argv[1].startsWith(process.cwd()) ? process.argv[1].slice(process.cwd().length + 1) : process.argv[1]} ${kaynakArg} --uygula`);
}
