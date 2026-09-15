#!/usr/bin/env node
// Baglam butcesi denetcisi.
//
// "Kapsamli olsun ama verimli olsun" bir tercih degil, olculebilir bir sey.
// Claude Code'da her seyin maliyeti ayni degil:
//
//   HER ISTEKTE yuklenenler  : CLAUDE.md, skill ACIKLAMALARI, subagent
//                              aciklamalari, MCP arac semalari
//   YALNIZ GEREKTIGINDE      : SKILL.md govdeleri, komut govdeleri,
//                              subagent tam istemleri
//
// Ikinci grup pratikte bedavadir: 100 skill eklemek, 100 aciklama kadar yer
// kaplar, 100 govde kadar degil. Asil israf birinci gruptadir. Bu arac ikisini
// ayirip sana sabit maliyetini soyler.
//
// Ayrica en sik yapilan hatayi yakalar: aciklamasi zayif ya da eksik bir skill
// hicbir zaman otomatik secilmez. Yani "kendi ayiklasin" davranisi tam olarak
// o alanda yasar.
//
// Kullanim:
//   node baglam-denetci.mjs [proje-dizini]

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import { homedir } from "node:os";

const projectDir = process.argv[2] || process.cwd();
const userDir = join(homedir(), ".claude");

// Kaba tahmin. Gercek tokenizer degil, buyukluk mertebesi icin yeterli.
const tokens = (chars) => Math.round(chars / 4);
const fmt = (n) => n.toLocaleString("tr-TR");

function readIfExists(path) {
  try {
    if (existsSync(path) && statSync(path).isFile()) return readFileSync(path, "utf8");
  } catch {}
  return null;
}

