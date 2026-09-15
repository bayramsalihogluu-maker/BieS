#!/usr/bin/env node
// Kurulum betigi · ~/.claude altina hook kurar ve settings.json'a birlestirir.
//
// VARSAYILAN: kuru kosu. Hicbir dosyaya dokunmaz, ne yapacagini yazar.
// Gercekten uygulamak icin:  node kurulum/kur.mjs --uygula
//
// Tasarim kararlari:
//   - settings.json UZERINE YAZILMAZ. Var olan JSON okunur, yalniz hooks
//     anahtari birlestirilir, once zaman damgali yedek alinir.
//   - Idempotent: iki kez calistirmak ayni hook'u iki kez eklemez.
//   - Yonlendirici opt-in. Skill secimi zaten aciklamalar uzerinden calisir;
//     bu yalnizca ek bir durtme, varsayilan olarak kurulmaz.
//   - Kurulum sonrasi sir tarayici gercek girdiyle test edilir. Gecmezse
//     betik hata koduyla biter, "kuruldu" demez.

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { execFileSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const CLAUDE = join(homedir(), ".claude");
const SCRIPTS = join(CLAUDE, "hooks", "scripts");
const SETTINGS = join(CLAUDE, "settings.json");

const args = process.argv.slice(2);
const UYGULA = args.includes("--uygula");
const YONLENDIRICI = args.includes("--yonlendirici");

const yapilacak = [];
const not = (s) => yapilacak.push(s);

console.log(
  UYGULA
    ? "# Kurulum · UYGULANIYOR\n"
    : "# Kurulum · kuru koşu (hiçbir dosyaya dokunulmuyor)\n"
);
console.log(`Hedef: ${CLAUDE}\n`);

// --- 0. on kontrol -------------------------------------------------------
// settings.json'i HER SEYDEN ONCE ayristir. Bozuksa hicbir sey kopyalamadan
// cik, yarim kurulum birakma.

let ayarlar = {};
let mevcutMetin = null;
if (existsSync(SETTINGS)) {
  mevcutMetin = readFileSync(SETTINGS, "utf8");
  try {
    ayarlar = JSON.parse(mevcutMetin);
  } catch {
    console.error(
      `HATA: ${SETTINGS} geçerli JSON değil. Elle düzelt, sonra tekrar çalıştır.\n` +
        `Bozuk bir dosyayı ayrıştırıp üzerine yazmak ayarlarını kaybettirir.\n` +
        `Hiçbir dosyaya dokunulmadı.`
    );
    process.exit(2);
  }
}

// --- 1. hook betikleri ---------------------------------------------------

const kopyalanacak = [
  { ad: "secret-scanner.js", zorunlu: true },
  ...(YONLENDIRICI ? [{ ad: "skill-yonlendirici.js", zorunlu: false }] : []),
];

console.log("## 1 · Hook betikleri\n");
for (const { ad } of kopyalanacak) {
  const kaynak = join(HERE, "hooks", "scripts", ad);
  const hedef = join(SCRIPTS, ad);
  if (!existsSync(kaynak)) {
    console.error(`  HATA: kaynak bulunamadı: ${kaynak}`);
    process.exit(2);
  }
  const durum = existsSync(hedef) ? "üzerine yazılacak" : "kopyalanacak";
  console.log(`  ${ad}  →  ${hedef}  (${durum})`);
  not(`kopyala: ${ad}`);
  if (UYGULA) {
    mkdirSync(SCRIPTS, { recursive: true });
    copyFileSync(kaynak, hedef);
  }
}

// --- 2. settings.json birlestirme ---------------------------------------

console.log("\n## 2 · settings.json\n");

// Exec bicimi kullaniliyor: command = calistirilabilir, args = duz argumanlar.
// Kabuk devreye girmedigi icin tirnak, bosluk ve degisken genisletme sorunu
// olmuyor. Yol kurulum aninda MUTLAK olarak cozuluyor; "$HOME" yazmak
// Windows'ta cmd.exe'ye dusulurse cozulmez, boylece o risk tamamen kalkiyor.
// settings.json zaten makineye ozel bir dosya, mutlak yol tasimasi normaldir.
function hookGirdisi(komut, ek = {}) {
  return {
    type: "command",
    command: "node",
    args: [join(SCRIPTS, komut)],
    ...ek,
  };
}

const eklenecek = {
  PreToolUse: {
    matcher: "Write|Edit",
    hooks: [
      hookGirdisi("secret-scanner.js", {
        timeout: 10,
        statusMessage: "Sir taramasi yapiliyor...",
      }),
    ],
  },
  ...(YONLENDIRICI
    ? {
        UserPromptSubmit: {
          hooks: [hookGirdisi("skill-yonlendirici.js", { timeout: 5 })],
        },
      }
    : {}),
};

if (mevcutMetin !== null) {
  console.log(`  Mevcut settings.json okundu (${mevcutMetin.length} karakter).`);
} else {
  console.log(`  settings.json yok, yeni oluşturulacak.`);
}

ayarlar.hooks = ayarlar.hooks || {};
let degisiklik = 0;

for (const [olay, grup] of Object.entries(eklenecek)) {
  ayarlar.hooks[olay] = ayarlar.hooks[olay] || [];
  // Idempotentlik betik YOLUNA gore belirlenir, komuta gore degil: exec
  // biciminde command her zaman "node", ayirt eden sey args[0].
  // Eski surumun yazdigi kabuk biciminde ("node \"$HOME/...\"") yol
  // command icinde gecer; ikisini de yakalamak icin her iki alana da bak.
  const hedefYol = grup.hooks[0].args[0];
  const betikAdi = basename(hedefYol);
  const zatenVar = ayarlar.hooks[olay].some((g) =>
    (g.hooks || []).some(
      (h) =>
        (Array.isArray(h.args) && h.args.some((a) => String(a).endsWith(betikAdi))) ||
        (typeof h.command === "string" && h.command.includes(betikAdi))
    )
  );
  if (zatenVar) {
    console.log(`  ${olay}: zaten kurulu, atlanıyor.`);
  } else {
    console.log(`  ${olay}: eklenecek (mevcut ${ayarlar.hooks[olay].length} girdi korunuyor).`);
    ayarlar.hooks[olay].push(grup);
    degisiklik++;
  }
}

if (degisiklik === 0) {
  console.log(`\n  settings.json değişmiyor.`);
} else if (UYGULA) {
  if (mevcutMetin !== null) {
    const yedek = `${SETTINGS}.yedek-${new Date().toISOString().replace(/[:.]/g, "-")}`;
    writeFileSync(yedek, mevcutMetin);
    console.log(`\n  Yedek alındı: ${yedek}`);
  }
  mkdirSync(CLAUDE, { recursive: true });
  writeFileSync(SETTINGS, JSON.stringify(ayarlar, null, 2) + "\n");
  console.log(`  Yazıldı: ${SETTINGS}`);
} else {
  console.log(`\n  (kuru koşu: yazılmadı)`);
}

// --- 3. dogrulama --------------------------------------------------------

console.log("\n## 3 · Doğrulama\n");

if (!UYGULA) {
  console.log("  Kuru koşuda atlanıyor.");
} else {
  const hedef = join(SCRIPTS, "secret-scanner.js");
  const girdi = JSON.stringify({
    tool_name: "Write",
    tool_input: { file_path: "/tmp/kurulum-testi.js", content: 'k="AKIAIOSFODNN7EXAMPLQ"' },
  });
  let kod = 0;
  let cikti = "";
  try {
    cikti = execFileSync("node", [hedef], { input: girdi, encoding: "utf8" });
  } catch (e) {
    kod = e.status;
    cikti = e.stdout || "";
  }
  const gecti = kod === 2 && cikti.includes('"deny"');
  console.log(`  Sır tarayıcı testi: ${gecti ? "GEÇTİ" : "BAŞARISIZ"} (çıkış kodu ${kod})`);
  if (!gecti) {
    console.error(
      `\n  Hook beklendiği gibi engellemedi. Node sürümünü kontrol et (18+ gerekir).`
    );
    process.exit(1);
  }
}

// --- 4. sonraki adimlar --------------------------------------------------

console.log("\n## 4 · Bundan sonrası (Claude Code içinde yazacakların)\n");
console.log("  Bu betiğin yapamayacağı kısım; eklentiler Claude Code'un kendi");
console.log("  komutlarıyla kurulur:\n");
console.log("    /plugin marketplace add anthropics/claude-plugins-official");
console.log("    /plugin install code-review@claude-plugins-official");
console.log("    /plugin marketplace add obra/superpowers");
console.log("    /plugin install superpowers@superpowers\n");
console.log("  Sonra bağlam maliyetini ölç:\n");
console.log("    node kurulum/scripts/baglam-denetci.mjs\n");

if (!UYGULA) {
  console.log("---");
  console.log("Bu bir kuru koşuydu. Uygulamak için:\n");
  console.log(`  node ${process.argv[1].replace(homedir(), "~")} --uygula`);
  console.log(`  node ${process.argv[1].replace(homedir(), "~")} --uygula --yonlendirici   (skill yönlendirici de istiyorsan)\n`);
}