function dirsIn(path) {
  try {
    return readdirSync(path, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return [];
  }
}

function filesIn(path, ext) {
  try {
    return readdirSync(path, { withFileTypes: true })
      .filter((d) => d.isFile() && d.name.endsWith(ext))
      .map((d) => d.name);
  } catch {
    return [];
  }
}

// --- frontmatter ---------------------------------------------------------

function parseFrontmatter(text) {
  if (!text.startsWith("---")) return { data: {}, body: text };
  const end = text.indexOf("\n---", 3);
  if (end === -1) return { data: {}, body: text };
  const raw = text.slice(3, end);
  const body = text.slice(end + 4);
  const data = {};
  let key = null;
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (m) {
      key = m[1];
      data[key] = m[2].trim().replace(/^["']|["']$/g, "");
    } else if (key && /^\s+\S/.test(line)) {
      // katlanmis cok satirli deger
      data[key] += " " + line.trim();
    }
  }
  return { data, body };
}

// --- toplayicilar --------------------------------------------------------

function collectSkills(root, etiket) {
  const base = join(root, "skills");
  const out = [];
  for (const name of dirsIn(base)) {
    const text = readIfExists(join(base, name, "SKILL.md"));
    if (text === null) continue;
    const { data, body } = parseFrontmatter(text);
    out.push({
      etiket,
      ad: data.name || name,
      aciklama: data.description || "",
      govdeChars: body.length,
      yol: join(base, name, "SKILL.md"),
    });
  }
  return out;
}

function collectAgents(root, etiket) {
  const base = join(root, "agents");
  const out = [];
  for (const file of filesIn(base, ".md")) {
    const text = readIfExists(join(base, file));
    if (text === null) continue;
    const { data, body } = parseFrontmatter(text);
    out.push({
      etiket,
      ad: data.name || basename(file, ".md"),
      aciklama: data.description || "",
      govdeChars: body.length,
    });
  }
  return out;
}

function collectCommands(root, etiket) {
  const base = join(root, "commands");
  let n = 0;
  let chars = 0;
  const walk = (dir) => {
    for (const f of filesIn(dir, ".md")) {
      n++;
      chars += (readIfExists(join(dir, f)) || "").length;
    }
    for (const d of dirsIn(dir)) walk(join(dir, d));
  };
  walk(base);
  return { etiket, sayi: n, chars };
}

function collectMcp() {
  const adaylar = [
    { yol: join(projectDir, ".mcp.json"), etiket: "proje .mcp.json" },
    { yol: join(userDir, "mcp.json"), etiket: "kullanici mcp.json" },
    { yol: join(projectDir, ".claude", "settings.json"), etiket: "proje settings.json" },
    { yol: join(userDir, "settings.json"), etiket: "kullanici settings.json" },
  ];
  const sunucular = [];
  for (const { yol, etiket } of adaylar) {
    const text = readIfExists(yol);
    if (!text) continue;
    try {
      const json = JSON.parse(text);
      for (const ad of Object.keys(json.mcpServers || {})) {
        sunucular.push({ ad, kaynak: etiket });
      }
    } catch {}
  }
  return sunucular;
}

// --- toplama -------------------------------------------------------------

const projeClaudeMd = readIfExists(join(projectDir, "CLAUDE.md")) || "";
const kullaniciClaudeMd = readIfExists(join(userDir, "CLAUDE.md")) || "";

const skills = [
  ...collectSkills(join(projectDir, ".claude"), "proje"),
  ...collectSkills(userDir, "kullanıcı"),
];
const agents = [
  ...collectAgents(join(projectDir, ".claude"), "proje"),
  ...collectAgents(userDir, "kullanıcı"),
];
const commands = [
  collectCommands(join(projectDir, ".claude"), "proje"),
  collectCommands(userDir, "kullanıcı"),
];
const mcp = collectMcp();

// Her istekte yuklenen: CLAUDE.md dosyalari + skill/subagent aciklamalari.
const skillAciklamaChars = skills.reduce((a, s) => a + s.ad.length + s.aciklama.length, 0);
const agentAciklamaChars = agents.reduce((a, s) => a + s.ad.length + s.aciklama.length, 0);
const sabitChars =
  projeClaudeMd.length + kullaniciClaudeMd.length + skillAciklamaChars + agentAciklamaChars;

// Talep uzerine: govdeler.
const skillGovdeChars = skills.reduce((a, s) => a + s.govdeChars, 0);
const agentGovdeChars = agents.reduce((a, s) => a + s.govdeChars, 0);
const komutChars = commands.reduce((a, c) => a + c.chars, 0);
const komutSayi = commands.reduce((a, c) => a + c.sayi, 0);

// --- rapor ---------------------------------------------------------------

const satir = (ad, chars, ek = "") =>
  `  ${ad.padEnd(34)} ${String(fmt(chars)).padStart(9)} krk  ~${String(fmt(tokens(chars))).padStart(7)} token${ek}`;

console.log(`# Bağlam bütçesi\n`);
console.log(`Proje: ${projectDir}\n`);

console.log(`## Her istekte yüklenen (sabit maliyet)\n`);
if (projeClaudeMd) console.log(satir("CLAUDE.md (proje)", projeClaudeMd.length));
if (kullaniciClaudeMd) console.log(satir("CLAUDE.md (kullanıcı)", kullaniciClaudeMd.length));
console.log(satir(`Skill açıklamaları (${skills.length})`, skillAciklamaChars));
console.log(satir(`Subagent açıklamaları (${agents.length})`, agentAciklamaChars));
console.log(`  ${"".padEnd(34)} ${"".padStart(9)}      ${"-".repeat(13)}`);
console.log(satir("TOPLAM", sabitChars));

console.log(`\n## Yalnız gerektiğinde yüklenen (eşleşirse)\n`);
console.log(satir(`${skills.length} skill gövdesi`, skillGovdeChars));
console.log(satir(`${agents.length} subagent istemi`, agentGovdeChars));
console.log(satir(`${komutSayi} slash komutu`, komutChars));
console.log(
  `\n  Bu grup sabit maliyete girmiyor: yalnız o iş için seçildiğinde yükleniyor.`
);
console.log(`  Yani buradaki büyüklük seni yavaşlatmaz, kapsam kazandırır.`);

console.log(`\n## MCP sunucuları\n`);
if (mcp.length === 0) {
  console.log(`  Tanımlı sunucu yok.`);
} else {
  for (const s of mcp) console.log(`  - ${s.ad}  (${s.kaynak})`);
  console.log(
    `\n  DİKKAT: Her MCP sunucusunun araç şeması HER istekte yüklenir; bu grup\n` +
      `  sabit maliyete girer ve bu araç onu ölçemez (sunucuya bağlanmak gerekir).\n` +
      `  Kullanmadığın sunucuyu kapat: en sessiz bağlam israfı buradadır.`
  );
}

// --- uyarilar ------------------------------------------------------------

const uyarilar = [];

for (const s of skills) {
  if (!s.aciklama) {
    uyarilar.push(
      `skill "${s.ad}" (${s.etiket}): description alanı YOK. ` +
        `Bu skill hiçbir zaman kendiliğinden seçilmez, yalnız adıyla çağrılır.`
    );
  } else if (s.aciklama.length < 40) {
    uyarilar.push(
      `skill "${s.ad}" (${s.etiket}): açıklama çok kısa (${s.aciklama.length} krk). ` +
        `Seçim bu metne bakarak yapılır; ne zaman kullanılacağını yazmazsan seçilmez.`
    );
  }
}

for (const a of agents) {
  if (!a.aciklama) {
    uyarilar.push(`subagent "${a.ad}" (${a.etiket}): description alanı YOK, seçilemez.`);
  }
}

const sabitToken = tokens(sabitChars);
if (tokens(projeClaudeMd.length) > 2000) {
  uyarilar.push(
    `CLAUDE.md (proje) ~${fmt(tokens(projeClaudeMd.length))} token. Bu her istekte ödeniyor. ` +
      `Yalnız "bilmezse hata yapar" diyebileceğin kuralları bırak, gerisini skill'e taşı.`
  );
}
if (tokens(kullaniciClaudeMd.length) > 2000) {
  uyarilar.push(
    `CLAUDE.md (kullanıcı) ~${fmt(tokens(kullaniciClaudeMd.length))} token, her projede ödeniyor.`
  );
}

console.log(`\n## Uyarılar\n`);
if (uyarilar.length === 0) {
  console.log(`  Yok. Sabit maliyet ~${fmt(sabitToken)} token.`);
} else {
  for (const u of uyarilar) console.log(`  - ${u}`);
}

console.log(`\n## Özet\n`);
console.log(`  Sabit maliyet      : ~${fmt(sabitToken)} token / her istek`);
console.log(
  `  Talep üzerine hazır: ~${fmt(tokens(skillGovdeChars + agentGovdeChars + komutChars))} token ` +
    `(${skills.length} skill, ${agents.length} subagent, ${komutSayi} komut)`
);
console.log(
  `\n  Doğru şekil budur: sabit maliyet küçük, kapsam büyük. Kapsamı büyütmek\n` +
    `  için sabit maliyeti büyütmen gerekmiyor.`
);

process.exit(uyarilar.length > 0 ? 1 : 0);
